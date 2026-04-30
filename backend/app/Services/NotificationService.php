<?php

namespace App\Services;

use App\Mail\CdcNotification;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Centralized notification service.
 * Every notification creates an in-app record AND optionally sends SMTP email.
 */
class NotificationService
{
    // ─────────────────────────────────────────────────────────────────
    //  Core dispatcher
    // ─────────────────────────────────────────────────────────────────
    /**
     * @param int         $userId      Recipient user ID
     * @param int|null    $senderId    Sender user ID (null = system)
     * @param string      $type        e.g. 'status_update', 'system', 'email', 'edit_request'
     * @param string      $title       In-app notification title
     * @param string      $message     In-app notification body
     * @param string|null $formType    'jnf' or 'inf' (nullable)
     * @param int|null    $formId      Related form ID (nullable)
     * @param bool        $sendEmail   Whether to also send SMTP email
     * @param string|null $emailType   Email template type key (for badge styling)
     * @param array       $emailMeta   Extra meta for email template table
     */
    public static function send(
        int     $userId,
        ?int    $senderId,
        string  $type,
        string  $title,
        string  $message,
        ?string $formType = null,
        ?int    $formId   = null,
        bool    $sendEmail = true,
        ?string $emailType = null,
        array   $emailMeta = []
    ): void {
        // 1. In-app notification
        try {
            Notification::create([
                'user_id'   => $userId,
                'sender_id' => $senderId,
                'type'      => $type,
                'title'     => $title,
                'message'   => $message,
                'form_type' => $formType,
                'form_id'   => $formId,
                'is_email'  => $sendEmail,
            ]);
        } catch (\Throwable $e) {
            Log::warning('NotificationService: in-app notification failed — ' . $e->getMessage());
        }

        // 2. SMTP email
        if ($sendEmail) {
            self::dispatchEmail($userId, $emailType ?? $type, $title, $message, $emailMeta);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  Notify all admins
    // ─────────────────────────────────────────────────────────────────
    public static function notifyAdmins(
        string  $type,
        string  $title,
        string  $message,
        ?string $formType = null,
        ?int    $formId   = null,
        bool    $sendEmail = true,
        ?string $emailType = null,
        array   $emailMeta = []
    ): void {
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            self::send(
                $admin->id, null, $type, $title, $message,
                $formType, $formId, $sendEmail, $emailType, $emailMeta
            );
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  Private: dispatch SMTP email via CdcNotification Mailable
    // ─────────────────────────────────────────────────────────────────
    private static function dispatchEmail(
        int     $userId,
        string  $type,
        string  $title,
        string  $body,
        array   $meta = []
    ): void {
        try {
            $user = User::find($userId);
            if (!$user || !$user->email) {
                Log::warning("NotificationService: no email for user {$userId}");
                return;
            }

            $mail = new CdcNotification(
                $type,
                $user->name ?: 'Recruiter',
                $title,
                $body,
                $meta
            );

            Mail::to($user->email)
                ->send($mail);

            Log::info("NotificationService: email sent to {$user->email} [{$type}]");
        } catch (\Throwable $e) {
            Log::warning('NotificationService: SMTP email failed — ' . $e->getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  Convenience: send a plain email to an arbitrary address (for OTP etc.)
    // ─────────────────────────────────────────────────────────────────
    public static function sendEmailToAddress(
        string $email,
        string $name,
        string $type,
        string $title,
        string $body,
        array  $meta = []
    ): void {
        try {
            $mail = new CdcNotification($type, $name, $title, $body, $meta);
            Mail::to($email)->send($mail);
            Log::info("NotificationService: email sent to {$email} [{$type}]");
        } catch (\Throwable $e) {
            Log::warning('NotificationService: SMTP to address failed — ' . $e->getMessage());
        }
    }
}
