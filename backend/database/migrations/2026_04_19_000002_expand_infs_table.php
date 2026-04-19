<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('infs', function (Blueprint $table) {
            $cols = Schema::getColumnListing('infs');

            // ── Company Profile extras ──────────────────────────────────
            if (!in_array('employees', $cols))              $table->string('employees')->nullable()->after('category');
            if (!in_array('date_of_establishment', $cols))  $table->string('date_of_establishment')->nullable()->after('employees');
            if (!in_array('annual_turnover', $cols))        $table->string('annual_turnover')->nullable()->after('date_of_establishment');
            if (!in_array('linkedin', $cols))               $table->string('linkedin')->nullable()->after('annual_turnover');
            if (!in_array('industry_sectors', $cols))       $table->json('industry_sectors')->nullable()->after('linkedin');
            if (!in_array('hq_country', $cols))             $table->string('hq_country')->nullable()->after('industry_sectors');
            if (!in_array('nature_of_business', $cols))     $table->string('nature_of_business')->nullable()->after('hq_country');
            if (!in_array('description', $cols))            $table->text('description')->nullable()->after('nature_of_business');
            if (!in_array('logo_path', $cols))              $table->string('logo_path')->nullable()->after('description');

            // ── Contacts (JSON blobs) ───────────────────────────────────
            if (!in_array('head_hr', $cols))  $table->json('head_hr')->nullable()->after('logo_path');
            if (!in_array('poc1', $cols))     $table->json('poc1')->nullable()->after('head_hr');
            if (!in_array('poc2', $cols))     $table->json('poc2')->nullable()->after('poc1');

            // ── Internship Profile extras ───────────────────────────────
            if (!in_array('profile_name', $cols))       $table->string('profile_name')->nullable()->after('poc2');
            if (!in_array('formal_title', $cols))       $table->string('formal_title')->nullable()->after('profile_name');
            if (!in_array('work_mode', $cols))          $table->string('work_mode')->nullable()->after('formal_title');
            if (!in_array('expected_interns', $cols))   $table->integer('expected_interns')->nullable()->after('work_mode');
            if (!in_array('min_interns', $cols))        $table->integer('min_interns')->nullable()->after('expected_interns');
            if (!in_array('start_date', $cols))         $table->date('start_date')->nullable()->after('min_interns');
            if (!in_array('required_skills', $cols))    $table->json('required_skills')->nullable()->after('start_date');
            if (!in_array('jd_pdf_path', $cols))        $table->string('jd_pdf_path')->nullable()->after('required_skills');
            if (!in_array('additional_info', $cols))    $table->text('additional_info')->nullable()->after('jd_pdf_path');
            if (!in_array('bond_details', $cols))       $table->string('bond_details')->nullable()->after('additional_info');
            if (!in_array('registration_link', $cols))  $table->string('registration_link')->nullable()->after('bond_details');

            // ── Eligibility expanded ────────────────────────────────────
            if (!in_array('eligibility', $cols))        $table->json('eligibility')->nullable()->after('registration_link');
            if (!in_array('global_cgpa', $cols))        $table->string('global_cgpa')->nullable()->after('eligibility');
            if (!in_array('global_backlogs', $cols))    $table->boolean('global_backlogs')->default(true)->after('global_cgpa');
            if (!in_array('gender_filter', $cols))      $table->string('gender_filter')->default('All')->after('global_backlogs');

            // ── Stipend ─────────────────────────────────────────────────
            if (!in_array('currency', $cols))           $table->string('currency')->default('INR')->after('gender_filter');
            if (!in_array('stipend', $cols))            $table->json('stipend')->nullable()->after('currency');
            if (!in_array('per_prog_additional', $cols)) $table->json('per_prog_additional')->nullable()->after('stipend');

            // ── Selection Process ───────────────────────────────────────
            if (!in_array('selection_stages', $cols))   $table->json('selection_stages')->nullable()->after('per_prog_additional');
            if (!in_array('selection_mode', $cols))     $table->string('selection_mode')->nullable()->after('selection_stages');
            if (!in_array('test_type', $cols))          $table->string('test_type')->nullable()->after('selection_mode');
            if (!in_array('interview_modes', $cols))    $table->json('interview_modes')->nullable()->after('test_type');
            if (!in_array('test_rounds', $cols))        $table->json('test_rounds')->nullable()->after('interview_modes');
            if (!in_array('interview_rounds', $cols))   $table->json('interview_rounds')->nullable()->after('test_rounds');
            if (!in_array('psychometric_test', $cols))  $table->boolean('psychometric_test')->default(false)->after('interview_rounds');
            if (!in_array('medical_test', $cols))       $table->boolean('medical_test')->default(false)->after('psychometric_test');
            if (!in_array('infrastructure', $cols))     $table->text('infrastructure')->nullable()->after('medical_test');
            if (!in_array('other_screening', $cols))    $table->text('other_screening')->nullable()->after('infrastructure');

            // ── Declaration & Submit ────────────────────────────────────
            if (!in_array('declarations', $cols))           $table->json('declarations')->nullable()->after('other_screening');
            if (!in_array('signatory_name', $cols))         $table->string('signatory_name')->nullable()->after('declarations');
            if (!in_array('signatory_designation', $cols))  $table->string('signatory_designation')->nullable()->after('signatory_name');
            if (!in_array('signatory_date', $cols))         $table->date('signatory_date')->nullable()->after('signatory_designation');
            if (!in_array('typed_signature', $cols))        $table->string('typed_signature')->nullable()->after('signatory_date');
            if (!in_array('rti_nirf_consent', $cols))       $table->boolean('rti_nirf_consent')->default(false)->after('typed_signature');

            // ── Submission tracking ─────────────────────────────────────
            if (!in_array('submitted_at', $cols))       $table->timestamp('submitted_at')->nullable()->after('rti_nirf_consent');
        });
    }

    public function down(): void
    {
        // No-op — drop table manually if needed
    }
};
