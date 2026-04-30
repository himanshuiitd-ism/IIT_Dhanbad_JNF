<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>{{ $title }}</title>
    <style>
        /* Reset */
        body, table, td, p { margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f4f7; color: #374151; line-height: 1.6; }
        a { color: #850000; text-decoration: none; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #850000 0%, #6b0000 100%); padding: 28px 32px; text-align: center; }
        .header img { width: 56px; height: 56px; margin-bottom: 8px; }
        .header h1 { color: #ffffff; font-size: 17px; font-weight: 800; letter-spacing: 0.5px; margin: 0; }
        .header p { color: rgba(255,255,255,0.6); font-size: 11px; letter-spacing: 1.2px; text-transform: uppercase; margin-top: 4px; }

        .badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; }
        .badge-submitted { background: #DBEAFE; color: #1D4ED8; }
        .badge-approved  { background: #D1FAE5; color: #059669; }
        .badge-rejected  { background: #FEE2E2; color: #DC2626; }
        .badge-edit      { background: #FEF3C7; color: #D97706; }
        .badge-info      { background: #F3F4F6; color: #6B7280; }

        .body-section { padding: 32px; }
        .greeting { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 12px; }
        .message { font-size: 14px; color: #4B5563; margin-bottom: 20px; white-space: pre-line; }

        .meta-table { width: 100%; border-collapse: collapse; margin: 16px 0 20px; }
        .meta-table td { padding: 8px 12px; font-size: 13px; border-bottom: 1px solid #F3F4F6; }
        .meta-table td:first-child { color: #9CA3AF; font-weight: 600; width: 150px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.3px; }
        .meta-table td:last-child { color: #111827; font-weight: 500; }

        .cta-btn { display: inline-block; background: #850000; color: #ffffff !important; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 13px; text-decoration: none; margin-top: 8px; }
        .cta-btn:hover { background: #6b0000; }

        .divider { height: 1px; background: #E5E7EB; margin: 20px 0; }

        .footer { background: #F9FAFB; padding: 24px 32px; text-align: center; border-top: 1px solid #E5E7EB; }
        .footer p { font-size: 11px; color: #9CA3AF; margin: 2px 0; }
        .footer a { color: #850000; font-weight: 600; }
    </style>
</head>
<body style="background:#f4f4f7; padding: 24px 8px;">
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Career Development Centre</h1>
            <p>IIT (ISM) Dhanbad</p>
        </div>

        <!-- Body -->
        <div class="body-section">
            <!-- Badge -->
            @php
                $badgeMap = [
                    'form_submitted'        => 'badge-submitted',
                    'status_update'         => 'badge-info',
                    'approved'              => 'badge-approved',
                    'rejected'              => 'badge-rejected',
                    'admin_edit'            => 'badge-edit',
                    'edit_request_approved' => 'badge-approved',
                    'edit_request_rejected' => 'badge-rejected',
                    'communication'         => 'badge-info',
                    'otp'                   => 'badge-info',
                    'test'                  => 'badge-info',
                ];
                $badgeLabelMap = [
                    'form_submitted'        => 'Form Submitted',
                    'status_update'         => 'Status Update',
                    'approved'              => 'Approved',
                    'rejected'              => 'Rejected',
                    'admin_edit'            => 'Admin Edit',
                    'edit_request_approved' => 'Edit Approved',
                    'edit_request_rejected' => 'Edit Rejected',
                    'communication'         => 'Communication',
                    'otp'                   => 'Verification',
                    'test'                  => 'Test Email',
                ];
                $badgeClass = $badgeMap[$type] ?? 'badge-info';
                $badgeLabel = $badgeLabelMap[$type] ?? ucfirst(str_replace('_', ' ', $type));
            @endphp
            <span class="badge {{ $badgeClass }}">{{ $badgeLabel }}</span>

            <!-- Greeting -->
            <p class="greeting">Dear {{ $recipientName }},</p>

            <!-- Main message -->
            <p class="message">{{ $body }}</p>

            <!-- Meta table (if any) -->
            @if(!empty($meta))
                <table class="meta-table">
                    @foreach($meta as $key => $value)
                        @if($key !== 'cta_url' && $key !== 'cta_label')
                            <tr>
                                <td>{{ str_replace('_', ' ', $key) }}</td>
                                <td>{{ $value }}</td>
                            </tr>
                        @endif
                    @endforeach
                </table>
            @endif

            <!-- CTA button (optional) -->
            @if(!empty($meta['cta_url']))
                <a href="{{ $meta['cta_url'] }}" class="cta-btn">
                    {{ $meta['cta_label'] ?? 'View in Portal' }}
                </a>
            @endif

            <div class="divider"></div>

            <p style="font-size: 12px; color: #9CA3AF;">
                This is an automated email from the IIT (ISM) Dhanbad CDC Portal. Please do not reply directly to this email.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Career Development Centre</strong></p>
            <p>Indian Institute of Technology (Indian School of Mines) Dhanbad</p>
            <p>Jharkhand 826004, India</p>
            <p style="margin-top: 6px;">
                <a href="https://www.iitism.ac.in">www.iitism.ac.in</a> · 
                <a href="mailto:placement@iitism.ac.in">placement@iitism.ac.in</a>
            </p>
        </div>
    </div>
</body>
</html>
