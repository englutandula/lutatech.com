<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

/**
 * @deprecated Use VerificationActivationNotification for email/password users
 *             or AccountActivationNotification for social (Google) users.
 *
 * This class is preserved for backwards compatibility with any existing signed
 * URLs that used the 'verification.verify' route name. It delegates to the
 * new VerificationActivationNotification logic.
 */
class VerifyEmailNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'https://lutatech.com')), '/');

        $signedBackendUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id'   => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        $verificationUrl = $frontendUrl . '/verify-email?verify_url=' . urlencode($signedBackendUrl);

        return (new MailMessage)
            ->subject('Verify Your Email & Activate Your Account — ' . config('app.name', 'Luta Tech'))
            ->greeting('Hello ' . ($notifiable->name ?? 'there') . '!')
            ->line('Thank you for signing up with ' . config('app.name', 'Luta Tech') . '.')
            ->line('Please click the button below to verify your email address and activate your account.')
            ->action('Verify & Activate Account', $verificationUrl)
            ->line('This link will expire in ' . Config::get('auth.verification.expire', 60) . ' minutes.')
            ->line('If you did not create an account, no further action is required.')
            ->salutation('Best regards, The ' . config('app.name', 'Luta Tech') . ' Team');
    }
}
