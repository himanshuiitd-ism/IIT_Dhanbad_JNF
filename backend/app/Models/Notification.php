<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'sender_id',
        'type',
        'title',
        'message',
        'form_type',
        'form_id',
        'is_read',
        'is_email'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
