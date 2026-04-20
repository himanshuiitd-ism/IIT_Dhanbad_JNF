<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

// ── Public / Auth routes ──────────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']); // legacy / admin bypass

// ── Alumni Mentorship (public submission) ─────────────────────────────
Route::post('/alumni-mentorship', [\App\Http\Controllers\Api\AlumniMentorshipController::class, 'store']);

// 2-Step Registration
Route::post('/auth/send-otp',    [AuthController::class, 'sendOtp']);
Route::post('/auth/verify-otp',  [AuthController::class, 'verifyOtp']);

// ── Protected routes ─────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [AuthController::class, 'me']);

    // Step 2 of registration — complete profile (needs temp token from step 1)
    Route::post('/auth/complete-profile', [AuthController::class, 'completeProfile']);

    // JNF routes
    Route::get('/jnfs',                     [\App\Http\Controllers\Api\JnfController::class, 'index']);
    Route::post('/jnfs',                    [\App\Http\Controllers\Api\JnfController::class, 'store']);
    Route::get('/jnfs/{jnf}',               [\App\Http\Controllers\Api\JnfController::class, 'show']);
    Route::put('/jnfs/{jnf}',               [\App\Http\Controllers\Api\JnfController::class, 'update']);
    Route::patch('/jnfs/{jnf}/draft',       [\App\Http\Controllers\Api\JnfController::class, 'saveDraft']);
    Route::post('/jnfs/{jnf}/submit',       [\App\Http\Controllers\Api\JnfController::class, 'submit']);
    Route::delete('/jnfs/{jnf}',            [\App\Http\Controllers\Api\JnfController::class, 'destroy']);


    // INF routes
    Route::get('/infs',        [\App\Http\Controllers\Api\InfController::class, 'index']);
    Route::post('/infs',       [\App\Http\Controllers\Api\InfController::class, 'store']);
    Route::get('/infs/{inf}',  [\App\Http\Controllers\Api\InfController::class, 'show']);
    Route::put('/infs/{inf}',  [\App\Http\Controllers\Api\InfController::class, 'update']);

    // Contact routes
    Route::post('/contact',  [\App\Http\Controllers\Api\ContactController::class, 'store']);
    Route::get('/messages',  [\App\Http\Controllers\Api\ContactController::class, 'index']);

    // Edit Request routes
    Route::post('/edit-requests',                          [\App\Http\Controllers\Api\EditRequestController::class, 'store']);
    Route::get('/edit-requests',                           [\App\Http\Controllers\Api\EditRequestController::class, 'index']);
    Route::get('/edit-requests/mine',                      [\App\Http\Controllers\Api\EditRequestController::class, 'myRequests']);
    Route::post('/edit-requests/{editRequest}/approve',    [\App\Http\Controllers\Api\EditRequestController::class, 'approve']);
    Route::post('/edit-requests/{editRequest}/reject',     [\App\Http\Controllers\Api\EditRequestController::class, 'reject']);

    // ── Notifications ───────────────────────────────────────────────
    Route::get('/notifications',      [AuthController::class, 'getNotifications']);
    Route::post('/notifications/read', [AuthController::class, 'markNotificationsRead']);

    // ── Admin routes (Simplified check - or use middleware) ───────
    Route::prefix('admin')->group(function () {
        Route::get('/stats',                    [\App\Http\Controllers\Api\AdminController::class, 'getStats']);
        Route::get('/users',                    [\App\Http\Controllers\Api\AdminController::class, 'getUsers']);
        Route::get('/forms',                    [\App\Http\Controllers\Api\AdminController::class, 'getForms']);
        Route::get('/forms/{type}/{id}',        [\App\Http\Controllers\Api\AdminController::class, 'getFormDetails']);
        Route::patch('/forms/{type}/{id}',      [\App\Http\Controllers\Api\AdminController::class, 'updateFormStatus']);
        Route::post('/communicate',             [\App\Http\Controllers\Api\AdminController::class, 'sendCommunication']);
        Route::get('/forms/{type}/{id}/comms',  [\App\Http\Controllers\Api\AdminController::class, 'getFormCommunications']);
    });

    // ── Alumni Mentorship (admin management) ───────────────────────────
    Route::get('/alumni-mentorship',            [\App\Http\Controllers\Api\AlumniMentorshipController::class, 'index']);
    Route::get('/alumni-mentorship/{id}',       [\App\Http\Controllers\Api\AlumniMentorshipController::class, 'show']);
    Route::patch('/alumni-mentorship/{id}',     [\App\Http\Controllers\Api\AlumniMentorshipController::class, 'updateStatus']);
    Route::delete('/alumni-mentorship/{id}',    [\App\Http\Controllers\Api\AlumniMentorshipController::class, 'destroy']);

    // ── AI PDF Parser route ────────────────────────────────────────
    Route::post('/parse-pdf', [\App\Http\Controllers\Api\PdfParserController::class, 'parse']);

    // ── System Initialization ──────────────────────────────────────
    Route::post('/init', [\App\Http\Controllers\Api\InitController::class, 'initialize']);
    Route::get('/init',  [\App\Http\Controllers\Api\InitController::class, 'getMasterData']);
});
