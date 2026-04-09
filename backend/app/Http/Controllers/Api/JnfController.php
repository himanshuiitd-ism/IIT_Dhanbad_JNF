<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Jnf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JnfController extends Controller
{
    public function index()
    {
        return Jnf::where('user_id', Auth::id())->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string',
            // Add more validations as needed
        ]);

        $jnf = Auth::user()->jnfs()->create($request->all());

        return response()->json([
            'message' => 'JNF submitted successfully',
            'data' => $jnf
        ], 201);
    }

    public function show(Jnf $jnf)
    {
        if ($jnf->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return $jnf;
    }
}
