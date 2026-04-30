<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Jnf;
use App\Models\Inf;
use App\Models\Notification;
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

        // Create notification for Recruiter
        Notification::create([
            'user_id'   => $form->user_id,
            'sender_id' => Auth::id(),
            'type'      => 'status_update',
            'title'     => 'Form ' . ucfirst(strtolower($request->status)),
            'message'   => "Your " . strtoupper($type) . " for " . ($form->company_name ?? 'your company') . " has been " . strtolower($request->status) . ". " . ($request->note ?? ""),
            'form_type' => $type,
            'form_id'   => $id,
        ]);

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

        // In-app notification to recruiter
        try {
            Notification::create([
                'user_id'   => $form->user_id,
                'sender_id' => $admin->id,
                'type'      => 'edit_request',
                'title'     => "Admin edited your {$formLabel}",
                'message'   => "CDC Admin ({$admin->name}) made changes to your {$formLabel} for {$company} ({$title}). "
                             . "Fields updated: {$editedFields}."
                             . ($note ? " Note: {$note}" : ""),
                'form_type' => $type,
                'form_id'   => $id,
            ]);
        } catch (\Throwable $e) {
            \Log::warning('Admin edit notification failed: ' . $e->getMessage());
        }

        // Email notification to recruiter
        if ($recruiter) {
            try {
                Mail::raw(
                    "Dear {$recruiter->name},\n\n"
                    . "CDC Admin has made edits to your {$formLabel} (ID: {$formLabel}-" . str_pad($id, 5, '0', STR_PAD_LEFT) . ") for {$company}.\n\n"
                    . "Job/Internship Title: {$title}\n"
                    . "Fields updated: {$editedFields}.\n"
                    . ($note ? "Admin note: {$note}\n" : "")
                    . "\nPlease log in to the CDC Portal grid to review the changes.\n\n"
                    . "Regards,\nCDC Team, IIT (ISM) Dhanbad",
                    fn($mail) => $mail
                        ->to($recruiter->email)
                        ->subject("[{$formLabel}] Admin made edits — IIT (ISM) Dhanbad CDC")
                        ->from(config('mail.from.address'), 'CDC IIT (ISM) Dhanbad')
                );
            } catch (\Throwable $e) {
                \Log::warning('Admin edit email failed: ' . $e->getMessage());
            }
        }

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

        Notification::create([
            'user_id'   => $request->user_id,
            'sender_id' => Auth::id(),
            'type'      => $request->type === 'email' ? 'email' : 'edit_request',
            'title'     => $request->title,
            'message'   => $request->message,
            'form_type' => $request->form_type,
            'form_id'   => $request->form_id,
            'is_email'  => $request->type === 'email',
        ]);

        // In a real app, you'd trigger a Mail class here if is_email is true.

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
