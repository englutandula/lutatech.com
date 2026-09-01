<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;

/**
 * Sent to Google (social) users after their first OAuth login.
 *
 * Google has already verified their email. This link performs ONLY:
 *   - Sets account_status = active (website activation)
 *
 * Route: activation.activate (signed, expires 24 hours)
 */
class AccountActivationNotification extends Notification
{

    /**
     * The notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Build the mail message.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $activationUrl = $this->buildActivationUrl($notifiable);

        return (new MailMessage)
            ->subject('Activate Your LutaTech Account')
            ->greeting('Hello ' . ($notifiable->name ?? 'there') . '!')
            ->line('Welcome to LutaTech! Your Google account has been linked.')
            ->line('Please click the button below to activate your account and get started.')
            ->action('Activate My Account', $activationUrl)
            ->line('This activation link will expire in 24 hours.')
            ->line('If you did not sign up for LutaTech, please ignore this email.')
            ->salutation('Best regards, The LutaTech Team');
    }

    /**
     * Build the signed activation URL pointing through the frontend.
     */
    protected function buildActivationUrl(object $notifiable): string
    {
        $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'https://lutatech.com')), '/');

        if (app()->environment('production') || str_contains((string) config('app.url'), 'lutatech.com')) {
            URL::forceRootUrl('https://lutatech.com/api');
            URL::forceScheme('https');
        }

        $signedBackendUrl = URL::temporarySignedRoute(
            'activation.activate',
            Carbon::now()->addHours(24),
            [
                'id'   => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        return $frontendUrl . '/verify-email?activate_url=' . urlencode($signedBackendUrl);
    }
}
