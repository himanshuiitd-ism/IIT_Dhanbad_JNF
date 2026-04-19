<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use App\Models\Department;
use App\Models\Course;
use App\Models\Branch;
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
