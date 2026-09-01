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
        $defaultTemplate = \App\Services\MessageTemplateService::getTemplates()['ai_system_update'];

        return [
            // Global Broadcast Action
            Actions\Action::make('global_broadcast')
                ->label('Broadcast Message to Clients')
                ->icon('heroicon-o-megaphone')
                ->color('primary')
                ->modalHeading('Broadcast Announcement / Update to Clients')
                ->modalDescription('Choose a pre-built template or compose a custom message. Emails will be dispatched immediately.')
                ->form([
                    Forms\Components\Select::make('target_audience')
                        ->label('Target Audience')
                        ->options([
                            'all' => '📢 All Registered Clients',
                            'active' => '✅ Active Clients Only',
                            'pending' => '⏳ Pending Activation Clients Only',
                            'verified' => '🛡️ Verified Clients Only',
                            'unverified' => '✉️ Unverified Clients Only',
                        ])
                        ->default('all')
                        ->required(),

                    Forms\Components\Select::make('template')
                        ->label('Choose Pre-built Message Template (10 Options Available)')
                        ->options(\App\Services\MessageTemplateService::getSelectOptions())
                        ->default('ai_system_update')
                        ->live()
                        ->afterStateUpdated(function ($state, Forms\Set $set) {
                            $templates = \App\Services\MessageTemplateService::getTemplates();
                            if (isset($templates[$state])) {
                                $set('subject', $templates[$state]['subject']);
                                $set('message', $templates[$state]['message']);
                                $set('action_text', $templates[$state]['action_text']);
                                $set('action_url', $templates[$state]['action_url']);
                            }
                        })
                        ->helperText('Selecting a template auto-populates the fields below. You can edit before sending.'),

                    Forms\Components\TextInput::make('subject')
                        ->label('Email Subject')
                        ->required()
                        ->default($defaultTemplate['subject'])
                        ->maxLength(255),

                    Forms\Components\Textarea::make('message')
                        ->label('Email Message Body')
                        ->required()
                        ->rows(7)
                        ->default($defaultTemplate['message']),

                    Forms\Components\Grid::make(2)
                        ->schema([
                            Forms\Components\TextInput::make('action_text')
                                ->label('Optional Button Label')
                                ->default($defaultTemplate['action_text'])
                                ->placeholder('e.g. Check Tools Status'),

                            Forms\Components\TextInput::make('action_url')
                                ->label('Optional Button URL')
                                ->url()
                                ->default($defaultTemplate['action_url'])
                                ->placeholder('https://lutatech.com/tools'),
                        ]),
                ])
                ->action(function (array $data) {
                    $query = User::query()->where(function ($q) {
                        $q->where('is_admin', false)->orWhereNull('is_admin');
                    });

                    if ($data['target_audience'] === 'active') {
                        $query->where('account_status', 'active');
                    } elseif ($data['target_audience'] === 'pending') {
                        $query->where('account_status', 'pending');
                    } elseif ($data['target_audience'] === 'verified') {
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
                        ->body("Successfully delivered message to {$count} registered clients.")
                        ->success()
                        ->send();
                }),

            Actions\CreateAction::make()->label('New Client'),

            Actions\Action::make('clear_all_clients')
                ->label('Clear All Clients')
                ->icon('heroicon-o-trash')
                ->color('danger')
                ->requiresConfirmation()
                ->modalHeading('Clear All Registered Clients?')
                ->modalDescription('This will permanently delete all registered clients, their linked Google social accounts, and login tokens so you can start completely fresh. The administrator account will NOT be touched.')
                ->modalSubmitActionLabel('Yes, Delete All Clients')
                ->action(function () {
                    $clients = User::where(function ($q) {
                        $q->where('is_admin', false)->orWhereNull('is_admin');
                    })->get();

                    $count = 0;
                    foreach ($clients as $client) {
                        $client->socialAccounts()->delete();
                        $client->tokens()->delete();
                        $client->delete();
                        $count++;
                    }

                    Notification::make()
                        ->title('Database Cleared')
                        ->body("Successfully deleted {$count} registered clients. Ready for fresh registrations!")
                        ->success()
                        ->send();
                }),
        ];
    }

    public function getTabs(): array
    {
        $baseQuery = fn () => User::where(function ($q) {
            $q->where('is_admin', false)->orWhereNull('is_admin');
        });

        return [
            'all' => Tab::make('All Clients')
                ->badge($baseQuery()->count()),

            'active' => Tab::make('Active')
                ->badge($baseQuery()->where('account_status', 'active')->count())
                ->badgeColor('success')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('account_status', 'active')),

            'pending' => Tab::make('Pending Activation')
                ->badge($baseQuery()->where('account_status', 'pending')->count())
                ->badgeColor('warning')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('account_status', 'pending')),

            'verified' => Tab::make('Verified')
                ->badge($baseQuery()->whereNotNull('email_verified_at')->count())
                ->badgeColor('info')
                ->modifyQueryUsing(fn (Builder $query) => $query->whereNotNull('email_verified_at')),

            'suspended' => Tab::make('Suspended')
                ->badge($baseQuery()->where('account_status', 'suspended')->count())
                ->badgeColor('danger')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('account_status', 'suspended')),
        ];
    }
}
