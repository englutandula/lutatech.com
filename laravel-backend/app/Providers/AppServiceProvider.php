<?php

namespace App\Providers;

use App\Events\AccountActivated;
use App\Listeners\SendWelcomeEmailListener;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // ------------------------------------------------------------------
        // Event → Listener mappings
        // ------------------------------------------------------------------

        // Fired when any user (email/password or Google) activates their account.
        // Sends a welcome email exactly once via idempotent queued listener.
        Event::listen(
            AccountActivated::class,
            SendWelcomeEmailListener::class,
        );
    }
}
