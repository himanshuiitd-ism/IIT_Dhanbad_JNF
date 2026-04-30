<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EditRequest;
use App\Models\Jnf;
use App\Models\Inf;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EditRequestController extends Controller
{
    /**
     * Recruiter submits an edit request for a locked form.
     */
    public function store(Request $request)
    {
        $request->validate([
            'form_type' => 'required|in:jnf,inf',
            'form_id'   => 'required|integer',
            'reason'    => 'required|string|max:500',
        ]);

        $user = Auth::user();

        // Verify ownership
        if ($request->form_type === 'jnf') {
            $form = Jnf::where('id', $request->form_id)->where('user_id', $user->id)->firstOrFail();
        } else {
            $form = Inf::where('id', $request->form_id)->where('user_id', $user->id)->firstOrFail();
        }

        // Prevent duplicate pending requests
        $existing = EditRequest::where('user_id', $user->id)
            ->where('form_type', $request->form_type)
            ->where('form_id', $request->form_id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'A request is already pending for this form.'], 409);
        }

        $editRequest = EditRequest::create([
            'user_id'   => $user->id,
            'form_type' => $request->form_type,
            'form_id'   => $request->form_id,
            'reason'    => $request->reason,
            'status'    => 'pending',
        ]);

        $formLabel = strtoupper($request->form_type);
        $company   = $form->company_name ?? 'Unknown';

        // Notify admins about new edit request (in-app + SMTP)
        NotificationService::notifyAdmins(
            type:      'edit_request',
            title:     "Edit Request — {$formLabel}",
            message:   "{$user->name} ({$user->organisation}) is requesting edit access for {$formLabel} #{$request->form_id} ({$company}). Reason: {$request->reason}",
            formType:  $request->form_type,
            formId:    (int) $request->form_id,
            sendEmail: true,
            emailType: 'edit_request',
            emailMeta: [
                'Recruiter'  => $user->name . ' (' . $user->email . ')',
                'Form'       => "{$formLabel} #{$request->form_id}",
                'Company'    => $company,
                'Reason'     => $request->reason,
                'cta_url'    => config('app.url') . '/admin',
                'cta_label'  => 'Review Request',
            ]
        );

        return response()->json([
            'message' => 'Edit request submitted. You will be notified once the admin reviews it.',
            'data'    => $editRequest,
        ], 201);
    }

    /**
     * Admin fetches all pending edit requests.
     */
    public function index()
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $requests = EditRequest::with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($req) {
                $form = null;
                if ($req->form_type === 'jnf') {
                    $form = Jnf::find($req->form_id);
                } else {
                    $form = Inf::find($req->form_id);
                }
                $req->form_title = $form
                    ? ($form->job_designation ?? $form->internship_designation ?? $form->company_name)
                    : 'Unknown';
                return $req;
            });

        return response()->json($requests);
    }

    /**
     * Recruiter views their own edit requests.
     */
    public function myRequests()
    {
        return response()->json(
            EditRequest::where('user_id', Auth::id())->orderBy('updated_at', 'desc')->get()
        );
    }

    /**
     * Admin approves an edit request → reset edit_count on form + email recruiter.
     */
    public function approve(Request $request, EditRequest $editRequest)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'admin_note' => 'nullable|string|max:500',
        ]);

        // Reset the edit count on the relevant form
        if ($editRequest->form_type === 'jnf') {
            Jnf::where('id', $editRequest->form_id)->update(['edit_count' => 0]);
        } else {
            Inf::where('id', $editRequest->form_id)->update(['edit_count' => 0]);
        }

        $editRequest->update([
            'status'     => 'approved',
            'admin_note' => $request->admin_note,
        ]);

        $formType  = strtoupper($editRequest->form_type);
        $adminNote = $request->admin_note ?: 'No additional comments.';

        // Notify recruiter (in-app + SMTP)
        NotificationService::send(
            userId:    $editRequest->user_id,
            senderId:  Auth::id(),
            type:      'edit_request',
            title:     "Edit Request Approved — {$formType}",
            message:   "Your edit request for {$formType} (ID: {$editRequest->form_id}) has been APPROVED. You may now edit the form once. Admin note: {$adminNote}",
            formType:  $editRequest->form_type,
            formId:    (int) $editRequest->form_id,
            sendEmail: true,
            emailType: 'edit_request_approved',
            emailMeta: [
                'Form'        => "{$formType} #{$editRequest->form_id}",
                'Status'      => 'APPROVED',
                'Admin Note'  => $adminNote,
                'cta_url'     => config('app.url') . '/dashboard',
                'cta_label'   => 'Edit Your Form',
            ]
        );

        return response()->json(['message' => 'Request approved and recruiter notified.']);
    }

    /**
     * Admin rejects an edit request.
     */
    public function reject(Request $request, EditRequest $editRequest)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'admin_note' => 'nullable|string|max:500',
        ]);

        $editRequest->update([
            'status'     => 'rejected',
            'admin_note' => $request->admin_note,
        ]);

        $formType  = strtoupper($editRequest->form_type);
        $adminNote = $request->admin_note ?: 'Not specified.';

        // Notify recruiter (in-app + SMTP)
        NotificationService::send(
            userId:    $editRequest->user_id,
            senderId:  Auth::id(),
            type:      'edit_request',
            title:     "Edit Request Declined — {$formType}",
            message:   "Your edit request for {$formType} (ID: {$editRequest->form_id}) has been DECLINED. Reason: {$adminNote}. For clarification, contact placement@iitism.ac.in.",
            formType:  $editRequest->form_type,
            formId:    (int) $editRequest->form_id,
            sendEmail: true,
            emailType: 'edit_request_rejected',
            emailMeta: [
                'Form'        => "{$formType} #{$editRequest->form_id}",
                'Status'      => 'REJECTED',
                'Reason'      => $adminNote,
                'cta_url'     => config('app.url') . '/dashboard',
                'cta_label'   => 'View Dashboard',
            ]
        );

        return response()->json(['message' => 'Request rejected and recruiter notified.']);
    }
}
