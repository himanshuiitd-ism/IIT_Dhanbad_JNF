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
        return Inf::where('user_id', Auth::id())->latest()->get();
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
        if ($inf->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return $inf;
    }
}
