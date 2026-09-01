<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use App\Notifications\AdminBroadcastNotification;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Throwable;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $modelLabel = 'Client';

    protected static ?string $pluralModelLabel = 'Registered Clients';

    protected static ?string $navigationLabel = 'Clients';

    protected static ?string $navigationIcon = 'heroicon-o-user-group';

    protected static ?string $navigationGroup = 'Client Management';

    protected static ?int $navigationSort = 1;

    /**
     * Only show registered website clients in this resource (excludes admin).
     * Uses where(is_admin = false OR is_admin IS NULL) so all clients always appear.
     */
    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->where(function ($query) {
            $query->where('is_admin', false)->orWhereNull('is_admin');
        });
    }

    /**
     * Pre-built message form schema with 10 templates.
     */
    public static function getMessageFormSchema(): array
    {
        $defaultTemplate = \App\Services\MessageTemplateService::getTemplates()['ai_system_update'];

        return [
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
                ->helperText('Selecting a template auto-populates the fields below. You can freely edit them before sending.'),

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
        ];
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Client Information')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->label('Client Name')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('email')
                            ->label('Email Address')
                            ->email()
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(255),
                        Forms\Components\TextInput::make('password')
                            ->password()
                            ->dehydrateStateUsing(fn ($state) => !empty($state) ? Hash::make($state) : null)
                            ->dehydrated(fn ($state) => filled($state))
                            ->required(fn (string $context): bool => $context === 'create')
                            ->minLength(8),
                        Forms\Components\FileUpload::make('avatar')
                            ->image()
                            ->avatar()
                            ->directory('avatars'),
                    ])->columns(2),

                Forms\Components\Section::make('Account Status & Controls')
                    ->schema([
                        Forms\Components\Select::make('account_status')
                            ->label('Account Status')
                            ->options([
                                'active' => 'Active',
                                'pending' => 'Pending Activation',
                                'suspended' => 'Suspended',
                                'disabled' => 'Disabled',
                            ])
                            ->default('pending')
                            ->required(),

                        Forms\Components\DateTimePicker::make('email_verified_at')
                            ->label('Email Verified At')
                            ->helperText('Select a date to manually mark email as verified.')
                            ->nullable(),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('avatar')
                    ->label('')
                    ->circular()
                    ->width(40)
                    ->defaultImageUrl(fn ($record) => 'https://ui-avatars.com/api/?name=' . urlencode($record->name) . '&color=FFFFFF&background=E53935'),

                Tables\Columns\TextColumn::make('name')
                    ->label('Client Name')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->wrap(),

                Tables\Columns\TextColumn::make('email')
                    ->searchable()
                    ->sortable()
                    ->copyable()
                    ->copyMessage('Email copied')
                    ->icon('heroicon-m-envelope')
                    ->wrap(),

                Tables\Columns\TextColumn::make('account_status')
                    ->label('Status')
                    ->badge()
                    ->state(fn (User $record): string => ucfirst($record->account_status ?? 'pending'))
                    ->color(fn (string $state): string => match (strtolower($state)) {
                        'active' => 'success',
                        'pending' => 'warning',
                        'suspended' => 'danger',
                        'disabled' => 'gray',
                        default => 'secondary',
                    })
                    ->alignCenter()
                    ->sortable(),

                Tables\Columns\IconColumn::make('email_verified_at')
                    ->label('Verified')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-badge')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger')
                    ->tooltip(fn ($record) => $record->email_verified_at ? 'Verified on ' . $record->email_verified_at->format('M d, Y H:i') : 'Unverified email')
                    ->alignCenter()
                    ->sortable(),

                Tables\Columns\TextColumn::make('auth_type')
                    ->label('Method')
                    ->badge()
                    ->state(function (User $record): string {
                        $social = $record->socialAccounts->pluck('provider_name')->first();
                        return $social ? ucfirst($social) : 'Email';
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'Google' => 'info',
                        default => 'primary',
                    })
                    ->alignCenter(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Registered')
                    ->dateTime('M d, Y H:i')
                    ->since()
                    ->sortable()
                    ->alignEnd(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('account_status')
                    ->label('Account Status')
                    ->options([
                        'active' => 'Active Clients',
                        'pending' => 'Pending Activation',
                        'suspended' => 'Suspended Clients',
                        'disabled' => 'Disabled Clients',
                    ]),

                Tables\Filters\SelectFilter::make('verification_status')
                    ->label('Email Verification')
                    ->options([
                        'verified' => 'Verified Clients Only',
                        'unverified' => 'Unverified Clients Only',
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        if ($data['value'] === 'verified') {
                            return $query->whereNotNull('email_verified_at');
                        }
                        if ($data['value'] === 'unverified') {
                            return $query->whereNull('email_verified_at');
                        }
                        return $query;
                    }),
            ])
            ->actions([
                Tables\Actions\ActionGroup::make([
                    // 1. Send Message / Alert with 10 Templates
                    Tables\Actions\Action::make('send_message')
                        ->label('Send Message / Alert')
                        ->icon('heroicon-o-paper-airplane')
                        ->color('info')
                        ->modalHeading(fn (User $record) => "Send Message to {$record->name} ({$record->email})")
                        ->form(self::getMessageFormSchema())
                        ->action(function (User $record, array $data) {
                            try {
                                $record->notify(new AdminBroadcastNotification(
                                    $data['subject'],
                                    $data['message'],
                                    $data['action_text'] ?? null,
                                    $data['action_url'] ?? null
                                ));

                                Notification::make()
                                    ->title('Message Delivered')
                                    ->body("Successfully sent email to {$record->email}.")
                                    ->success()
                                    ->send();
                            } catch (Throwable $e) {
                                Notification::make()
                                    ->title('Delivery Failed')
                                    ->body($e->getMessage())
                                    ->danger()
                                    ->send();
                            }
                        }),

                    // 2. Activate Account
                    Tables\Actions\Action::make('activate_account')
                        ->label('Activate Client Account')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->visible(fn (User $record) => $record->account_status !== 'active' || is_null($record->email_verified_at))
                        ->requiresConfirmation()
                        ->modalHeading('Activate Client Account')
                        ->modalDescription(fn (User $record) => "Immediately activate account for {$record->email} and mark their email as verified?")
                        ->action(function (User $record) {
                            $record->activate(true);
                            event(new \App\Events\AccountActivated($record));

                            Notification::make()
                                ->title('Client Account Activated')
                                ->body("{$record->email} is now fully active.")
                                ->success()
                                ->send();
                        }),

                    // 3. Suspend / Unsuspend
                    Tables\Actions\Action::make('toggle_suspend')
                        ->label(fn (User $record) => $record->account_status === 'suspended' ? 'Reactivate Account' : 'Suspend Account')
                        ->icon('heroicon-o-no-symbol')
                        ->color(fn (User $record) => $record->account_status === 'suspended' ? 'success' : 'danger')
                        ->requiresConfirmation()
                        ->action(function (User $record) {
                            $newStatus = $record->account_status === 'suspended' ? 'active' : 'suspended';
                            $record->update(['account_status' => $newStatus]);

                            Notification::make()
                                ->title('Account Status Updated')
                                ->body("Client {$record->email} is now {$newStatus}.")
                                ->success()
                                ->send();
                        }),

                    // 4. Resend Activation Link
                    Tables\Actions\Action::make('resend_activation')
                        ->label('Resend Activation Email')
                        ->icon('heroicon-o-arrow-path')
                        ->color('warning')
                        ->visible(fn (User $record) => $record->account_status === 'pending')
                        ->action(function (User $record) {
                            try {
                                if ($record->isSocialOnlyUser()) {
                                    $record->notify(new \App\Notifications\AccountActivationNotification());
                                } else {
                                    $record->notify(new \App\Notifications\VerificationActivationNotification());
                                }

                                Notification::make()
                                    ->title('Activation Email Sent')
                                    ->body("Sent activation link to {$record->email}.")
                                    ->success()
                                    ->send();
                            } catch (Throwable $e) {
                                Notification::make()
                                    ->title('Delivery Failed')
                                    ->body($e->getMessage())
                                    ->danger()
                                    ->send();
                            }
                        }),

                    Tables\Actions\EditAction::make(),
                    Tables\Actions\DeleteAction::make(),
                ])
                ->tooltip('Client Actions')
                ->icon('heroicon-m-ellipsis-vertical'),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\BulkAction::make('bulk_broadcast')
                        ->label('Broadcast Message to Selected Clients')
                        ->icon('heroicon-o-megaphone')
                        ->color('primary')
                        ->form(self::getMessageFormSchema())
                        ->action(function (Collection $records, array $data) {
                            $count = 0;
                            foreach ($records as $user) {
                                try {
                                    $user->notify(new AdminBroadcastNotification(
                                        $data['subject'],
                                        $data['message'],
                                        $data['action_text'] ?? null,
                                        $data['action_url'] ?? null
                                    ));
                                    $count++;
                                } catch (Throwable $e) {
                                    Log::warning("Failed sending to {$user->email}: " . $e->getMessage());
                                }
                            }

                            Notification::make()
                                ->title('Broadcast Dispatched')
                                ->body("Sent announcement to {$count} selected clients.")
                                ->success()
                                ->send();
                        })
                        ->deselectRecordsAfterCompletion(),

                    Tables\Actions\BulkAction::make('bulk_activate')
                        ->label('Activate Selected Clients')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->requiresConfirmation()
                        ->action(function (Collection $records) {
                            $count = 0;
                            foreach ($records as $user) {
                                $user->activate(true);
                                event(new \App\Events\AccountActivated($user));
                                $count++;
                            }

                            Notification::make()
                                ->title('Clients Activated')
                                ->body("{$count} clients activated and verified.")
                                ->success()
                                ->send();
                        })
                        ->deselectRecordsAfterCompletion(),

                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
