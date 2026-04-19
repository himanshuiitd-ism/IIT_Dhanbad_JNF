<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inf extends Model
{
    protected $guarded = [];

    protected $casts = [
        // Company
        'industry_sectors'  => 'array',

        // Contacts
        'head_hr'           => 'array',
        'poc1'              => 'array',
        'poc2'              => 'array',

        // Internship profile
        'required_skills'   => 'array',
        'ppo_provision'     => 'boolean',

        // Eligibility
        'eligibility'       => 'array',
        'eligible_degrees'  => 'array',
        'eligible_departments' => 'array',
        'global_backlogs'   => 'boolean',

        // Stipend
        'stipend'           => 'array',
        'per_prog_additional' => 'array',

        // Selection Process
        'selection_stages'  => 'array',
        'interview_modes'   => 'array',
        'test_rounds'       => 'array',
        'interview_rounds'  => 'array',
        'selection_shortlisting' => 'array',
        'selection_tests'   => 'array',
        'selection_rounds'  => 'array',
        'psychometric_test' => 'boolean',
        'medical_test'      => 'boolean',
        'selection_ppt'     => 'boolean',

        // Declaration
        'declarations'      => 'array',
        'rti_nirf_consent'  => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isSubmitted(): bool
    {
        return in_array($this->status, ['SUBMITTED', 'APPROVED', 'REJECTED', 'submitted', 'approved', 'rejected']);
    }

    public function canRecruiterEdit(User $user): bool
    {
        if ($user->role === 'admin') return true;
        if ($this->isSubmitted() && $this->edit_count >= 1) return false;
        return true;
    }
}
