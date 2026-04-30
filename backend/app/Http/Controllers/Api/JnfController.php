<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Jnf;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class JnfController extends Controller
{
    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/jnfs — list
    // ──────────────────────────────────────────────────────────────────────────
    public function index()
    {
        $user = Auth::user();
        if ($user->role === 'admin') {
            return response()->json(Jnf::with('user')->latest()->get());
        }
        return response()->json(Jnf::where('user_id', $user->id)->latest()->get());
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/jnfs — create a new draft
    // ──────────────────────────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $jnf = Auth::user()->jnfs()->create([
            'company_name' => $request->input('company_name', 'Draft'),
            'status'       => 'draft',
        ]);

        return response()->json(['message' => 'Draft created', 'data' => $jnf], 201);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // GET /api/jnfs/{jnf}
    // ──────────────────────────────────────────────────────────────────────────
    public function show(Jnf $jnf)
    {
        $this->authorizeAccess($jnf);
        return response()->json($jnf->load('user'));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // PATCH /api/jnfs/{jnf}/draft — save step progress (no strict validation)
    // ──────────────────────────────────────────────────────────────────────────
    public function saveDraft(Request $request, Jnf $jnf)
    {
        $this->authorizeOwner($jnf);

        $user = Auth::user();
        if ($jnf->isSubmitted() && !$jnf->canRecruiterEdit($user)) {
            return response()->json(['message' => 'Edit limit reached. Request admin to unlock.'], 403);
        }

        $data = $this->prepareData($request);
        $jnf->update($data);

        return response()->json(['message' => 'Draft saved', 'data' => $jnf]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // POST /api/jnfs/{jnf}/submit — finalize & submit
    // ──────────────────────────────────────────────────────────────────────────
    public function submit(Request $request, Jnf $jnf)
    {
        $this->authorizeOwner($jnf);
        $user = Auth::user();

        if ($jnf->isSubmitted() && !$jnf->canRecruiterEdit($user)) {
            return response()->json(['message' => 'Form already submitted and edit count exhausted.'], 403);
        }

        $data = $this->prepareData($request);
        
        $editCount = $jnf->isSubmitted() ? $jnf->edit_count + 1 : $jnf->edit_count;

        $jnf->update(array_merge(
            $data,
            [
                'status'       => 'submitted',
                'submitted_at' => now(),
                'edit_count'   => $editCount,
            ]
        ));

        $company = $jnf->company_name ?? 'Your Company';
        $title   = $jnf->job_title ?? 'Job Profile';
        $refId   = 'JNF-' . str_pad($jnf->id, 5, '0', STR_PAD_LEFT);

        // Send confirmation email to the recruiter (in-app + SMTP)
        NotificationService::send(
            userId:    $user->id,
            senderId:  null,
            type:      'system',
            title:     'JNF Submitted Successfully',
            message:   "Your Job Notification Form ({$refId}) for {$company} has been submitted to IIT (ISM) Dhanbad CDC. The CDC team will review your form within 2-3 working days.",
            formType:  'jnf',
            formId:    $jnf->id,
            sendEmail: true,
            emailType: 'form_submitted',
            emailMeta: [
                'Reference ID'  => $refId,
                'Company'       => $company,
                'Job Title'     => $title,
                'Submitted On'  => now()->format('d M Y, h:i A'),
                'cta_url'       => config('app.url') . '/dashboard',
                'cta_label'     => 'View in Dashboard',
            ]
        );

        // Notify all Admins (in-app + SMTP)
        NotificationService::notifyAdmins(
            type:      'system',
            title:     'New JNF Submitted',
            message:   "{$user->organisation} has submitted a new JNF: {$title}",
            formType:  'jnf',
            formId:    $jnf->id,
            sendEmail: true,
            emailType: 'form_submitted',
            emailMeta: [
                'Reference ID'  => $refId,
                'Company'       => $company,
                'Job Title'     => $title,
                'Recruiter'     => $user->name . ' (' . $user->email . ')',
                'Submitted On'  => now()->format('d M Y, h:i A'),
                'cta_url'       => config('app.url') . '/admin',
                'cta_label'     => 'Review in Admin Panel',
            ]
        );

        return response()->json([
            'message' => 'JNF submitted successfully. Confirmation email sent.',
            'data'    => $jnf->load('user'),
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // PUT /api/jnfs/{jnf} — admin or unlocked recruiter full update
    // ──────────────────────────────────────────────────────────────────────────
    public function update(Request $request, Jnf $jnf)
    {
        $this->authorizeAccess($jnf);
        $user = Auth::user();

        if ($user->role === 'recruiter') {
            if ($jnf->isSubmitted() && $jnf->edit_count >= 1) {
                return response()->json(['message' => 'Edit limit reached. Request admin to unlock.'], 403);
            }
            $jnf->increment('edit_count');
        }

        $jnf->update($request->all());

        return response()->json(['message' => 'JNF updated', 'data' => $jnf]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // DELETE /api/jnfs/{jnf} — admin only
    // ──────────────────────────────────────────────────────────────────────────
    public function destroy(Jnf $jnf)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $jnf->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────────
    private function authorizeAccess(Jnf $jnf): void
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $jnf->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }
    }

    private function authorizeOwner(Jnf $jnf): void
    {
        if ($jnf->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
    }

    private function prepareData(Request $request)
    {
        $data = $request->except(['_token', '_method']);

        // Handle file uploads
        if ($request->hasFile('logo')) {
            $data['logo_path'] = $request->file('logo')->store('jnf/logos', 'public');
            unset($data['logo']);
        }
        if ($request->hasFile('brochure_pdf')) {
            $data['brochure_path'] = $request->file('brochure_pdf')->store('jnf/brochures', 'public');
            unset($data['brochure_pdf']);
        }
        if ($request->hasFile('jd_pdf')) {
            $data['jd_pdf_path'] = $request->file('jd_pdf')->store('jnf/jd', 'public');
            unset($data['jd_pdf']);
        }

        // Decode JSON strings from FormData
        $jsonFields = [
            'industry_sectors', 'head_ta', 'poc1', 'poc2',
            'required_skills', 'eligibility', 'salary', 'additional_salary',
            'selection_stages', 'test_rounds', 'interview_rounds', 'interview_modes',
            'declarations',
        ];
        foreach ($jsonFields as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $decoded = json_decode($data[$field], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $data[$field] = $decoded;
                }
            }
        }

        // Convert "true"/"false" strings → 1/0 for MySQL tinyint boolean columns
        $boolFields = ['psychometric_test', 'medical_test', 'rti_nirf_consent'];
        foreach ($boolFields as $field) {
            if (isset($data[$field])) {
                $data[$field] = filter_var($data[$field], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
            }
        }

        // Sanitize date fields — take only YYYY-MM-DD part, null if empty
        $dateFields = ['date_of_establishment', 'signatory_date'];
        foreach ($dateFields as $field) {
            if (isset($data[$field])) {
                $val = trim($data[$field]);
                $data[$field] = ($val === '' || $val === '0000-00-00') ? null : substr($val, 0, 10);
            }
        }

        // Cast numeric fields to int; null if empty
        $intFields = ['expected_hires', 'min_hires'];
        foreach ($intFields as $field) {
            if (isset($data[$field])) {
                $data[$field] = ($data[$field] !== '' && $data[$field] !== null) ? (int) $data[$field] : null;
            }
        }

        return $data;
    }
}
