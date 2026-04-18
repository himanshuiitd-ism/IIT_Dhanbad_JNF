<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'organisation',
        'phone',
        'alt_phone',
        'designation',
        'role',
        'email_verified_status',
        'profile_complete',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    public function jnfs()
    {
        return $this->hasMany(Jnf::class);
    }

    public function infs()
    {
        return $this->hasMany(Inf::class);
    }

    public function editRequests()
    {
        return $this->hasMany(EditRequest::class);
    }
}
