<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('edit_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('form_type');           // 'jnf' or 'inf'
            $table->unsignedBigInteger('form_id'); // ID of the JNF/INF
            $table->text('reason');                // Why they need to re-edit
            $table->string('status')->default('pending'); // pending | approved | rejected
            $table->text('admin_note')->nullable(); // Optional note from admin
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('edit_requests');
    }
};
