<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\CdcNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SmtpController extends Controller
{
    /**
     * Send a test email to verify SMTP configuration.
     */
    public function testSmtp(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'to_email' => 'required|email',
        ]);

        $toEmail = $request->to_email;

        try {
            $mail = new CdcNotification(
                type:          'test',
                recipientName: $user->name ?: 'Admin',
                title:         '[IIT Dhanbad CDC] SMTP Test — Configuration Verified ✓',
                body:          "This is a test email sent from the IIT (ISM) Dhanbad CDC Portal.\n\nIf you're reading this, your SMTP configuration is working correctly!\n\nSent at: " . now()->format('d M Y, h:i:s A'),
                meta:          [
                    'SMTP Host'       => config('mail.mailers.smtp.host'),
                    'SMTP Port'       => config('mail.mailers.smtp.port'),
                    'From Address'    => config('mail.from.address'),
                    'Encryption'      => config('mail.mailers.smtp.scheme') ?: 'none',
                ]
            );

            Mail::to($toEmail)->send($mail);

            Log::info("SMTP test email sent to {$toEmail} by admin {$user->email}");

            return response()->json([
                'message' => "Test email sent successfully to {$toEmail}",
                'smtp_config' => [
                    'host'       => config('mail.mailers.smtp.host'),
                    'port'       => config('mail.mailers.smtp.port'),
                    'from'       => config('mail.from.address'),
                    'encryption' => config('mail.mailers.smtp.scheme') ?: 'none',
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('SMTP test failed: ' . $e->getMessage());
            return response()->json([
                'message'     => 'SMTP test failed',
                'error'       => $e->getMessage(),
                'smtp_config' => [
                    'host'       => config('mail.mailers.smtp.host'),
                    'port'       => config('mail.mailers.smtp.port'),
                    'from'       => config('mail.from.address'),
                    'encryption' => config('mail.mailers.smtp.scheme') ?: 'none',
                ],
            ], 500);
        }
    }

    /**
     * Get current SMTP settings (admin only, no passwords exposed).
     */
    public function getSmtpConfig()
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'mailer'     => config('mail.default'),
            'host'       => config('mail.mailers.smtp.host'),
            'port'       => config('mail.mailers.smtp.port'),
            'encryption' => config('mail.mailers.smtp.scheme') ?: 'none',
            'username'   => config('mail.mailers.smtp.username') ? '••••••' . substr(config('mail.mailers.smtp.username'), -8) : 'not set',
            'password'   => config('mail.mailers.smtp.password') ? '••••••••' : 'not set',
            'from_address' => config('mail.from.address'),
            'from_name'    => config('mail.from.name'),
        ]);
    }
}
