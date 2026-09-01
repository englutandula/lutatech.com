<?php

namespace App\Http\Controllers\Api;

use App\Events\AccountActivated;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\AccountActivationNotification;
use App\Notifications\VerificationActivationNotification;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Throwable;

/**
 * Core authentication controller.
 *
 * Handles: register, login, logout, profile,
 *          verifyEmail (email/password activation),
 *          resendActivationEmail,
 *          forgotPassword, resetPassword.
 */
class AuthController extends Controller
{
    // =========================================================================
    // REGISTRATION
    // =========================================================================

    /**
     * Register a new user with email and password.
     *
     * Flow:
     *   1. Validate input (name, email, strong password)
     *   2. Check unique email
     *   3. Create user (status=pending, email_verified_at=null)
     *   4. Send ONE verification + activation email
     *   5. Return 201 — NO token until account is activated
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255'],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
            ],
        ], [
            'name.required'              => 'Your name is required.',
            'email.required'             => 'Email address is required.',
            'email.email'                => 'Please provide a valid email address.',
            'password.required'          => 'Password is required.',
            'password.confirmed'         => 'Passwords do not match.',
            'password.min'               => 'Password must be at least 8 characters.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->input('email')));

        // ------------------------------------------------------------------
        // Duplicate email check (case-insensitive).
        // ------------------------------------------------------------------
        $existingUser = User::whereRaw('LOWER(email) = ?', [$email])->first();

        if ($existingUser) {
            // Special case: Google-only user trying to add a local password.
            // We do NOT allow this through the registration endpoint to avoid
            // security issues. They must use a dedicated "set password" flow.
            if ($existingUser->isSocialOnlyUser()) {
                return response()->json([
                    'success'     => false,
                    'message'     => 'An account with this email exists via Google. Please sign in with Google.',
                    'user_exists' => true,
                    'provider'    => $existingUser->socialAccounts->pluck('provider_name')->first() ?? 'google',
                    'errors'      => ['email' => ['An account with this email already exists. Please sign in with Google.']],
                ], 422);
            }

            $provider = $existingUser->socialAccounts->pluck('provider_name')->first();
            $message  = $provider
                ? 'An account with this email exists. Sign in with ' . ucfirst($provider) . ' or reset your password.'
                : 'An account with this email already exists. Please sign in.';

            return response()->json([
                'success'     => false,
                'message'     => $message,
                'user_exists' => true,
                'provider'    => $provider ?? 'email',
                'errors'      => ['email' => [$message]],
            ], 422);
        }

        // ------------------------------------------------------------------
        // Create the user. No token issued until activation.
        // ------------------------------------------------------------------
        $user = User::create([
            'name'           => trim($request->input('name')),
            'email'          => $email,
            'password'       => Hash::make($request->input('password')),
            'email_verified_at' => null,
            'account_status' => User::STATUS_PENDING,
        ]);

        // ------------------------------------------------------------------
        // Send ONE email: verify email AND activate account in a single click.
        // ------------------------------------------------------------------
        try {
            $user->notify(new VerificationActivationNotification());
        } catch (Throwable $e) {
            Log::error("Failed to send activation email to new user [{$user->id}]: " . $e->getMessage());
        }

        Log::info("New user registered: [{$user->id}] ({$user->email}). Awaiting activation.");

        return response()->json([
            'success' => true,
            'message' => 'Registration successful! Please check your email and click the link to verify your email and activate your account.',
            'data'    => [
                'user' => $this->formatUser($user),
            ],
        ], 201);
    }

    // =========================================================================
    // LOGIN
    // =========================================================================

    /**
     * Authenticate a user with email and password.
     *
     * Gates: credentials → account_status check → issue token
     */
    public function login(Request $request): JsonResponse
    {
        // ------------------------------------------------------------------
        // Rate limiting: 5 attempts per 1 minute per IP (industry standard).
        // ------------------------------------------------------------------
        $throttleKey = 'login:' . $request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'success'      => false,
                'message'      => "Too many login attempts. Please try again in {$seconds} seconds.",
                'throttled'    => true,
                'retry_after'  => $seconds,
            ], 429);
        }

        $validator = Validator::make($request->all(), [
            'email'    => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required'    => 'Email address is required.',
            'email.email'       => 'Please enter a valid email address.',
            'password.required' => 'Password is required.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->input('email')));
        $user  = User::whereRaw('LOWER(email) = ?', [$email])->first();

        // ------------------------------------------------------------------
        // Generic credential failure (do not reveal whether email exists).
        // ------------------------------------------------------------------
        if (! $user || ! Hash::check($request->input('password'), (string) $user->password)) {
            RateLimiter::hit($throttleKey, 60); // 60-second decay window

            // Specific message when user has no local password (social-only).
            if ($user && $user->isSocialOnlyUser()) {
                $provider = $user->socialAccounts->pluck('provider_name')->first() ?? 'Google';
                return response()->json([
                    'success'  => false,
                    'message'  => 'This account was created with ' . ucfirst($provider) . '. Please sign in with ' . ucfirst($provider) . '.',
                    'provider' => strtolower($provider),
                ], 422);
            }

            return response()->json([
                'success' => false,
                'message' => 'The email or password you entered is incorrect.',
            ], 401);
        }

        // ------------------------------------------------------------------
        // Account status gate.
        // ------------------------------------------------------------------
        if ($user->isPending()) {
            RateLimiter::clear($throttleKey); // Not a brute-force attempt.
            return response()->json([
                'success'             => false,
                'message'             => 'Your account has not been activated yet. Please check your email and click the activation link.',
                'account_status'      => User::STATUS_PENDING,
                'requires_activation' => true,
            ], 403);
        }

        if ($user->isSuspended()) {
            return response()->json([
                'success'        => false,
                'message'        => 'Your account has been suspended. Please contact support.',
                'account_status' => User::STATUS_SUSPENDED,
                'suspended'      => true,
            ], 403);
        }

        if ($user->isDisabled()) {
            return response()->json([
                'success'        => false,
                'message'        => 'Your account has been disabled. Please contact support.',
                'account_status' => User::STATUS_DISABLED,
                'disabled'       => true,
            ], 403);
        }

        // ------------------------------------------------------------------
        // Successful login.
        // ------------------------------------------------------------------
        RateLimiter::clear($throttleKey);

        // Revoke all previous tokens on login (optional security hardening;
        // remove the line below if you need multi-device sessions).
        // $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;
        $user->recordLogin();

        Log::info("Successful login: user [{$user->id}] ({$user->email}).");

        return response()->json([
            'success' => true,
            'message' => 'Logged in successfully.',
            'data'    => [
                'user'       => $this->formatUser($user),
                'token'      => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }

    // =========================================================================
    // PROFILE
    // =========================================================================

    /**
     * Get the authenticated user's profile.
     * Requires: auth:sanctum + EnsureAccountIsActive middleware.
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user()->load('socialAccounts');

        return response()->json([
            'success' => true,
            'data'    => [
                'user' => array_merge($this->formatUser($user), [
                    'has_password'   => ! empty($user->password),
                    'is_admin'       => $user->is_admin,
                    'last_login_at'  => $user->last_login_at,
                    'social_accounts' => $user->socialAccounts->map(fn ($sa) => [
                        'id'         => $sa->id,
                        'provider'   => $sa->provider_name,
                        'created_at' => $sa->created_at,
                    ]),
                ]),
            ],
        ]);
    }

    // =========================================================================
    // LOGOUT
    // =========================================================================

    /**
     * Revoke the current Sanctum token.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $user?->currentAccessToken()?->delete();

        Log::info("User logged out: [{$user?->id}].");

        return response()->json([
            'success' => true,
            'message' => 'Successfully logged out.',
        ]);
    }

    // =========================================================================
    // EMAIL VERIFICATION + ACCOUNT ACTIVATION (email/password users)
    // =========================================================================

    /**
     * Process the verification + activation link clicked by email/password users.
     *
     * ONE click performs:
     *   1. Marks email_verified_at = now()
     *   2. Sets account_status = active
     *   3. Fires AccountActivated event (welcome email sent via listener)
     *
     * Route name: verification.verify (used in signed URL generation)
     */
    public function verifyEmail(Request $request, int $id, string $hash): mixed
    {
        $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'https://lutatech.com')), '/');

        // ------------------------------------------------------------------
        // 1. Validate signed URL signature + expiry.
        // ------------------------------------------------------------------
        if (! $request->hasValidSignature()) {
            Log::warning("Email verification: invalid/expired signature for user [{$id}].");

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This verification link is invalid or has expired. Please request a new one.',
                ], 403);
            }
            return redirect($frontendUrl . '/verify-email?status=invalid');
        }

        // ------------------------------------------------------------------
        // 2. Find the user.
        // ------------------------------------------------------------------
        $user = User::find($id);

        if (! $user) {
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => 'Account not found.'], 404);
            }
            return redirect($frontendUrl . '/verify-email?status=invalid');
        }

        // ------------------------------------------------------------------
        // 3. Validate hash (prevents verifying a different user's email).
        // ------------------------------------------------------------------
        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            Log::warning("Email verification: hash mismatch for user [{$user->id}].");

            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => 'Invalid verification link.'], 403);
            }
            return redirect($frontendUrl . '/verify-email?status=invalid');
        }

        // ------------------------------------------------------------------
        // 4. Already active — idempotent success.
        // ------------------------------------------------------------------
        if ($user->isActive()) {
            if ($request->wantsJson()) {
                return response()->json(['success' => true, 'message' => 'Your account is already active.']);
            }
            return redirect($frontendUrl . '/verify-email?status=already_verified');
        }

        // ------------------------------------------------------------------
        // 5. Must be pending to activate.
        // ------------------------------------------------------------------
        if (! $user->isPending()) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your account cannot be activated at this time. Please contact support.',
                ], 403);
            }
            return redirect($frontendUrl . '/verify-email?status=invalid');
        }

        // ------------------------------------------------------------------
        // 6. Activate: set email_verified_at + account_status = active.
        //    activate(true) sets email_verified_at if not already set.
        // ------------------------------------------------------------------
        $user->activate(true);

        Log::info("Email verified + account activated: user [{$user->id}] ({$user->email}).");

        // ------------------------------------------------------------------
        // 7. Fire AccountActivated → welcome email listener.
        // ------------------------------------------------------------------
        event(new AccountActivated($user->fresh()));

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Email verified and account activated! You can now log in.',
            ]);
        }

        return redirect($frontendUrl . '/verify-email?status=activated');
    }

    // =========================================================================
    // RESEND ACTIVATION EMAIL
    // =========================================================================

    /**
     * Resend the activation email to a pending user.
     *
     * Automatically sends the correct email type based on how the user
     * registered:
     *   - Email/password user → VerificationActivationNotification
     *   - Google/social user  → AccountActivationNotification
     *
     * Rate limit: 3 requests per 5 minutes per email.
     */
    public function resendActivationEmail(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'string', 'email'],
        ], [
            'email.required' => 'Email address is required.',
            'email.email'    => 'Please provide a valid email address.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->input('email')));

        // ------------------------------------------------------------------
        // Rate limiting: 3 resend requests per 5 minutes per email.
        // ------------------------------------------------------------------
        // 3 resend attempts per 10 minutes per email (professional standard)
        $throttleKey = 'resend-activation:' . $email;

        if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'success'     => false,
                'message'     => "Too many requests. Please wait {$seconds} seconds before trying again.",
                'throttled'   => true,
                'retry_after' => $seconds,
            ], 429);
        }

        RateLimiter::hit($throttleKey, 10 * 60); // 10-minute decay window

        // ------------------------------------------------------------------
        // Always return a generic success message to prevent email enumeration.
        // ------------------------------------------------------------------
        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();

        if (! $user) {
            return response()->json([
                'success' => true,
                'message' => 'If an account with that email exists and is pending activation, we have sent a new activation email.',
            ]);
        }

        // Already active — no need to resend.
        if ($user->isActive()) {
            return response()->json([
                'success' => true,
                'message' => 'If an account with that email exists and is pending activation, we have sent a new activation email.',
            ]);
        }

        // Suspended or disabled — don't resend.
        if ($user->isSuspended() || $user->isDisabled()) {
            return response()->json([
                'success' => false,
                'message' => 'Your account status prevents reactivation. Please contact support.',
            ], 403);
        }

        // ------------------------------------------------------------------
        // Send the correct email based on how the user registered.
        // ------------------------------------------------------------------
        try {
            if ($user->isSocialOnlyUser()) {
                // Google user: send website activation email only.
                $user->notify(new AccountActivationNotification());
            } else {
                // Email/password user: send verify + activate email.
                $user->notify(new VerificationActivationNotification());
            }
        } catch (Throwable $e) {
            Log::error("Failed to resend activation email to [{$user->id}]: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Unable to send email at this time. Please check back later.',
            ], 500);
        }

        Log::info("Activation email resent to user [{$user->id}] ({$user->email}).");

        return response()->json([
            'success' => true,
            'message' => 'If an account with that email exists and is pending activation, we have sent a new activation email.',
        ]);
    }

    // =========================================================================
    // FORGOT PASSWORD
    // =========================================================================

    /**
     * Send a password reset link to the user's email.
     *
     * Security: always returns a generic success response to prevent
     * email enumeration attacks.
     *
     * Rate limit: 3 requests per 5 minutes per IP.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        // 3 attempts per 15 minutes per IP (professional standard — prevents email flooding)
        $throttleKey = 'forgot-password:' . $request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'success'     => false,
                'message'     => "Too many requests. Please try again in {$seconds} seconds.",
                'throttled'   => true,
                'retry_after' => $seconds,
            ], 429);
        }

        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors(),
            ], 422);
        }

        RateLimiter::hit($throttleKey, 15 * 60); // 15-minute decay window (professional standard)

        $email = strtolower(trim($request->input('email')));
        $user  = User::whereRaw('LOWER(email) = ?', [$email])->first();

        // Always return success to prevent email enumeration.
        if (! $user) {
            return response()->json([
                'success' => true,
                'message' => 'If an account exists with that email, we have sent a password reset link.',
            ]);
        }

        // Google-only users have no local password — send a helpful notification
        // explaining they use social login, while returning generic success on API.
        if ($user->isSocialOnlyUser()) {
            $provider = $user->socialAccounts->pluck('provider_name')->first() ?? 'Google';
            try {
                $user->notify(new \App\Notifications\SocialAccountPasswordResetNotification($provider));
            } catch (Throwable $e) {
                Log::error("Failed to send social reset email to [{$user->id}]: " . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'If an account exists with that email, we have sent a password reset link.',
            ]);
        }

        // Generate and store a hashed reset token.
        $token = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'email'      => $user->email,
                'token'      => Hash::make($token),
                'created_at' => Carbon::now(),
            ]
        );

        try {
            $user->sendPasswordResetNotification($token);
        } catch (Throwable $e) {
            Log::error("Password reset email failed for [{$user->id}]: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send password reset email. Please try again later.',
            ], 500);
        }

        Log::info("Password reset email sent to user [{$user->id}].");

        return response()->json([
            'success' => true,
            'message' => 'If an account exists with that email, we have sent a password reset link.',
        ]);
    }

    // =========================================================================
    // RESET PASSWORD
    // =========================================================================

    /**
     * Reset the user's password using a valid reset token.
     *
     * After reset:
     *   - Password is updated (securely hashed)
     *   - Reset token is invalidated
     *   - remember_token is rotated (invalidates other sessions)
     *   - No new token issued — user must log in normally
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token'    => ['required', 'string'],
            'email'    => ['required', 'email'],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors'  => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->input('email')));
        $token = $request->input('token');

        // ------------------------------------------------------------------
        // Validate reset token.
        // ------------------------------------------------------------------
        $record = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (! $record || ! Hash::check($token, $record->token)) {
            return response()->json([
                'success' => false,
                'message' => 'This password reset token is invalid or has already been used.',
            ], 400);
        }

        // Token expires after 60 minutes.
        if (Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            return response()->json([
                'success' => false,
                'message' => 'This password reset link has expired. Please request a new one.',
            ], 400);
        }

        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'No account found with this email address.',
            ], 404);
        }

        // ------------------------------------------------------------------
        // Update password and rotate remember_token (invalidates sessions).
        // ------------------------------------------------------------------
        $updateData = [
            'password'       => Hash::make($request->input('password')),
            'remember_token' => Str::random(60),
        ];

        // Approved: if the account is still pending, activate it now.
        // A user who resets their password has proven control of the email.
        if ($user->isPending()) {
            $updateData['account_status']    = User::STATUS_ACTIVE;
            $updateData['email_verified_at'] = $updateData['email_verified_at'] ?? now();
            Log::info("Password reset activated pending account for user [{$user->id}].");
        }

        $user->forceFill($updateData)->save();

        // If we just activated the account, fire the AccountActivated event
        // so the welcome email is sent.
        if (isset($updateData['account_status']) && $updateData['account_status'] === User::STATUS_ACTIVE) {
            event(new AccountActivated($user->fresh()));
        }

        // Invalidate all existing Sanctum tokens for security.
        $user->tokens()->delete();

        // Invalidate the reset token (single use).
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        event(new PasswordReset($user));

        Log::info("Password reset successful for user [{$user->id}].");

        return response()->json([
            'success' => true,
            'message' => 'Your password has been reset successfully. Please log in with your new password.',
        ]);
    }

    // =========================================================================
    // INTERNAL HELPERS
    // =========================================================================

    /**
     * Format a User model for API responses.
     * Consistent shape used across all endpoints.
     */
    private function formatUser(User $user): array
    {
        return [
            'id'             => $user->id,
            'name'           => $user->name,
            'email'          => $user->email,
            'avatar'         => $user->avatar,
            'email_verified' => $user->hasVerifiedEmail(),
            'account_status' => $user->account_status,
            'created_at'     => $user->created_at,
        ];
    }
}
