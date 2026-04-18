<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Jnf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
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

        // Don't allow re-saving a fully submitted form if edit is locked
        $user = Auth::user();
        if ($jnf->isSubmitted() && !$jnf->canRecruiterEdit($user)) {
            return response()->json(['message' => 'Edit limit reached. Request admin to unlock.'], 403);
        }

        $data = $request->except(['_token', '_method']);

        // Handle file uploads
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('jnf/logos', 'public');
            $data['logo_path'] = $path;
            unset($data['logo']);
        }
        if ($request->hasFile('brochure_pdf')) {
            $path = $request->file('brochure_pdf')->store('jnf/brochures', 'public');
            $data['brochure_path'] = $path;
            unset($data['brochure_pdf']);
        }
        if ($request->hasFile('jd_pdf')) {
            $path = $request->file('jd_pdf')->store('jnf/jd', 'public');
            $data['jd_pdf_path'] = $path;
            unset($data['jd_pdf']);
        }

        // Decode JSON strings that arrive as strings
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

        // Already submitted and edit-locked?
        if ($jnf->isSubmitted() && !$jnf->canRecruiterEdit($user)) {
            return response()->json(['message' => 'Form already submitted and edit count exhausted.'], 403);
        }

        // Basic required-field validation
        $request->validate([
            'company_name'        => 'required|string',
            'job_title'           => 'required|string',
            'signatory_name'      => 'required|string',
            'typed_signature'     => 'required|string',
        ]);

        // Increment edit count if this is a re-submission
        $editCount = $jnf->isSubmitted() ? $jnf->edit_count + 1 : $jnf->edit_count;

        $jnf->update(array_merge(
            $request->except(['_token', '_method']),
            [
                'status'       => 'submitted',
                'submitted_at' => now(),
                'edit_count'   => $editCount,
            ]
        ));

        // Send confirmation email to the recruiter
        $this->sendConfirmationEmail($jnf, $user);

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

    private function sendConfirmationEmail(Jnf $jnf, $user): void
    {
        try {
            $to      = $user->email;
            $company = $jnf->company_name ?? 'Your Company';
            $title   = $jnf->job_title ?? 'Job Profile';
            $refId   = 'JNF-' . str_pad($jnf->id, 5, '0', STR_PAD_LEFT);

            Mail::raw(
                "Dear {$user->name},\n\n" .
                "Your Job Notification Form has been successfully submitted to IIT (ISM) Dhanbad CDC.\n\n" .
                "Reference ID : {$refId}\n" .
                "Company      : {$company}\n" .
                "Job Title    : {$title}\n" .
                "Submitted on : " . now()->format('d M Y, h:i A') . "\n\n" .
                "The CDC team will review your form and contact you within 2-3 working days.\n\n" .
                "Regards,\nCDC Team, IIT (ISM) Dhanbad\ndhanbad.iitism.ac.in",
                fn($mail) => $mail
                    ->to($to)
                    ->subject("[{$refId}] JNF Submission Confirmed — IIT (ISM) Dhanbad CDC")
                    ->from(config('mail.from.address'), 'CDC IIT (ISM) Dhanbad')
            );
        } catch (\Throwable $e) {
            // Email failure should not fail the submission
            \Log::warning('JNF confirmation email failed: ' . $e->getMessage());
        }
    }
}
