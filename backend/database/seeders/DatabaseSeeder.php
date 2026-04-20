<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Demo admin account (matches frontend LOCAL_ACCOUNTS)
        User::firstOrCreate(
            ['email' => 'admin@iitism.ac.in'],
            [
                'name'     => 'Admin',
                'password' => 'admin',
                'role'     => 'admin',
                'profile_complete' => true,
            ]
        );

        // Demo recruiter account (matches frontend LOCAL_ACCOUNTS)
        User::firstOrCreate(
            ['email' => 'recruiter@tcs.com'],
            [
                'name'         => 'Recruiter',
                'password'     => 'password',
                'role'         => 'recruiter',
                'organisation' => 'TCS',
                'profile_complete' => true,
            ]
        );
    }
}
