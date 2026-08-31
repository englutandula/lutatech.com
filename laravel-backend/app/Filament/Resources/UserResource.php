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
     */
    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->where('is_admin', false);
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

                Forms\Components\Section::make('Account Status')
                    ->schema([
                        Forms\Components\DateTimePicker::make('email_verified_at')
                            ->label('Email Verified At')
                            ->helperText('Select a date to manually verify this client.')
                            ->nullable(),
                    ]),
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

                Tables\Columns\IconColumn::make('email_verified_at')
                    ->label('Verified')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-badge')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger')
                    ->tooltip(fn ($record) => $record->email_verified_at ? 'Verified on ' . $record->email_verified_at->format('M d, Y H:i') : 'Unverified client')
                    ->alignCenter()
                    ->sortable(),

                Tables\Columns\TextColumn::make('auth_type')
                    ->label('Signed up with')
                    ->badge()
                    ->state(function (User $record): string {
                        $social = $record->socialAccounts->pluck('provider_name')->first();
                        return $social ? ucfirst($social) : 'Website Form';
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'Google' => 'info',
                        'Github' => 'gray',
                        default => 'primary',
                    })
                    ->alignCenter(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Registered')
                    ->dateTime('M d, Y')
                    ->since()
                    ->sortable()
                    ->alignEnd(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
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
                    // 1. Manually Verify
                    Tables\Actions\Action::make('verify_email')
                        ->label('Verify Email')
                        ->icon('heroicon-o-check-badge')
                        ->color('success')
                        ->visible(fn (User $record) => is_null($record->email_verified_at))
                        ->requiresConfirmation()
                        ->modalHeading('Verify Client Email')
                        ->modalDescription(fn (User $record) => "Mark client {$record->email} as verified immediately?")
                        ->action(function (User $record) {
                            $record->markEmailAsVerified();
                            Notification::make()
                                ->title('Client Email Verified')
                                ->body("{$record->email} is now marked as verified.")
                                ->success()
                                ->send();
                        }),

                    // 2. Resend Link
                    Tables\Actions\Action::make('resend_verification')
                        ->label('Resend Verification Link')
                        ->icon('heroicon-o-paper-airplane')
                        ->color('warning')
                        ->visible(fn (User $record) => is_null($record->email_verified_at))
                        ->action(function (User $record) {
                            try {
                                $record->sendEmailVerificationNotification();
                                Notification::make()
                                    ->title('Verification Email Sent')
                                    ->body("Sent fresh verification link to {$record->email}.")
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

                    // 3. Send Message
                    Tables\Actions\Action::make('send_message')
                        ->label('Send Message / Alert')
                        ->icon('heroicon-o-chat-bubble-left-ellipsis')
                        ->color('info')
                        ->form([
                            Forms\Components\TextInput::make('subject')
                                ->label('Subject')
                                ->required()
                                ->default('Notice regarding your Luta Tech account'),
                            Forms\Components\Textarea::make('message')
                                ->label('Message Body')
                                ->required()
                                ->rows(5),
                            Forms\Components\TextInput::make('action_text')
                                ->label('Optional Button Label')
                                ->placeholder('e.g. Open Luta Tech'),
                            Forms\Components\TextInput::make('action_url')
                                ->label('Optional Button URL')
                                ->url()
                                ->placeholder('http://localhost:3000/dashboard'),
                        ])
                        ->action(function (User $record, array $data) {
                            try {
                                $record->notify(new AdminBroadcastNotification(
                                    $data['subject'],
                                    $data['message'],
                                    $data['action_text'] ?? null,
                                    $data['action_url'] ?? null
                                ));

                                Notification::make()
                                    ->title('Email Sent')
                                    ->body("Delivered to {$record->email}.")
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
                        ->form([
                            Forms\Components\TextInput::make('subject')
                                ->label('Subject')
                                ->required()
                                ->default('Important Announcement from Luta Tech'),
                            Forms\Components\Textarea::make('message')
                                ->label('Message')
                                ->required()
                                ->rows(6),
                            Forms\Components\TextInput::make('action_text')
                                ->label('Button Text')
                                ->placeholder('e.g. Go to Dashboard'),
                            Forms\Components\TextInput::make('action_url')
                                ->label('Button URL')
                                ->url()
                                ->placeholder('http://localhost:3000/dashboard'),
                        ])
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
                                ->body("Sent announcement to {$count} clients.")
                                ->success()
                                ->send();
                        })
                        ->deselectRecordsAfterCompletion(),

                    Tables\Actions\BulkAction::make('bulk_verify')
                        ->label('Mark Selected as Verified')
                        ->icon('heroicon-o-check-badge')
                        ->color('success')
                        ->requiresConfirmation()
                        ->action(function (Collection $records) {
                            $count = 0;
                            foreach ($records as $user) {
                                if (is_null($user->email_verified_at)) {
                                    $user->markEmailAsVerified();
                                    $count++;
                                }
                            }

                            Notification::make()
                                ->title('Clients Verified')
                                ->body("{$count} clients marked as verified.")
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
