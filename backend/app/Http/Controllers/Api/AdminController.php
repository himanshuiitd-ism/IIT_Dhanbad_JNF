<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Jnf;
use App\Models\Inf;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

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
            'title'     => 'Form ' . $request->status,
            'message'   => "Your " . strtoupper($type) . " for " . $form->company_name . " has been " . strtolower($request->status) . ". " . ($request->note ?? ""),
            'form_type' => $type,
            'form_id'   => $id,
        ]);

        return response()->json(['message' => 'Status updated successfully', 'form' => $form]);
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
