<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        DB::table('contact_messages')->insert([
            'user_id' => Auth::id(),
            'subject' => $request->subject,
            'message' => $request->message,
            'status' => 'unread',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Message sent to placement office successfully.'], 201);
    }

    public function index()
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $messages = DB::table('contact_messages')
            ->join('users', 'contact_messages.user_id', '=', 'users.id')
            ->select('contact_messages.*', 'users.name as user_name', 'users.organisation')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($messages);
    }
}
