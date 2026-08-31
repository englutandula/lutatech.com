<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired when a user's account is successfully activated.
 *
 * Triggered by:
 *   - Email/password users clicking the verification + activation link
 *   - Google users clicking the website activation link
 *
 * Listeners:
 *   - SendWelcomeEmailListener (queued)
 */
class AccountActivated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly User $user
    ) {}
}
