<?php

namespace App\Listeners;

use App\Events\AccountActivated;
use App\Notifications\WelcomeNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Sends the welcome email once after account activation.
 *
 * Idempotency guard: checks welcome_email_sent_at IS NULL before sending.
 * This means re-clicking the activation link never triggers a duplicate email.
 */
class SendWelcomeEmailListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The queue to use for this listener job.
     */
    public string $queue = 'default';

    /**
     * Number of times to retry if the job fails.
     */
    public int $tries = 3;

    /**
     * Handle the event.
     */
    public function handle(AccountActivated $event): void
    {
        $user = $event->user;

        // Idempotency: only send if welcome email has never been sent.
        if ($user->welcome_email_sent_at !== null) {
            Log::info("Welcome email already sent to user [{$user->id}] — skipping.");
            return;
        }

        // Re-fetch fresh from DB to avoid stale model state in queue.
        $user = $user->fresh();

        if (!$user || $user->welcome_email_sent_at !== null) {
            return;
        }

        try {
            $user->notify(new WelcomeNotification());
            $user->markWelcomeEmailSent();
            Log::info("Welcome email sent to user [{$user->id}] ({$user->email}).");
        } catch (Throwable $e) {
            Log::error("Failed to send welcome email to user [{$user->id}]: " . $e->getMessage());
            $this->fail($e);
        }
    }
}
