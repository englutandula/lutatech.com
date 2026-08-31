<?php

namespace App\Filament\Resources\UserResource\Pages;

use App\Filament\Resources\UserResource;
use App\Models\User;
use App\Notifications\AdminBroadcastNotification;
use Filament\Actions;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Components\Tab;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Log;
use Throwable;

class ListUsers extends ListRecords
{
    protected static string $resource = UserResource::class;

    protected static ?string $title = 'Registered Clients';

    protected function getHeaderActions(): array
    {
        return [
            // Global Broadcast Action
            Actions\Action::make('global_broadcast')
                ->label('Send Broadcast Announcement')
                ->icon('heroicon-o-megaphone')
                ->color('primary')
                ->form([
                    Forms\Components\Select::make('target_audience')
                        ->label('Target Audience')
                        ->options([
                            'all' => 'All Registered Clients',
                            'verified' => 'Verified Clients Only',
                            'unverified' => 'Unverified Clients Only (e.g. Verification Reminders)',
                        ])
                        ->default('all')
                        ->required(),
                    Forms\Components\TextInput::make('subject')
                        ->label('Email Subject')
                        ->required()
                        ->default('Important Announcement from Luta Tech'),
                    Forms\Components\Textarea::make('message')
                        ->label('Email Body')
                        ->required()
                        ->rows(6)
                        ->placeholder('Type your announcement, maintenance notice, or update here...'),
                    Forms\Components\TextInput::make('action_text')
                        ->label('Optional Button Text')
                        ->placeholder('e.g. Visit Luta Tech Dashboard'),
                    Forms\Components\TextInput::make('action_url')
                        ->label('Optional Button URL')
                        ->url()
                        ->placeholder('http://localhost:3000/dashboard'),
                ])
                ->action(function (array $data) {
                    $query = User::query()->where('is_admin', false);

                    if ($data['target_audience'] === 'verified') {
                        $query->whereNotNull('email_verified_at');
                    } elseif ($data['target_audience'] === 'unverified') {
                        $query->whereNull('email_verified_at');
                    }

                    $users = $query->get();
                    $count = 0;

                    foreach ($users as $user) {
                        try {
                            $user->notify(new AdminBroadcastNotification(
                                $data['subject'],
                                $data['message'],
                                $data['action_text'] ?? null,
                                $data['action_url'] ?? null
                            ));
                            $count++;
                        } catch (Throwable $e) {
                            Log::warning("Broadcast failed for {$user->email}: " . $e->getMessage());
                        }
                    }

                    Notification::make()
                        ->title('Broadcast Dispatched')
                        ->body("Successfully sent email announcement to {$count} registered clients.")
                        ->success()
                        ->send();
                }),

            Actions\CreateAction::make()->label('New Client'),
        ];
    }

    public function getTabs(): array
    {
        return [
            'all' => Tab::make('All Clients')
                ->badge(User::where('is_admin', false)->count()),

            'verified' => Tab::make('Verified')
                ->badge(User::where('is_admin', false)->whereNotNull('email_verified_at')->count())
                ->badgeColor('success')
                ->modifyQueryUsing(fn (Builder $query) => $query->whereNotNull('email_verified_at')),

            'unverified' => Tab::make('Pending Verification')
                ->badge(User::where('is_admin', false)->whereNull('email_verified_at')->count())
                ->badgeColor('danger')
                ->modifyQueryUsing(fn (Builder $query) => $query->whereNull('email_verified_at')),
        ];
    }
}
