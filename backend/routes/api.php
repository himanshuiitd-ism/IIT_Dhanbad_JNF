<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes (requires Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    
    // JNF routes
    Route::get('/jnfs', [\App\Http\Controllers\Api\JnfController::class, 'index']);
    Route::post('/jnfs', [\App\Http\Controllers\Api\JnfController::class, 'store']);
    Route::get('/jnfs/{jnf}', [\App\Http\Controllers\Api\JnfController::class, 'show']);

    // INF routes
    Route::get('/infs', [\App\Http\Controllers\Api\InfController::class, 'index']);
    Route::post('/infs', [\App\Http\Controllers\Api\InfController::class, 'store']);
    Route::get('/infs/{inf}', [\App\Http\Controllers\Api\InfController::class, 'show']);
});
