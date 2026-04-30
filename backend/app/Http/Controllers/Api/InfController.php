<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inf;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InfController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if ($user->role === 'admin') {
            return Inf::with('user')->latest()->get();
        }
        return Inf::where('user_id', $user->id)->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $this->prepareData($request);
        $inf = Auth::user()->infs()->create(array_merge($data, ['status' => 'draft']));

        return response()->json([
            'message' => 'Draft created successfully',
            'data' => $inf
        ], 201);
    }

    public function show(Inf $inf)
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $inf->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return $inf->load('user');
    }

    public function update(Request $request, Inf $inf)
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $inf->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($user->role === 'recruiter' && $inf->isSubmitted() && $inf->edit_count >= 1) {
            return response()->json(['message' => 'Edit limit reached.'], 403);
        }

        $data = $this->prepareData($request);
        $inf->update($data);

        return response()->json([
            'message' => 'INF updated successfully',
            'data' => $inf
        ]);
    }

    public function submit(Request $request, Inf $inf)
    {
        $user = Auth::user();
        if ($inf->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($inf->isSubmitted() && $inf->edit_count >= 1) {
            return response()->json(['message' => 'Form locked.'], 403);
        }

        $data = $this->prepareData($request);
        
        // Increment edit count if this is a re-submission
        $editCount = $inf->isSubmitted() ? $inf->edit_count + 1 : $inf->edit_count;

        $inf->update(array_merge($data, [
            'status' => 'submitted',
            'submitted_at' => now(),
            'edit_count' => $editCount
        ]));

        $company = $inf->company_name ?? 'Your Company';
        $profile = $inf->profile_name ?? 'Internship Profile';
        $refId   = 'INF-' . str_pad($inf->id, 5, '0', STR_PAD_LEFT);

        // Confirm to recruiter (in-app + SMTP)
        NotificationService::send(
            userId:    $user->id,
            senderId:  null,
            type:      'system',
            title:     'INF Submitted Successfully',
            message:   "Your Internship Notification Form ({$refId}) for {$company} has been submitted to IIT (ISM) Dhanbad CDC. The CDC team will review your form within 2-3 working days.",
            formType:  'inf',
            formId:    $inf->id,
            sendEmail: true,
            emailType: 'form_submitted',
            emailMeta: [
                'Reference ID'  => $refId,
                'Company'       => $company,
                'Profile'       => $profile,
                'Submitted On'  => now()->format('d M Y, h:i A'),
                'cta_url'       => config('app.url') . '/dashboard',
                'cta_label'     => 'View in Dashboard',
            ]
        );

        // Notify all Admins (in-app + SMTP)
        NotificationService::notifyAdmins(
            type:      'system',
            title:     'New INF Submitted',
            message:   "{$user->organisation} has submitted a new INF: {$profile}",
            formType:  'inf',
            formId:    $inf->id,
            sendEmail: true,
            emailType: 'form_submitted',
            emailMeta: [
                'Reference ID'  => $refId,
                'Company'       => $company,
                'Profile'       => $profile,
                'Recruiter'     => $user->name . ' (' . $user->email . ')',
                'Submitted On'  => now()->format('d M Y, h:i A'),
                'cta_url'       => config('app.url') . '/admin',
                'cta_label'     => 'Review in Admin Panel',
            ]
        );

        return response()->json(['message' => 'INF submitted successfully.', 'data' => $inf->load('user')]);
    }

    private function prepareData(Request $request)
    {
        $data = $request->except(['_token', '_method']);

        // Handle file uploads
        if ($request->hasFile('logo')) {
            $data['logo_path'] = $request->file('logo')->store('inf/logos', 'public');
            unset($data['logo']);
        }
        if ($request->hasFile('jd_pdf')) {
            $data['jd_pdf_path'] = $request->file('jd_pdf')->store('inf/jds', 'public');
            unset($data['jd_pdf']);
        }

        // Decode JSON strings from FormData
        $jsonFields = [
            'industry_sectors', 'head_hr', 'poc1', 'poc2',
            'required_skills', 'eligibility', 'stipend', 'per_prog_additional',
            'selection_stages', 'interview_modes', 'test_rounds', 'interview_rounds',
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

        return $data;
    }
}
