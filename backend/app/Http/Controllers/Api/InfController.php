<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inf;
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
        $validated = $request->validate([
            'company_name' => 'required|string',
        ]);

        $inf = Auth::user()->infs()->create($request->all());

        return response()->json([
            'message' => 'INF submitted successfully',
            'data' => $inf
        ], 201);
    }

    public function show(Inf $inf)
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $inf->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return $inf;
    }

    public function update(Request $request, Inf $inf)
    {
        $user = Auth::user();

        // Check ownership
        if ($user->role !== 'admin' && $inf->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check edit restriction for recruiters
        if ($user->role === 'recruiter' && $inf->edit_count >= 1) {
            return response()->json([
                'message' => 'Edit limit reached. Please contact admin to request further changes.'
            ], 403);
        }

        $inf->update($request->all());
        
        if ($user->role === 'recruiter') {
            $inf->increment('edit_count');
        }

        return response()->json([
            'message' => 'INF updated successfully',
            'data' => $inf
        ]);
    }
}
