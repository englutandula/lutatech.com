<?php

use App\Http\Controllers\Api\AiToolController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\NormalToolController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1 Routes
|--------------------------------------------------------------------------
*/
Route::prefix('v1')->group(function () {
    // Health check
    Route::get('/health', function () {
        return response()->json([
            'status' => 'healthy',
            'version' => '1.0.0',
            'timestamp' => now()->toISOString(),
            'service' => 'Luta Tech Laravel Gateway',
        ]);
    });

    // Authentication endpoints
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/profile', [AuthController::class, 'profile']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });
    });

    // Passport Photo Requirements & Processing
    Route::get('/requirements', [AiToolController::class, 'getRequirements']);
    Route::post('/process', [AiToolController::class, 'processPassport']);

    // AI Tools (Proxied securely to Python AI microservice on AWS)
    Route::prefix('ai')->group(function () {
        Route::post('/remove-background', [AiToolController::class, 'removeBackground']);
        Route::post('/passport/process', [AiToolController::class, 'processPassport']);
    });

    // Normal Tools (Executed 100% in PHP/Laravel)
    Route::prefix('tools')->group(function () {
        Route::post('/qr/generate', [NormalToolController::class, 'generateQr']);
    });
});
