<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SocialAuthenticationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

/**
 * Handles OAuth social authentication.
 *
 * Supported providers: google
 *
 * Architecture note:
 *   This controller is deliberately thin. All user-matching and creation
 *   logic lives in SocialAuthenticationService. This controller only
 *   handles the HTTP layer: redirect, callback, and result routing.
 *
 * Future providers (Facebook, Apple, Microsoft) can be added by:
 *   1. Adding credentials to config/services.php + .env
 *   2. Adding the provider string to $supportedProviders
 *   No other code changes needed.
 */
class SocialAuthController extends Controller
{
    /**
     * Supported OAuth providers.
     *
     * Professional choice: Google only for consumer product launch.
     * GitHub removed — developer-focused platform, not relevant for Luta Tech's audience.
     * Apple / Facebook can be appended here when needed.
     */
    protected array $supportedProviders = ['google'];

    public function __construct(
        protected SocialAuthenticationService $socialAuthService
    ) {}

    // =========================================================================
    // REDIRECT
    // =========================================================================

    /**
     * Redirect the user to the OAuth provider's authentication page.
     *
     * GET /api/v1/auth/{provider}/redirect
     */
    public function redirect(string $provider): \Symfony\Component\HttpFoundation\RedirectResponse|RedirectResponse
    {
        $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');

        if (! in_array($provider, $this->supportedProviders, true)) {
            Log::warning("OAuth redirect attempted for unsupported provider: [{$provider}].");
            return redirect($frontendUrl . '/login?error=' . urlencode('This sign-in method is not supported.'));
        }

        // stateless() = no server-side session needed (SPA/API architecture).
        return Socialite::driver($provider)->stateless()->redirect();
    }

    // =========================================================================
    // CALLBACK
    // =========================================================================

    /**
     * Handle the OAuth callback from the provider.
     *
     * GET /api/v1/auth/{provider}/callback
     *
     * Flow:
     *   1. Retrieve user from OAuth provider (server-to-server — trusted).
     *   2. Delegate to SocialAuthenticationService for user matching/creation.
     *   3. Check account_status.
     *   4. Redirect to frontend:
     *      - active  → with Sanctum token (user is logged in)
     *      - pending → without token, with status=pending_activation
     *      - suspended/disabled → with error message
     */
    public function callback(string $provider): RedirectResponse
    {
        $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');

        if (! in_array($provider, $this->supportedProviders, true)) {
            return redirect($frontendUrl . '/login?error=' . urlencode('This sign-in method is not supported.'));
        }

        // ------------------------------------------------------------------
        // 1. Retrieve the authenticated user from the OAuth provider.
        //    All data here is trusted — it came directly from Google's servers.
        // ------------------------------------------------------------------
        try {
            /** @var \Laravel\Socialite\Two\User $socialUser */
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (Throwable $e) {
            Log::error("Socialite callback failed for [{$provider}]: " . $e->getMessage());
            return redirect($frontendUrl . '/login?error=' . urlencode(
                'Sign-in with ' . ucfirst($provider) . ' failed. Please try again.'
            ));
        }

        // ------------------------------------------------------------------
        // 2. Require email from provider (safety check).
        // ------------------------------------------------------------------
        if (empty($socialUser->getEmail())) {
            Log::warning("Socialite [{$provider}] returned no email for provider_id [{$socialUser->getId()}].");
            return redirect($frontendUrl . '/login?error=' . urlencode(
                'No email address is associated with your ' . ucfirst($provider) . ' account. Please use email/password sign-up.'
            ));
        }

        // ------------------------------------------------------------------
        // 3. Find or create the user via the service (server-side only).
        // ------------------------------------------------------------------
        try {
            ['user' => $user, 'isNewUser' => $isNewUser] = $this->socialAuthService->findOrCreateUser($provider, $socialUser);
        } catch (Throwable $e) {
            Log::error("SocialAuthenticationService failed for [{$provider}]: " . $e->getMessage());
            return redirect($frontendUrl . '/login?error=' . urlencode(
                'An error occurred during sign-in. Please try again.'
            ));
        }

        // ------------------------------------------------------------------
        // 4. Account status gate.
        // ------------------------------------------------------------------
        if ($user->isSuspended()) {
            Log::info("Suspended user [{$user->id}] blocked on social login.");
            return redirect($frontendUrl . '/login?error=' . urlencode(
                'Your account has been suspended. Please contact support.'
            ));
        }

        if ($user->isDisabled()) {
            Log::info("Disabled user [{$user->id}] blocked on social login.");
            return redirect($frontendUrl . '/login?error=' . urlencode(
                'Your account has been disabled. Please contact support.'
            ));
        }

        if ($user->isPending()) {
            // New OR existing user who hasn't activated yet.
            // Redirect to frontend verify-email page so the activation card is displayed.
            Log::info("Pending user [{$user->id}] redirected after social login. isNew: " . ($isNewUser ? 'yes' : 'no'));
            return redirect($frontendUrl . '/verify-email?status=pending_activation&email=' . urlencode($user->email));
        }

        // ------------------------------------------------------------------
        // 5. Account is active — issue Sanctum token and log in.
        // ------------------------------------------------------------------
        $token = $user->createToken('auth_token')->plainTextToken;
        $user->recordLogin();

        Log::info("Social login success: user [{$user->id}] via [{$provider}].");

        return redirect($frontendUrl . '/auth/callback?token=' . urlencode($token));
    }
}
