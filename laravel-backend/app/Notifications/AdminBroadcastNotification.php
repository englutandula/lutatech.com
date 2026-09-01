<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminBroadcastNotification extends Notification
{
    public string $subject;
    public string $messageContent;
    public ?string $actionText;
    public ?string $actionUrl;

    public function __construct(
        string $subject,
        string $messageContent,
        ?string $actionText = null,
        ?string $actionUrl = null
    ) {
        $this->subject = $subject;
        $this->messageContent = $messageContent;
        $this->actionText = $actionText;
        $this->actionUrl = $actionUrl;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)->subject($this->subject);

        // If the message body doesn't already begin with a greeting, add a friendly one
        $hasGreeting = preg_match('/^(hello|hi|dear|greetings)/i', trim($this->messageContent));
        if (! $hasGreeting) {
            $mail->greeting('Hello ' . ($notifiable->name ?? 'there') . ',');
        }

        // Split paragraphs by newline
        $lines = explode("\n", $this->messageContent);
        foreach ($lines as $line) {
            $trimmed = trim($line);
            if (!empty($trimmed)) {
                $mail->line($trimmed);
            }
        }

        if (!empty($this->actionText) && !empty($this->actionUrl)) {
            $mail->action($this->actionText, $this->actionUrl);
        }

        // Only append default salutation if the message does not already contain one
        $hasSalutation = str_contains($this->messageContent, 'LutaTech Team')
            || str_contains($this->messageContent, 'Warm regards')
            || str_contains($this->messageContent, 'Best regards');

        if (! $hasSalutation) {
            $mail->salutation('Best regards, The LutaTech Team');
        }

        return $mail;
    }
}
