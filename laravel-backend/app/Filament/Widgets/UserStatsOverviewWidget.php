<?php

namespace App\Filament\Widgets;

use App\Models\SocialAccount;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class UserStatsOverviewWidget extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $totalClients = User::where('is_admin', false)->count();
        $verifiedCount = User::where('is_admin', false)->whereNotNull('email_verified_at')->count();
        $unverifiedCount = User::where('is_admin', false)->whereNull('email_verified_at')->count();
        $socialLogins = SocialAccount::count();

        $verifiedPercentage = $totalClients > 0 ? round(($verifiedCount / $totalClients) * 100) : 0;

        return [
            Stat::make('Registered Clients', $totalClients)
                ->description('Website registered customers')
                ->descriptionIcon('heroicon-m-user-group')
                ->color('primary')
                ->chart([2, 5, 8, 12, 18, 22, max(1, $totalClients)]),

            Stat::make('Verified Clients', $verifiedCount)
                ->description("{$verifiedPercentage}% verification rate")
                ->descriptionIcon('heroicon-m-check-badge')
                ->color('success'),

            Stat::make('Pending Verification', $unverifiedCount)
                ->description('Unverified clients waiting')
                ->descriptionIcon('heroicon-m-clock')
                ->color($unverifiedCount > 0 ? 'danger' : 'gray'),

            Stat::make('Social OAuth Signups', $socialLogins)
                ->description('Google & GitHub connected')
                ->descriptionIcon('heroicon-m-globe-alt')
                ->color('info'),
        ];
    }
}
