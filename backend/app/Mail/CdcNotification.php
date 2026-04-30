<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Generic CDC notification email — used for all SMTP notifications.
 * Supports multiple "types" (form_submitted, status_update, admin_edit,
 * edit_request_approved, edit_request_rejected, communication, otp).
 */
class CdcNotification extends Mailable
{
    use Queueable, SerializesModels;

    public string $type;
    public string $recipientName;
    public string $title;
    public string $body;
    public array  $meta;

    /**
     * @param string $type          Notification type key
     * @param string $recipientName Recipient display name
     * @param string $title         Email subject line
     * @param string $body          Main body text
     * @param array  $meta          Extra key/value pairs for the template
     */
    public function __construct(
        string $type,
        string $recipientName,
        string $title,
        string $body,
        array  $meta = []
    ) {
        $this->type          = $type;
        $this->recipientName = $recipientName;
        $this->title         = $title;
        $this->body          = $body;
        $this->meta          = $meta;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.cdc-notification',
            with: [
                'type'          => $this->type,
                'recipientName' => $this->recipientName,
                'title'         => $this->title,
                'body'          => $this->body,
                'meta'          => $this->meta,
            ],
        );
    }
}
