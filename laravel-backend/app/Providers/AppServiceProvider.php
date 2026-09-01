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

        // Force HTTPS and correct API root URL on Namecheap production
        if (config('app.env') === 'production' || str_contains((string) config('app.url'), 'lutatech.com')) {
            \Illuminate\Support\Facades\URL::forceRootUrl('https://lutatech.com/api');
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
