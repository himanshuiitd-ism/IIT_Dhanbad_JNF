<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AlumniMentorship extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'name',
        'phone',
        'year_of_completion',
        'degree',
        'branch',
        'current_job',
        'areas_of_interest',
        'linkedin_profile',
        'general_comments',
        'status',
    ];
}
