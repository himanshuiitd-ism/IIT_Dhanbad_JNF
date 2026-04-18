<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // ─────────────────────────────────────────────────────────────────
    //  STEP 1a — Send OTP to company email
    // ─────────────────────────────────────────────────────────────────
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower(trim($request->email));

        // Check if email is already fully registered
        $existing = User::where('email', $email)->where('profile_complete', true)->first();
        if ($existing) {
            return response()->json(['message' => 'This email is already registered. Please log in.'], 409);
        }

        // Invalidate any previous OTPs for this email
        DB::table('otps')->where('email', $email)->delete();

        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        DB::table('otps')->insert([
            'email'      => $email,
            'otp'        => $otp,
            'expires_at' => now()->addMinutes(5),
            'used'       => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Send the OTP via email
        try {
            Mail::raw(
                "Your IIT (ISM) Dhanbad CDC registration OTP is: {$otp}\n\nThis code expires in 5 minutes.\n\nDo not share this OTP with anyone.",
                function ($mail) use ($email, $otp) {
                    $mail->to($email)
                         ->subject('[IIT Dhanbad CDC] Email Verification OTP');
                }
            );
        } catch (\Exception $e) {
            \Log::warning('OTP email failed: ' . $e->getMessage());
            // In dev, we still return success so you can see the OTP in logs
        }

        // In development — return OTP in response so you can test without real email
        $devOtp = config('app.env') === 'local' ? $otp : null;

        return response()->json([
            'message' => 'OTP sent to ' . $email . '. Check your inbox.',
            'dev_otp' => $devOtp, // Remove this in production
        ]);
    }

    // ─────────────────────────────────────────────────────────────────
    //  STEP 1b — Verify OTP → create partial user record → return temp token
    // ─────────────────────────────────────────────────────────────────
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|digits:6',
        ]);

        $email = strtolower(trim($request->email));

        $record = DB::table('otps')
            ->where('email', $email)
            ->where('otp', $request->otp)
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Invalid or expired OTP. Please request a new one.'], 422);
        }

        // Mark OTP as used
        DB::table('otps')->where('id', $record->id)->update(['used' => true]);

        // Create or update a partial user (email verified, profile incomplete)
        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name'                  => '',
                'password'              => Hash::make(str()->random(32)), // temp password
                'role'                  => 'recruiter',
                'email_verified_status' => 'verified',
                'profile_complete'      => false,
            ]
        );

        // If user exists but wasn't verified yet, verify now
        if ($user->email_verified_status !== 'verified') {
            $user->update(['email_verified_status' => 'verified']);
        }

        // Issue a sanctum token so Step 2 can be an authenticated call
        $token = $user->createToken('registration-token')->plainTextToken;

        return response()->json([
            'message' => 'Email verified successfully. Please complete your profile.',
            'token'   => $token,
            'user'    => ['id' => $user->id, 'email' => $user->email],
        ]);
    }

    // ─────────────────────────────────────────────────────────────────
    //  STEP 2 — Complete recruiter profile (authenticated with step-1 token)
    // ─────────────────────────────────────────────────────────────────
    public function completeProfile(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'designation' => 'required|string|max:255',
            'phone'       => 'required|string|max:20',
            'alt_phone'   => 'nullable|string|max:20',
            'password'    => 'required|string|min:8|confirmed', // needs password_confirmation field
        ]);

        $user = Auth::user();

        if (!$user || $user->email_verified_status !== 'verified') {
            return response()->json(['message' => 'Email not verified. Please restart registration.'], 403);
        }

        $user->update([
            'name'             => $request->name,
            'designation'      => $request->designation,
            'phone'            => $request->phone,
            'alt_phone'        => $request->alt_phone,
            'password'         => Hash::make($request->password),
            'profile_complete' => true,
        ]);

        // Rotate to a proper long-lived token
        $user->tokens()->delete();
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Registration complete! Welcome to the IIT Dhanbad CDC portal.',
            'user'    => $user->fresh(),
            'token'   => $token,
        ], 201);
    }

    // ─────────────────────────────────────────────────────────────────
    //  LOGIN
    // ─────────────────────────────────────────────────────────────────
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user();

        if (!$user->profile_complete && $user->role !== 'admin') {
            return response()->json([
                'message' => 'Profile incomplete. Please finish registration.',
                'redirect' => '/register?step=2&email=' . urlencode($user->email),
            ], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────
    //  LOGOUT
    // ─────────────────────────────────────────────────────────────────
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }

    // ─────────────────────────────────────────────────────────────────
    //  ME
    // ─────────────────────────────────────────────────────────────────
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    // ─────────────────────────────────────────────────────────────────
    //  (Legacy) Direct register — kept for admin bypass only
    // ─────────────────────────────────────────────────────────────────
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        $role = ($request->email === 'admin@iitism.ac.in') ? 'admin' : 'recruiter';

        $user = User::create([
            'name'             => $request->name,
            'email'            => $request->email,
            'password'         => Hash::make($request->password),
            'organisation'     => $request->organisation,
            'phone'            => $request->phone,
            'role'             => $role,
            'profile_complete' => true,
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token], 201);
    }
}
