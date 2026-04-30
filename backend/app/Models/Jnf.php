<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jnf extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        // Company Profile
        'company_name', 'website', 'postal_address', 'sector', 'category',
        'employees', 'date_of_establishment', 'annual_turnover', 'linkedin',
        'industry_sectors', 'hq_country', 'nature_of_business', 'description',
        'logo_path', 'brochure_path',
        // Contacts
        'head_ta', 'poc1', 'poc2',
        // Job Profile
        'job_title', 'job_formal_designation', 'place_of_posting', 'work_mode',
        'expected_hires', 'min_hires', 'joining_month', 'required_skills',
        'job_description', 'jd_pdf_path', 'additional_info', 'bond_details',
        'registration_link', 'onboarding',
        // Eligibility
        'eligibility',
        // Salary
        'currency', 'salary', 'additional_salary',
        // Selection Process
        'selection_stages', 'test_rounds', 'interview_rounds', 'selection_mode',
        'test_type', 'interview_modes', 'psychometric_test', 'medical_test',
        'infrastructure', 'other_screening',
        // Declaration
        'declarations', 'signatory_name', 'signatory_designation', 'signatory_date',
        'typed_signature', 'rti_nirf_consent',
        // Status
        'status', 'edit_count', 'submitted_at',
    ];

    protected $casts = [
        'industry_sectors'  => 'array',
        'head_ta'           => 'array',
        'poc1'              => 'array',
        'poc2'              => 'array',
        'required_skills'   => 'array',
        'eligibility'       => 'array',
        'salary'            => 'array',
        'additional_salary' => 'array',
        'selection_stages'  => 'array',
        'test_rounds'       => 'array',
        'interview_rounds'  => 'array',
        'interview_modes'   => 'array',
        'declarations'      => 'array',
        'psychometric_test' => 'boolean',
        'medical_test'      => 'boolean',
        'rti_nirf_consent'  => 'boolean',
        'submitted_at'      => 'datetime',
        'date_of_establishment' => 'date',
        'signatory_date'    => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function editRequests()
    {
        return $this->hasMany(EditRequest::class, 'form_id')->where('form_type', 'jnf');
    }

    public function isSubmitted(): bool
    {
        return !in_array(strtolower($this->status), ['draft']);
    }

    public function isApprovedOrRejected(): bool
    {
        return in_array(strtoupper($this->status), ['APPROVED', 'REJECTED']);
    }

    public function canRecruiterEdit(User $user): bool
    {
        if ($user->role === 'admin') return true;
        // Before approval/rejection: always editable
        if (!$this->isApprovedOrRejected()) return true;
        // After approval/rejection: only if edit_count < 1
        return $this->edit_count < 1;
    }
}
