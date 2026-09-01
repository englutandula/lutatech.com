<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent once after account activation via the AccountActivated event.
 *
 * Guard: welcome_email_sent_at must be NULL — enforced in SendWelcomeEmailListener.
 */
class WelcomeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'https://lutatech.com')), '/');

        return (new MailMessage)
            ->subject('Welcome to ' . config('app.name', 'Luta Tech') . '! 🎉')
            ->greeting('Welcome, ' . ($notifiable->name ?? 'Friend') . '!')
            ->line('Your account is now active. We are thrilled to have you at ' . config('app.name', 'Luta Tech') . ' — your complete creative suite for AI background removal, passport photo generation, QR codes, PDF utilities, and more.')
            ->action('Go to Dashboard', $frontendUrl . '/dashboard')
            ->line('If you have any questions, simply reply to this email or reach out to our team at hello@lutatech.com.')
            ->salutation('Warm regards, The ' . config('app.name', 'Luta Tech') . ' Team');
    }
}
