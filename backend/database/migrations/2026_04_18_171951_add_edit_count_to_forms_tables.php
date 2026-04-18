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
        Schema::table('jnfs', function (Blueprint $table) {
            $table->integer('edit_count')->default(0)->after('status');
        });

        Schema::table('infs', function (Blueprint $table) {
            $table->integer('edit_count')->default(0)->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jnfs', function (Blueprint $table) {
            $table->dropColumn('edit_count');
        });

        Schema::table('infs', function (Blueprint $table) {
            $table->dropColumn('edit_count');
        });
    }
};
