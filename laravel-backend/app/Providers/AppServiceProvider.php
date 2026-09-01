<?php

namespace App\Providers;

use App\Events\AccountActivated;
use App\Listeners\SendWelcomeEmailListener;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Schema;
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
        Schema::defaultStringLength(191);

        // Force HTTPS in production or when APP_URL is configured with https
        if (config('app.env') === 'production' || str_starts_with((string) config('app.url'), 'https://')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

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
