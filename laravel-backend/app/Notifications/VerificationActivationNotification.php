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
 * Sent to email/password users after registration.
 *
 * ONE link performs BOTH actions:
 *   1. Marks email_verified_at = now()
 *   2. Sets account_status = active
 *
 * Route: verification.verify (signed, expires 60 minutes)
 */
class VerificationActivationNotification extends Notification
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
        $verificationUrl = $this->buildVerificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Verify Your Email & Activate Your Account — LutaTech')
            ->greeting('Hello ' . ($notifiable->name ?? 'there') . '!')
            ->line('Thank you for signing up with LutaTech.')
            ->line('Please click the button below to verify your email address and activate your account in one step.')
            ->action('Verify & Activate Account', $verificationUrl)
            ->line('This link will expire in ' . Config::get('auth.verification.expire', 60) . ' minutes.')
            ->line('If you did not create an account, no further action is required.')
            ->salutation('Best regards, The LutaTech Team');
    }

    /**
     * Build the signed backend verification URL, embedded in a frontend redirect.
     *
     * The frontend receives the signed URL as a query parameter and calls the
     * backend verify endpoint. This allows the frontend to show a loading page
     * before the verification completes.
     */
    protected function buildVerificationUrl(object $notifiable): string
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

        return $frontendUrl . '/verify-email?verify_url=' . urlencode($signedBackendUrl);
    }
}
