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
        Schema::create('infs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Section 1: Company Overview
            $table->string('company_name');
            $table->string('website')->nullable();
            $table->text('postal_address')->nullable();
            $table->string('sector')->nullable();
            $table->string('category')->nullable();
            
            // Section 2: Contact Details
            $table->string('primary_contact_name')->nullable();
            $table->string('primary_contact_designation')->nullable();
            $table->string('primary_contact_email')->nullable();
            $table->string('primary_contact_phone')->nullable();
            
            // Section 3: Internship Details
            $table->string('internship_designation')->nullable();
            $table->text('internship_description')->nullable();
            $table->string('place_of_posting')->nullable();
            $table->string('duration_weeks')->nullable();
            $table->string('monthly_stipend')->nullable();
            $table->boolean('ppo_provision')->default(false);
            $table->string('ppo_ctc')->nullable();
            
            // Section 4: Eligibility
            $table->json('eligible_degrees')->nullable();
            $table->json('eligible_departments')->nullable();
            $table->string('min_cutoff_cgpa')->nullable();
            
            // Section 5: Selection Process
            $table->boolean('selection_ppt')->default(false);
            $table->json('selection_shortlisting')->nullable();
            $table->json('selection_tests')->nullable();
            $table->json('selection_rounds')->nullable();
            
            $table->string('status')->default('PENDING');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('infs');
    }
};
