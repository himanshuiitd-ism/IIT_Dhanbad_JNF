<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AlumniMentorship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AlumniMentorshipController extends Controller
{
    /**
     * Public: submit a new mentor application.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email'              => 'required|email|max:255',
            'name'               => 'required|string|max:255',
            'phone'              => 'required|string|max:20',
            'year_of_completion' => 'required|digits:4|integer|min:1950|max:2100',
            'degree'             => 'required|string|max:100',
            'branch'             => 'required|string|max:150',
            'current_job'        => 'required|string|max:255',
            'areas_of_interest'  => 'required|string',
            'linkedin_profile'   => 'required|string|max:500',
            'general_comments'   => 'nullable|string',
        ]);

        $application = AlumniMentorship::create($validated);

        return response()->json([
            'message' => 'Alumni mentorship application submitted successfully.',
            'data'    => $application,
        ], 201);
    }

    /**
     * Admin: list all applications (with optional status filter).
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = AlumniMentorship::latest();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        return response()->json($query->get());
    }

    /**
     * Admin: get single application.
     */
    public function show($id)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $application = AlumniMentorship::find($id);
        if (!$application) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json($application);
    }

    /**
     * Admin: update status of an application.
     */
    public function updateStatus(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'status' => 'required|in:pending,reviewed,contacted',
        ]);

        $application = AlumniMentorship::findOrFail($id);
        $application->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Status updated successfully.',
            'data'    => $application,
        ]);
    }

    /**
     * Admin: delete an application.
     */
    public function destroy($id)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        AlumniMentorship::findOrFail($id)->delete();

        return response()->json(['message' => 'Application deleted.']);
    }
}
