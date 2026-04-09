<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('jnfs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Section 1: Company Overview
            $table->string('company_name');
            $table->string('website')->nullable();
            $table->text('postal_address')->nullable();
            $table->string('sector')->nullable();
            $table->string('category')->nullable(); // Private, PSU, etc.
            
            // Section 2: Contact Details
            $table->string('primary_contact_name')->nullable();
            $table->string('primary_contact_designation')->nullable();
            $table->string('primary_contact_email')->nullable();
            $table->string('primary_contact_phone')->nullable();
            $table->string('secondary_contact_name')->nullable();
            $table->string('secondary_contact_designation')->nullable();
            $table->string('secondary_contact_email')->nullable();
            $table->string('secondary_contact_phone')->nullable();
            
            // Section 3: Job Profile
            $table->string('job_designation')->nullable();
            $table->text('job_description')->nullable();
            $table->string('place_of_posting')->nullable();
            $table->string('training_period')->nullable();
            $table->string('service_bond')->nullable();
            
            // Section 4: Salary details
            $table->string('ctc_total')->nullable();
            $table->string('ctc_fixed')->nullable();
            $table->string('ctc_variable')->nullable();
            $table->string('ctc_bonus')->nullable();
            $table->string('ctc_esops')->nullable();
            $table->string('ctc_perks')->nullable();
            
            // Section 5: Eligibility
            $table->json('eligible_degrees')->nullable();
            $table->json('eligible_departments')->nullable();
            $table->string('min_cutoff_cgpa')->nullable();
            
            // Section 6: Selection Process
            $table->boolean('selection_ppt')->default(false);
            $table->json('selection_shortlisting')->nullable();
            $table->json('selection_tests')->nullable();
            $table->json('selection_rounds')->nullable();
            $table->text('medical_requirements')->nullable();
            
            $table->string('status')->default('PENDING'); // PENDING, APPROVED, LIVE, COMPLETED
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jnfs');
    }
};
