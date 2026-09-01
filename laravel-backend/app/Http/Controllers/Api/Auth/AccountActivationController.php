<?php

namespace App\Http\Controllers\Api\Auth;

use App\Events\AccountActivated;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Handles website account activation links for Google/social users.
 *
 * Route: GET /api/v1/auth/activation/{id}/{hash}  (name: activation.activate)
 *
 * This controller is intentionally separate from the email verification flow.
 * For Google users, email is already verified. This link ONLY activates the
 * website account by setting account_status = active.
 */
class AccountActivationController extends Controller
{
    /**
     * Process an account activation link.
     *
     * Validates the signed URL, checks the hash, checks the account is still
     * pending, activates the account, fires AccountActivated event, and
     * redirects to the frontend.
     */
    public function activate(Request $request, int $id, string $hash): Response
    {
        $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'https://lutatech.com')), '/');

        // ------------------------------------------------------------------
        // 1. Validate signed URL (tamper-proof, time-limited).
        // ------------------------------------------------------------------
        if (! $request->hasValidSignature()) {
            Log::warning("Account activation: invalid or expired signature for user [{$id}].");

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This activation link is invalid or has expired. Please request a new one.',
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
                return response()->json([
                    'success' => false,
                    'message' => 'Account not found.',
                ], 404);
            }
            return redirect($frontendUrl . '/verify-email?status=invalid');
        }

        // ------------------------------------------------------------------
        // 3. Validate the email hash (prevents activation of wrong account).
        // ------------------------------------------------------------------
        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            Log::warning("Account activation: hash mismatch for user [{$user->id}].");

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This activation link is invalid.',
                ], 403);
            }
            return redirect($frontendUrl . '/verify-email?status=invalid');
        }

        // ------------------------------------------------------------------
        // 4. Check if already active (idempotent — issue token & log in).
        // ------------------------------------------------------------------
        if ($user->isActive()) {
            Log::info("Account activation: user [{$user->id}] is already active.");
            $token = $user->createToken('auth_token')->plainTextToken;

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Your account is already active. You are now logged in.',
                    'data'    => [
                        'token' => $token,
                        'user'  => [
                            'id'    => $user->id,
                            'name'  => $user->name,
                            'email' => $user->email,
                        ],
                    ],
                ]);
            }
            return redirect($frontendUrl . '/verify-email?status=already_active&token=' . urlencode($token));
        }

        // ------------------------------------------------------------------
        // 5. Check account is in a state that can be activated (must be pending).
        // ------------------------------------------------------------------
        if (! $user->isPending()) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your account cannot be activated at this time. Please contact support.',
                    'account_status' => $user->account_status,
                ], 403);
            }
            return redirect($frontendUrl . '/verify-email?status=invalid');
        }

        // ------------------------------------------------------------------
        // 6. Activate the account.
        //    For Google users, email is already verified — no need to set it.
        //    activate(false) leaves email_verified_at unchanged.
        // ------------------------------------------------------------------
        $user->activate(false);

        Log::info("Account activated: user [{$user->id}] ({$user->email}) via social activation link.");

        // ------------------------------------------------------------------
        // 7. Fire AccountActivated event → SendWelcomeEmailListener.
        // ------------------------------------------------------------------
        event(new AccountActivated($user->fresh()));

        // ------------------------------------------------------------------
        // 8. Issue token so user is automatically logged in upon activation!
        // ------------------------------------------------------------------
        $token = $user->createToken('auth_token')->plainTextToken;

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Your account has been activated! You are now logged in.',
                'data'    => [
                    'token' => $token,
                    'user'  => [
                        'id'    => $user->id,
                        'name'  => $user->name,
                        'email' => $user->email,
                    ],
                ],
            ]);
        }

        return redirect($frontendUrl . '/verify-email?status=activated&token=' . urlencode($token));
    }
}
