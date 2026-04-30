<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->after('id');           // recipient
            $table->unsignedBigInteger('sender_id')->nullable()->after('user_id'); // who sent it
            $table->string('type')->default('system')->after('sender_id'); // approval|rejection|status_update|edit_request|email|system
            $table->string('title')->nullable()->after('type');
            $table->text('message')->nullable()->after('title');
            $table->string('form_type')->nullable()->after('message');     // jnf | inf
            $table->unsignedBigInteger('form_id')->nullable()->after('form_type');
            $table->boolean('is_read')->default(false)->after('form_id');
            $table->boolean('is_email')->default(false)->after('is_read');
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn([
                'user_id', 'sender_id', 'type', 'title',
                'message', 'form_type', 'form_id', 'is_read', 'is_email',
            ]);
        });
    }
};
