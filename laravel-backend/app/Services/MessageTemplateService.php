<?php

namespace App\Services;

class MessageTemplateService
{
    /**
     * 10 Pre-built, professional message templates for client communications.
     */
    public static function getTemplates(): array
    {
        $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'https://lutatech.com')), '/');

        return [
            'ai_system_update' => [
                'label' => '1. AI System Update (Temporary Slower Responses)',
                'subject' => 'AI System Update',
                'message' => "Dear Client,\n\nOur AI servers are currently being updated. You may experience slower response times temporarily. We apologize for any inconvenience and appreciate your patience.\n\n— LutaTech Team",
                'action_text' => 'Check Tools Status',
                'action_url' => $frontendUrl . '/tools',
            ],
            'scheduled_maintenance' => [
                'label' => '2. Scheduled Maintenance Notice (Advance Warning)',
                'subject' => 'Scheduled Maintenance Notice — LutaTech',
                'message' => "Dear Client,\n\nWe will be performing routine infrastructure maintenance on our servers to ensure peak performance and stability.\n\nDuring this brief maintenance window, our online tools may be temporarily unavailable for a few minutes. We apologize for the short interruption and thank you for your understanding.\n\n— LutaTech Team",
                'action_text' => 'Visit LutaTech',
                'action_url' => $frontendUrl,
            ],
            'new_features_release' => [
                'label' => '3. New AI Features & Tools Released 🚀',
                'subject' => 'Exciting New Features Now Available on LutaTech! 🚀',
                'message' => "Dear Client,\n\nWe are delighted to announce that new tools and enhancements have just landed on LutaTech!\n\nEnjoy faster AI background removal, ultra-precise passport photo cropping, enhanced PDF conversions, and high-speed image compression. Everything has been upgraded for an even smoother workflow.\n\nTry out the latest updates today!\n\n— LutaTech Team",
                'action_text' => 'Explore New Tools',
                'action_url' => $frontendUrl . '/tools',
            ],
            'service_restored' => [
                'label' => '4. All Systems Operational / Service Restored ✅',
                'subject' => 'All Systems Fully Operational — LutaTech',
                'message' => "Dear Client,\n\nWe are pleased to inform you that our server maintenance and upgrades have finished successfully. All AI tools, processing pipelines, and download services are operating at 100% capacity with maximum performance.\n\nThank you for your patience and loyalty.\n\n— LutaTech Team",
                'action_text' => 'Go to Dashboard',
                'action_url' => $frontendUrl . '/dashboard',
            ],
            'security_notice' => [
                'label' => '5. Account Security Advisory & Best Practices 🛡️',
                'subject' => 'Important Security Advisory for Your LutaTech Account',
                'message' => "Dear Client,\n\nYour account safety and privacy are our highest priorities. We encourage all clients to review their security settings, ensure their password is strong and unique, and keep their account details private.\n\nIf you ever notice any suspicious activity, please reset your password immediately or reach out to our team.\n\n— LutaTech Team",
                'action_text' => 'Manage Security',
                'action_url' => $frontendUrl . '/dashboard',
            ],
            'terms_privacy_update' => [
                'label' => '6. Terms of Service & Privacy Policy Updates 📄',
                'subject' => 'Updates to Our Terms of Service and Privacy Policy — LutaTech',
                'message' => "Dear Client,\n\nWe have recently updated our Terms of Service and Privacy Policy to provide greater transparency and ensure compliance with international data protection standards.\n\nYour continued use of LutaTech constitutes acceptance of these updated terms. We invite you to read through the updated policies at your convenience.\n\n— LutaTech Team",
                'action_text' => 'Read Privacy Policy',
                'action_url' => $frontendUrl . '/privacy',
            ],
            'performance_boost' => [
                'label' => '7. Platform Speed & Infrastructure Upgrade ⚡',
                'subject' => 'We Just Upgraded Our Infrastructure for Faster Processing! ⚡',
                'message' => "Dear Client,\n\nWe have expanded our high-speed compute clusters and CDN routing worldwide. Your AI background removal and image compression jobs will now process up to 3x faster with zero quality loss.\n\nExperience the speed boost next time you edit your files.\n\n— LutaTech Team",
                'action_text' => 'Try It Now',
                'action_url' => $frontendUrl . '/tools',
            ],
            'feedback_request' => [
                'label' => '8. Client Feedback & Feature Suggestions 💡',
                'subject' => 'We’d Love Your Feedback — Help Us Build Better Tools! 💡',
                'message' => "Dear Client,\n\nAt LutaTech, we build our creative tools around your needs. How has your experience been so far? Are there specific tools, formats, or options you would like us to add?\n\nPlease let us know by replying to this email or contacting our support desk. Every suggestion is carefully reviewed by our development team.\n\n— LutaTech Team",
                'action_text' => 'Contact Support',
                'action_url' => $frontendUrl . '/contact',
            ],
            'holiday_greetings' => [
                'label' => '9. Holiday Greetings & Warm Wishes 🌟',
                'subject' => 'Warm Holiday Wishes from the LutaTech Team! 🌟',
                'message' => "Dear Client,\n\nOn behalf of the entire team at LutaTech, we wish you joyful celebrations, peace, and prosperity this season!\n\nThank you for being part of our creative community. We look forward to continuing to empower your projects with cutting-edge tools throughout the year ahead.\n\n— LutaTech Team",
                'action_text' => 'Visit LutaTech',
                'action_url' => $frontendUrl,
            ],
            're_engagement' => [
                'label' => '10. We Miss You / Rediscover LutaTech Tools ✨',
                'subject' => 'Discover What’s New on LutaTech — We Miss You!',
                'message' => "Dear Client,\n\nIt’s been a while since your last visit! We’ve added new capabilities, faster processing, and sleek new tools for your daily image and document needs.\n\nCome back and see how quick and effortless your next creative task can be.\n\n— LutaTech Team",
                'action_text' => 'Open Creative Suite',
                'action_url' => $frontendUrl . '/tools',
            ],
        ];
    }

    /**
     * Options for Filament Select dropdown.
     */
    public static function getSelectOptions(): array
    {
        $options = [
            'custom' => '✏️ Custom Message (Compose from Scratch)',
        ];

        foreach (self::getTemplates() as $key => $tpl) {
            $options[$key] = $tpl['label'];
        }

        return $options;
    }
}
