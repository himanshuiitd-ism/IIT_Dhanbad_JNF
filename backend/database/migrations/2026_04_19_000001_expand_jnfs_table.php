<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jnfs', function (Blueprint $table) {
            // Drop old slim columns (only if they exist - avoids errors on fresh installs)
            $cols = Schema::getColumnListing('jnfs');

            $OLD = [
                'postal_address','training_period','service_bond',
                'ctc_total','ctc_fixed','ctc_variable','ctc_bonus','ctc_esops','ctc_perks',
                'eligible_degrees','eligible_departments','min_cutoff_cgpa',
                'selection_ppt','selection_shortlisting','selection_tests','selection_rounds',
                'medical_requirements','primary_contact_name','primary_contact_designation',
                'primary_contact_email','primary_contact_phone','secondary_contact_name',
                'secondary_contact_designation','secondary_contact_email','secondary_contact_phone',
                'job_designation',
            ];
            foreach ($OLD as $col) {
                if (in_array($col, $cols)) $table->dropColumn($col);
            }
        });

        Schema::table('jnfs', function (Blueprint $table) {
            $cols = Schema::getColumnListing('jnfs');

            // ── Company Profile extras ──────────────────────────────────
            if (!in_array('employees', $cols))           $table->string('employees')->nullable()->after('sector');
            if (!in_array('date_of_establishment', $cols)) $table->date('date_of_establishment')->nullable()->after('employees');
            if (!in_array('annual_turnover', $cols))     $table->string('annual_turnover')->nullable()->after('date_of_establishment');
            if (!in_array('linkedin', $cols))            $table->string('linkedin')->nullable()->after('annual_turnover');
            if (!in_array('industry_sectors', $cols))    $table->json('industry_sectors')->nullable()->after('linkedin');
            if (!in_array('hq_country', $cols))          $table->string('hq_country')->nullable()->after('industry_sectors');
            if (!in_array('nature_of_business', $cols))  $table->string('nature_of_business')->nullable()->after('hq_country');
            if (!in_array('description', $cols))         $table->text('description')->nullable()->after('nature_of_business');
            if (!in_array('logo_path', $cols))           $table->string('logo_path')->nullable()->after('description');
            if (!in_array('brochure_path', $cols))       $table->string('brochure_path')->nullable()->after('logo_path');

            // ── Contacts (JSON blobs) ───────────────────────────────────
            if (!in_array('head_ta', $cols))  $table->json('head_ta')->nullable()->after('brochure_path');
            if (!in_array('poc1', $cols))     $table->json('poc1')->nullable()->after('head_ta');
            if (!in_array('poc2', $cols))     $table->json('poc2')->nullable()->after('poc1');

            // ── Job Profile ─────────────────────────────────────────────
            if (!in_array('job_title', $cols))          $table->string('job_title')->nullable()->after('poc2');
            if (!in_array('job_formal_designation', $cols)) $table->string('job_formal_designation')->nullable()->after('job_title');
            if (!in_array('work_mode', $cols))          $table->string('work_mode')->nullable()->after('job_formal_designation');
            if (!in_array('expected_hires', $cols))     $table->integer('expected_hires')->nullable()->after('work_mode');
            if (!in_array('min_hires', $cols))          $table->integer('min_hires')->nullable()->after('expected_hires');
            if (!in_array('joining_month', $cols))      $table->string('joining_month')->nullable()->after('min_hires');
            if (!in_array('required_skills', $cols))    $table->json('required_skills')->nullable()->after('joining_month');
            if (!in_array('jd_pdf_path', $cols))        $table->string('jd_pdf_path')->nullable()->after('required_skills');
            if (!in_array('additional_info', $cols))    $table->text('additional_info')->nullable()->after('jd_pdf_path');
            if (!in_array('registration_link', $cols))  $table->string('registration_link')->nullable()->after('additional_info');
            if (!in_array('onboarding', $cols))         $table->string('onboarding')->nullable()->after('registration_link');

            // ── Eligibility ─────────────────────────────────────────────
            if (!in_array('eligibility', $cols))        $table->json('eligibility')->nullable()->after('onboarding');

            // ── Salary ──────────────────────────────────────────────────
            if (!in_array('currency', $cols))           $table->string('currency')->default('INR')->after('eligibility');
            if (!in_array('salary', $cols))             $table->json('salary')->nullable()->after('currency');
            if (!in_array('additional_salary', $cols))  $table->json('additional_salary')->nullable()->after('salary');

            // ── Selection Process ────────────────────────────────────────
            if (!in_array('selection_stages', $cols))   $table->json('selection_stages')->nullable()->after('additional_salary');
            if (!in_array('test_rounds', $cols))        $table->json('test_rounds')->nullable()->after('selection_stages');
            if (!in_array('interview_rounds', $cols))   $table->json('interview_rounds')->nullable()->after('test_rounds');
            if (!in_array('selection_mode', $cols))     $table->string('selection_mode')->nullable()->after('interview_rounds');
            if (!in_array('test_type', $cols))          $table->string('test_type')->nullable()->after('selection_mode');
            if (!in_array('interview_modes', $cols))    $table->json('interview_modes')->nullable()->after('test_type');
            if (!in_array('psychometric_test', $cols))  $table->boolean('psychometric_test')->default(false)->after('interview_modes');
            if (!in_array('medical_test', $cols))       $table->boolean('medical_test')->default(false)->after('psychometric_test');
            if (!in_array('infrastructure', $cols))     $table->text('infrastructure')->nullable()->after('medical_test');
            if (!in_array('other_screening', $cols))    $table->text('other_screening')->nullable()->after('infrastructure');

            // ── Declaration ─────────────────────────────────────────────
            if (!in_array('declarations', $cols))           $table->json('declarations')->nullable()->after('other_screening');
            if (!in_array('signatory_name', $cols))         $table->string('signatory_name')->nullable()->after('declarations');
            if (!in_array('signatory_designation', $cols))  $table->string('signatory_designation')->nullable()->after('signatory_name');
            if (!in_array('signatory_date', $cols))         $table->date('signatory_date')->nullable()->after('signatory_designation');
            if (!in_array('typed_signature', $cols))        $table->string('typed_signature')->nullable()->after('signatory_date');
            if (!in_array('rti_nirf_consent', $cols))       $table->boolean('rti_nirf_consent')->default(false)->after('typed_signature');

            // ── Submission tracking ──────────────────────────────────────
            if (!in_array('edit_count', $cols))         $table->integer('edit_count')->default(0)->after('rti_nirf_consent');
            if (!in_array('submitted_at', $cols))       $table->timestamp('submitted_at')->nullable()->after('edit_count');
        });
    }

    public function down(): void
    {
        // Intentionally left as no-op for safety — drop table manually if needed
    }
};
