<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent when a user who signed up exclusively via Google (or another social provider)
 * requests a password reset.
 *
 * Explains that their account uses social sign-in and provides a direct link to sign in,
 * without exposing sensitive security details or allowing arbitrary password creation.
 */
class SocialAccountPasswordResetNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected string $provider = 'Google'
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');
        $providerName = ucfirst($this->provider);

        return (new MailMessage)
            ->subject('Password Reset Request — ' . config('app.name', 'Luta Tech'))
            ->greeting('Hello ' . ($notifiable->name ?? 'there') . '!')
            ->line('We received a request to reset the password for your ' . config('app.name', 'Luta Tech') . ' account.')
            ->line('Your account was created using **' . $providerName . ' Sign-In** and does not currently have a separate password.')
            ->line('You can sign in securely at any time using your ' . $providerName . ' account:')
            ->action('Sign In with ' . $providerName, $frontendUrl . '/login')
            ->line('If you did not request a password reset, you can safely ignore this email — your account remains secure.')
            ->salutation('Best regards, The ' . config('app.name', 'Luta Tech') . ' Team');
    }
}
