<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Jnf;
use App\Models\Inf;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class AdminController extends Controller
{
    /**
     * Get dashboard statistics for Admin.
     */
    public function getStats()
    {
        $stats = [
            'total_users'     => User::where('role', 'recruiter')->count(),
            'total_jnfs'      => Jnf::count(),
            'total_infs'      => Inf::count(),
            'pending_jnfs'    => Jnf::whereIn('status', ['SUBMITTED', 'PENDING'])->count(),
            'pending_infs'    => Inf::whereIn('status', ['SUBMITTED', 'PENDING'])->count(),
            'approved_jnfs'   => Jnf::where('status', 'APPROVED')->count(),
            'approved_infs'   => Inf::where('status', 'APPROVED')->count(),
            'rejected_jnfs'   => Jnf::where('status', 'REJECTED')->count(),
            'rejected_infs'   => Inf::where('status', 'REJECTED')->count(),
            'edit_requests'   => DB::table('edit_requests')->where('status', 'pending')->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get all recruiters.
     */
    public function getUsers()
    {
        $users = User::where('role', 'recruiter')
            ->withCount(['jnfs', 'infs'])
            ->get();
        return response()->json($users);
    }

    /**
     * Get all forms (JNF or INF).
     */
    public function getForms(Request $request)
    {
        $type = $request->query('type', 'jnf');
        if ($type === 'jnf') {
            $forms = Jnf::with('user')->orderBy('created_at', 'desc')->get();
        } else {
            $forms = Inf::with('user')->orderBy('created_at', 'desc')->get();
        }
        return response()->json($forms);
    }

    /**
     * Get specific form details.
     */
    public function getFormDetails($type, $id)
    {
        if ($type === 'jnf') {
            $form = Jnf::with('user')->find($id);
        } else {
            $form = Inf::with('user')->find($id);
        }

        if (!$form) {
            return response()->json(['message' => 'Form not found'], 404);
        }

        return response()->json($form);
    }

    /**
     * Update form status (Approve/Reject).
     */
    public function updateFormStatus(Request $request, $type, $id)
    {
        $request->validate([
            'status' => 'required|string',
            'note'   => 'nullable|string',
        ]);

        $form = ($type === 'jnf') ? Jnf::find($id) : Inf::find($id);
        if (!$form) return response()->json(['message' => 'Form not found'], 404);

        $form->status = strtoupper($request->status);
        $form->save();

        $formLabel   = strtoupper($type);
        $company     = $form->company_name ?? 'your company';
        $statusLower = strtolower($request->status);
        $statusTitle = ucfirst($statusLower);
        $note        = $request->note ?? '';
        $refId       = $formLabel . '-' . str_pad($id, 5, '0', STR_PAD_LEFT);

        // Determine email type for template badge
        $emailType = $statusLower === 'approved' ? 'approved' : ($statusLower === 'rejected' ? 'rejected' : 'status_update');

        // Notify recruiter (in-app + SMTP email)
        NotificationService::send(
            userId:    $form->user_id,
            senderId:  Auth::id(),
            type:      'status_update',
            title:     "Form {$statusTitle}",
            message:   "Your {$formLabel} for {$company} has been {$statusLower}." . ($note ? " Note: {$note}" : ""),
            formType:  $type,
            formId:    (int) $id,
            sendEmail: true,
            emailType: $emailType,
            emailMeta: [
                'Reference ID' => $refId,
                'Company'      => $company,
                'Status'       => strtoupper($request->status),
                'Admin Note'   => $note ?: 'None',
                'cta_url'      => config('app.url') . '/dashboard',
                'cta_label'    => 'View in Dashboard',
            ]
        );

        return response()->json(['message' => 'Status updated successfully', 'form' => $form]);
    }

    /**
     * Admin directly edits form fields (works regardless of form status).
     * Sends a notification + email to the recruiter on every save.
     */
    public function adminEditForm(Request $request, $type, $id)
    {
        $admin = Auth::user();
        if ($admin->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $form = ($type === 'jnf') ? Jnf::with('user')->find($id) : Inf::with('user')->find($id);
        if (!$form) return response()->json(['message' => 'Form not found'], 404);

        // Fields the admin must not overwrite
        $protected = ['id', 'user_id', 'created_at', 'updated_at', 'edit_count', 'status'];
        $data = collect($request->except($protected))->filter(fn($v) => $v !== null)->toArray();

        if (empty($data)) {
            return response()->json(['message' => 'No fields provided to update'], 422);
        }

        $form->fill($data);
        $form->save();

        $recruiter   = $form->user;
        $formLabel   = strtoupper($type);
        $company     = $form->company_name ?? 'your company';
        $titleField  = ($type === 'jnf') ? 'job_title' : 'internship_designation';
        $title       = $form->{$titleField} ?? 'Internship/Job Profile';
        
        $editedFields = implode(', ', array_map(fn($k) => str_replace('_', ' ', $k), array_keys($data)));
        $note        = $request->input('admin_note', '');
        $refId       = $formLabel . '-' . str_pad($id, 5, '0', STR_PAD_LEFT);

        // Notify recruiter (in-app + SMTP email)
        NotificationService::send(
            userId:    $form->user_id,
            senderId:  $admin->id,
            type:      'edit_request',
            title:     "Admin edited your {$formLabel}",
            message:   "CDC Admin ({$admin->name}) made changes to your {$formLabel} for {$company} ({$title}). "
                     . "Fields updated: {$editedFields}."
                     . ($note ? " Note: {$note}" : ""),
            formType:  $type,
            formId:    (int) $id,
            sendEmail: true,
            emailType: 'admin_edit',
            emailMeta: [
                'Reference ID'    => $refId,
                'Company'         => $company,
                'Job/Profile'     => $title,
                'Fields Updated'  => $editedFields,
                'Admin Note'      => $note ?: 'None',
                'cta_url'         => config('app.url') . '/dashboard',
                'cta_label'       => 'Review Changes',
            ]
        );

        return response()->json([
            'message' => 'Form updated by admin. Recruiter notified.',
            'form'    => $form->fresh(['user']),
        ]);
    }

    /**
     * Send communication (Email/Internal Notification).
     */
    public function sendCommunication(Request $request)
    {
        $request->validate([
            'user_id'   => 'required|exists:users,id',
            'type'      => 'required|string', // 'email' or 'system'
            'title'     => 'required|string',
            'message'   => 'required|string',
            'form_type' => 'nullable|string',
            'form_id'   => 'nullable|integer',
        ]);

        $shouldEmail = $request->type === 'email';

        // Use centralized service (in-app + optional SMTP)
        NotificationService::send(
            userId:    $request->user_id,
            senderId:  Auth::id(),
            type:      $shouldEmail ? 'email' : 'edit_request',
            title:     $request->title,
            message:   $request->message,
            formType:  $request->form_type,
            formId:    $request->form_id ? (int) $request->form_id : null,
            sendEmail: $shouldEmail,
            emailType: 'communication',
            emailMeta: [
                'From'      => 'CDC Admin',
                'Form'      => $request->form_type ? strtoupper($request->form_type) . ' #' . $request->form_id : 'N/A',
                'cta_url'   => config('app.url') . '/dashboard',
                'cta_label' => 'Open Portal',
            ]
        );

        return response()->json(['message' => 'Communication sent successfully']);
    }

    /**
     * Get conversation between Admin and Recruiter for a specific form.
     */
    public function getFormCommunications($type, $id)
    {
        $communications = Notification::where('form_type', $type)
            ->where('form_id', $id)
            ->orderBy('created_at', 'asc')
            ->get();
        return response()->json($communications);
    }
}
