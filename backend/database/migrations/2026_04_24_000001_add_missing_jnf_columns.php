<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jnfs', function (Blueprint $table) {
            $cols = Schema::getColumnListing('jnfs');

            // postal_address was mistakenly dropped in expand migration
            if (!in_array('postal_address', $cols))
                $table->string('postal_address')->nullable()->after('website');

            // bond_details sent from frontend job step
            if (!in_array('bond_details', $cols))
                $table->text('bond_details')->nullable()->after('additional_info');

            // job_description sent from frontend
            if (!in_array('job_description', $cols))
                $table->text('job_description')->nullable()->after('bond_details');

            // place_of_posting sent from frontend
            if (!in_array('place_of_posting', $cols))
                $table->string('place_of_posting')->nullable()->after('job_description');

            // category (company type) sent from frontend
            if (!in_array('category', $cols))
                $table->string('category')->nullable()->after('sector');
        });
    }

    public function down(): void
    {
        Schema::table('jnfs', function (Blueprint $table) {
            $table->dropColumn(['postal_address', 'bond_details', 'job_description', 'place_of_posting', 'category']);
        });
    }
};
