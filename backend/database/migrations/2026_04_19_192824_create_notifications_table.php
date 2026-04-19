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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Recipient
            $table->unsignedBigInteger('sender_id')->nullable(); // Who sent it
            $table->string('type')->default('system'); // system | email | approval | rejection | edit_request
            $table->string('title')->nullable();
            $table->text('message');
            $table->string('form_type')->nullable(); // jnf | inf
            $table->unsignedBigInteger('form_id')->nullable();
            $table->boolean('is_read')->default(false);
            $table->boolean('is_email')->default(false); // If it should be/was sent as email
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
