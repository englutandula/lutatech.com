<?php

use App\Http\Controllers\Api\AiToolController;
use App\Http\Controllers\Api\Auth\AccountActivationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\NormalToolController;
use App\Http\Controllers\Api\SocialAuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1 Routes
|--------------------------------------------------------------------------
|
| Rate limits applied per professional standards:
|   Login:             5 attempts  / 1 minute  (per IP)
|   Forgot Password:   3 requests  / 15 minutes (per IP)
|   Resend Activation: 3 requests  / 10 minutes (per email — enforced in controller)
|
| Middleware aliases:
|   auth:sanctum    — Sanctum token authentication
|   account.active  — Requires account_status = active (EnsureAccountIsActive)
|
*/

$registerV1Routes = function () {
    // =========================================================================
    // Health Check
    // =========================================================================
    Route::get('/health', function () {
        return response()->json([
            'status'    => 'healthy',
            'version'   => '1.0.0',
            'timestamp' => now()->toISOString(),
            'service'   => 'Luta Tech Laravel Gateway',
        ]);
    });

    // =========================================================================
    // Maintenance: Fresh Start & Admin Utilities
    // STRICTLY disabled in production unless a dedicated MAINTENANCE_SECRET is configured.
    // =========================================================================
    Route::get('/maintenance/reset-clients', function (\Illuminate\Http\Request $request) {
        $secret = config('services.maintenance_secret') ?? env('MAINTENANCE_SECRET');
        if (!app()->environment('local') && (!$secret || !hash_equals($secret, (string) $request->query('secret')))) {
            return response()->json(['error' => 'Unauthorized maintenance request.'], 403);
        }

        $deletedUsers = [];
        $clients = \App\Models\User::where(function ($q) {
            $q->where('is_admin', false)->orWhereNull('is_admin');
        })->get();

        foreach ($clients as $client) {
            $deletedUsers[] = $client->email;
            $client->socialAccounts()->delete();
            $client->tokens()->delete();
            $client->delete();
        }

        return response()->json([
            'success'         => true,
            'message'         => 'All registered clients cleared successfully. Ready for fresh testing!',
            'deleted_count'   => count($deletedUsers),
            'deleted_clients' => $deletedUsers,
            'remaining_users' => \App\Models\User::pluck('email'),
        ]);
    });

    Route::get('/maintenance/activate-all', function (\Illuminate\Http\Request $request) {
        $secret = config('services.maintenance_secret') ?? env('MAINTENANCE_SECRET');
        if (!app()->environment('local') && (!$secret || !hash_equals($secret, (string) $request->query('secret')))) {
            return response()->json(['error' => 'Unauthorized maintenance request.'], 403);
        }

        $activated = [];
        $users = \App\Models\User::where('account_status', 'pending')->get();
        foreach ($users as $u) {
            $u->activate(true);
            $activated[] = $u->email;
        }

        return response()->json([
            'success'   => true,
            'message'   => 'All pending accounts activated successfully!',
            'activated' => $activated,
            'all_users' => \App\Models\User::select('id', 'email', 'account_status', 'email_verified_at')->get(),
        ]);
    });

    Route::get('/maintenance/clear-cache', function (\Illuminate\Http\Request $request) {
        $secret = config('services.maintenance_secret') ?? env('MAINTENANCE_SECRET');
        if (!app()->environment('local') && (!$secret || !hash_equals($secret, (string) $request->query('secret')))) {
            return response()->json(['error' => 'Unauthorized maintenance request.'], 403);
        }

        \Illuminate\Support\Facades\Artisan::call('config:clear');
        \Illuminate\Support\Facades\Artisan::call('cache:clear');
        \Illuminate\Support\Facades\Artisan::call('route:clear');

        return response()->json([
            'success'       => true,
            'message'       => 'Config and application cache cleared successfully!',
            'python_ai_url' => config('services.python_ai.url'),
        ]);
    });

    // =========================================================================
    // Authentication Endpoints
    // =========================================================================
    Route::prefix('auth')->group(function () {

        // ------------------------------------------------------------------
        // Registration
        // No rate limiter on register — first-time action, email uniqueness
        // is the natural gate. Add throttle here if abuse is detected.
        // ------------------------------------------------------------------
        Route::post('/register', [AuthController::class, 'register']);

        // ------------------------------------------------------------------
        // Login — 5 attempts / 1 minute per IP (enforced in controller)
        // ------------------------------------------------------------------
        Route::post('/login', [AuthController::class, 'login']);

        // ------------------------------------------------------------------
        // Google OAuth (stateless — no CSRF session needed)
        // ------------------------------------------------------------------
        Route::get('/{provider}/redirect', [SocialAuthController::class, 'redirect'])
            ->where('provider', 'google'); // Only Google supported.

        Route::get('/{provider}/callback', [SocialAuthController::class, 'callback'])
            ->where('provider', 'google');

        // ------------------------------------------------------------------
        // Password Reset (forgot + reset)
        // Forgot: rate limited 3/15min per IP (enforced in controller)
        // ------------------------------------------------------------------
        Route::post('/password/forgot', [AuthController::class, 'forgotPassword']);
        Route::post('/password/reset',  [AuthController::class, 'resetPassword']);

        // ------------------------------------------------------------------
        // Email Verification + Account Activation (email/password users)
        // ONE link verifies email AND activates account.
        // This route name MUST stay as 'verification.verify' — used in signed URLs.
        // ------------------------------------------------------------------
        Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
            ->name('verification.verify')
            ->middleware('signed');

        // ------------------------------------------------------------------
        // Account Activation (Google/social users only)
        // Activation link only — email was already verified by Google.
        // ------------------------------------------------------------------
        Route::get('/activation/{id}/{hash}', [AccountActivationController::class, 'activate'])
            ->name('activation.activate')
            ->middleware('signed');

        // ------------------------------------------------------------------
        // Resend Activation Email
        // Supports both email/password users (sends verify+activate link)
        // and social users (sends website activation link).
        // Rate limited 3/10min per email (enforced in controller).
        // ------------------------------------------------------------------
        Route::post('/activation/resend', [AuthController::class, 'resendActivationEmail']);

        // Keep old route as alias for backwards compatibility.
        Route::post('/email/resend', [AuthController::class, 'resendActivationEmail']);

        // ------------------------------------------------------------------
        // Protected Auth Routes
        // Requires: valid Sanctum token + account_status = active
        // ------------------------------------------------------------------
        Route::middleware(['auth:sanctum', 'account.active'])->group(function () {
            Route::get('/profile', [AuthController::class, 'profile']);
            Route::post('/logout',  [AuthController::class, 'logout']);
        });
    });

    // =========================================================================
    // Tool Routes (Accessible for both guests and authenticated users)
    // =========================================================================
    // Passport Photo Requirements & Processing
    Route::get('/requirements', [AiToolController::class, 'getRequirements']);
    Route::post('/process',     [AiToolController::class, 'processPassport']);

    // AI Tools (proxied to Python AI microservice on AWS)
    Route::prefix('ai')->group(function () {
        Route::post('/remove-background', [AiToolController::class, 'removeBackground']);
        Route::post('/passport/process',  [AiToolController::class, 'processPassport']);
    });

    // Normal Tools (executed 100% in PHP/Laravel)
    Route::prefix('tools')->group(function () {
        Route::post('/qr/generate', [NormalToolController::class, 'generateQr']);
    });
};

// Register under 'v1' (for production when base URL is /api)
Route::prefix('v1')->group($registerV1Routes);

// Register under 'api/v1' (for local dev or direct host access)
Route::prefix('api/v1')->group($registerV1Routes);
