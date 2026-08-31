<?php

namespace App\Services;

use App\Models\SocialAccount;
use App\Models\User;
use App\Notifications\AccountActivationNotification;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Throwable;

/**
 * Handles all server-side logic for social (OAuth) authentication.
 *
 * Responsibilities:
 *   1. Find existing user by (provider, provider_id) — fastest path
 *   2. If not found, find existing user by trusted OAuth email
 *   3. If still not found, create a brand-new user
 *   4. Always link the social account to the correct user
 *   5. Send the website activation email to new social users
 *
 * Security: all identity matching happens server-side using data received
 * directly from the OAuth provider. The frontend never decides which user
 * to link.
 */
class SocialAuthenticationService
{
    /**
     * Process a verified OAuth callback and return the linked User.
     *
     * @param  string         $provider    e.g. 'google', 'github'
     * @param  SocialiteUser  $socialUser  Socialite user object from OAuth provider
     * @return array{user: User, isNewUser: bool}
     */
    public function findOrCreateUser(string $provider, SocialiteUser $socialUser): array
    {
        $providerId = $socialUser->getId();
        $email      = strtolower(trim($socialUser->getEmail()));
        $name       = $socialUser->getName() ?? $socialUser->getNickname() ?? 'User';
        $avatar     = $socialUser->getAvatar();

        // -----------------------------------------------------------------------
        // STEP 1: Check if this social account is already linked to a user.
        // -----------------------------------------------------------------------
        $socialAccount = SocialAccount::where('provider_name', $provider)
            ->where('provider_id', $providerId)
            ->first();

        if ($socialAccount) {
            $user = $socialAccount->user;

            // Refresh avatar if user doesn't have one yet.
            if ($avatar && empty($user->avatar)) {
                $user->update(['avatar' => $avatar]);
            }

            // Update OAuth tokens (they rotate on every login).
            $socialAccount->update([
                'token'         => $socialUser->token,
                'refresh_token' => $socialUser->refreshToken,
            ]);

            Log::info("Social login: existing social account [{$provider}:{$providerId}] → user [{$user->id}].");
            return ['user' => $user, 'isNewUser' => false];
        }

        // -----------------------------------------------------------------------
        // STEP 2: No social account found. Check for an existing user by email.
        // Trust the email from the OAuth provider — do NOT use any frontend input.
        // -----------------------------------------------------------------------
        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();

        if ($user) {
            // Existing user found — link this social provider to their account.
            $this->linkSocialAccount($user, $provider, $providerId, $socialUser);

            // Keep avatar if they don't have one yet.
            if ($avatar && empty($user->avatar)) {
                $user->update(['avatar' => $avatar]);
            }

            Log::info("Social login: linked [{$provider}:{$providerId}] to existing user [{$user->id}] by email.");
            return ['user' => $user, 'isNewUser' => false];
        }

        // -----------------------------------------------------------------------
        // STEP 3: Completely new user — create account.
        //
        // Google/OAuth verifies the email, so email_verified_at is set now.
        // However, the WEBSITE still requires the user to click an activation
        // link before they can access protected areas. account_status = pending.
        // -----------------------------------------------------------------------
        $user = User::create([
            'name'              => $name,
            'email'             => $email,
            'avatar'            => $avatar,
            'password'          => null,
            'email_verified_at' => now(),        // Trusted: Google verified their email
            'account_status'    => User::STATUS_PENDING, // Must still activate website account
        ]);

        $this->linkSocialAccount($user, $provider, $providerId, $socialUser);

        // Send the website activation email.
        try {
            $user->notify(new AccountActivationNotification());
        } catch (Throwable $e) {
            Log::error("Failed to send activation email to new social user [{$user->id}]: " . $e->getMessage());
        }

        Log::info("Social login: created new user [{$user->id}] via [{$provider}]. Activation email sent.");
        return ['user' => $user, 'isNewUser' => true];
    }

    /**
     * Create a social_accounts record linking a user to an OAuth provider.
     */
    protected function linkSocialAccount(
        User         $user,
        string       $provider,
        string       $providerId,
        SocialiteUser $socialUser
    ): SocialAccount {
        return $user->socialAccounts()->updateOrCreate(
            ['provider_name' => $provider, 'provider_id' => $providerId],
            [
                'token'         => $socialUser->token,
                'refresh_token' => $socialUser->refreshToken,
            ]
        );
    }
}
