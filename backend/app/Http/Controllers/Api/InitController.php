<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use App\Models\Department;
use App\Models\Course;
use App\Models\Branch;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class InitController extends Controller
{
    /**
     * Initialize the system by loading master data from CSV files.
     */
    public function initialize(Request $request)
    {
        $results = [];

        try {
            DB::beginTransaction();

            // 1. Initialize Departments
            $results['departments'] = $this->loadCsv(
                database_path('data/department.csv'),
                function ($data) {
                    Department::updateOrCreate(
                        ['code' => $data['id']],
                        [
                            'name'   => $data['name'],
                            'type'   => $data['type'],
                            'status' => (bool)$data['status'],
                            'wef'    => $data['wef'],
                            'wet'    => $data['wet'],
                        ]
                    );
                }
            );

            // 2. Initialize Courses
            $results['courses'] = $this->loadCsv(
                database_path('data/courses.csv'),
                function ($data) {
                    Course::updateOrCreate(
                        ['code' => $data['id']],
                        [
                            'name'     => $data['name'],
                            'duration' => (int)$data['duration'],
                            'status'   => (bool)$data['status'],
                            'wef'      => $data['wef'],
                            'wet'      => $data['wet'],
                        ]
                    );
                }
            );

            // 3. Initialize Branches
            $results['branches'] = $this->loadCsv(
                database_path('data/branches.csv'),
                function ($data) {
                    Branch::updateOrCreate(
                        ['code' => $data['id']],
                        [
                            'name'   => $data['name'],
                            'status' => (bool)$data['status'],
                            'wef'    => $data['wef'],
                            'wet'    => $data['wet'],
                        ]
                    );
                }
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'System initialized successfully.',
                'stats'   => $results
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Initialization failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the master data for the frontend.
     */
    public function getMasterData()
    {
        return response()->json([
            'departments' => Department::where('status', 1)->get(),
            'courses'     => Course::where('status', 1)->get(),
            'branches'    => Branch::where('status', 1)->get(),
        ]);
    }

    /**
     * Create an admin user.
     */
    public function createAdmin(Request $request)
    {
        $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'required|email|unique:users,email',
            'password'     => 'required|string|min:8|confirmed',
            'organisation' => 'nullable|string|max:255',
            'phone'        => 'nullable|string|max:20',
            'designation'  => 'nullable|string|max:255',
        ]);

        $admin = User::create([
            'name'                  => $request->name,
            'email'                 => $request->email,
            'password'              => Hash::make($request->password),
            'role'                  => 'admin',
            'organisation'          => $request->organisation ?? 'IIT (ISM) Dhanbad',
            'phone'                 => $request->phone,
            'designation'           => $request->designation ?? 'Administrator',
            'email_verified_at'     => now(),        // pre-verified
            'email_verified_status' => 'verified',
            'profile_complete'      => true,
        ]);

        return response()->json([
            'message' => 'Admin user created successfully.',
            'admin'   => [
                'id'           => $admin->id,
                'name'         => $admin->name,
                'email'        => $admin->email,
                'role'         => $admin->role,
                'organisation' => $admin->organisation,
                'designation'  => $admin->designation,
            ],
        ], 201);
    }

    /**
     * Helper to load CSV data.
     */
    private function loadCsv($path, $callback)
    {
        if (!File::exists($path)) {
            throw new \Exception("File not found: " . $path);
        }

        $handle = fopen($path, 'r');
        $headers = fgetcsv($handle);
        $count = 0;

        while (($row = fgetcsv($handle)) !== false) {
            if (count($headers) !== count($row)) continue;
            $data = array_combine($headers, $row);
            $callback($data);
            $count++;
        }

        fclose($handle);
        return $count;
    }
}
