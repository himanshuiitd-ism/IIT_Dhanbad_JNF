<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alumni_mentorships', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->string('name');
            $table->string('phone');
            $table->string('year_of_completion', 4);
            $table->string('degree');
            $table->string('branch');
            $table->string('current_job');
            $table->text('areas_of_interest');
            $table->string('linkedin_profile');
            $table->text('general_comments')->nullable();
            $table->string('status')->default('pending'); // pending, reviewed, contacted
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alumni_mentorships');
    }
};
