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
class AccountActivationNotification extends Notification implements ShouldQueue
{
    use Queueable;

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
            ->subject('Activate Your Account — ' . config('app.name', 'Luta Tech'))
            ->greeting('Hello ' . ($notifiable->name ?? 'there') . '!')
            ->line('Welcome to ' . config('app.name', 'Luta Tech') . '! Your Google account has been linked.')
            ->line('Please click the button below to activate your account and get started.')
            ->action('Activate My Account', $activationUrl)
            ->line('This activation link will expire in 24 hours.')
            ->line('If you did not sign up for ' . config('app.name', 'Luta Tech') . ', please ignore this email.')
            ->salutation('Best regards, The ' . config('app.name', 'Luta Tech') . ' Team');
    }

    /**
     * Build the signed activation URL pointing through the frontend.
     */
    protected function buildActivationUrl(object $notifiable): string
    {
        $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'https://lutatech.com')), '/');

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
