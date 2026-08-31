<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Guards all protected API routes.
 *
 * Checks that the authenticated user's account_status is 'active'.
 * Must be applied after auth:sanctum middleware (user must be authenticated first).
 *
 * Status responses:
 *   pending   → 403  requires_activation: true
 *   suspended → 403  suspended: true
 *   disabled  → 403  disabled: true
 */
class EnsureAccountIsActive
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->isPending()) {
            return response()->json([
                'success'              => false,
                'message'              => 'Your account has not been activated yet. Please check your email and click the activation link.',
                'account_status'       => User::STATUS_PENDING,
                'requires_activation'  => true,
            ], 403);
        }

        if ($user->isSuspended()) {
            return response()->json([
                'success'        => false,
                'message'        => 'Your account has been suspended. Please contact support for assistance.',
                'account_status' => User::STATUS_SUSPENDED,
                'suspended'      => true,
            ], 403);
        }

        if ($user->isDisabled()) {
            return response()->json([
                'success'        => false,
                'message'        => 'Your account has been disabled. Please contact support if you believe this is a mistake.',
                'account_status' => User::STATUS_DISABLED,
                'disabled'       => true,
            ], 403);
        }

        return $next($request);
    }
}
