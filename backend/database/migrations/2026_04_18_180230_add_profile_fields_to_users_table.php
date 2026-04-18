<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Recruiter profile fields
            $table->string('designation')->nullable()->after('name');
            $table->string('alt_phone')->nullable()->after('phone');
            $table->string('email_verified_status')->default('unverified')->after('email'); // unverified | verified
            $table->boolean('profile_complete')->default(false)->after('email_verified_status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['designation', 'alt_phone', 'email_verified_status', 'profile_complete']);
        });
    }
};
