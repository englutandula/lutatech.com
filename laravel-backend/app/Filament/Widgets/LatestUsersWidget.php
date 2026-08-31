<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\UserResource;
use App\Models\User;
use Filament\Notifications\Notification;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class LatestUsersWidget extends BaseWidget
{
    protected static ?int $sort = 2;

    protected int | string | array $columnSpan = 'full';

    protected static ?string $heading = 'Recent Client Registrations';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                User::query()->where('is_admin', false)->latest('created_at')->limit(8)
            )
            ->columns([
                Tables\Columns\ImageColumn::make('avatar')
                    ->label('')
                    ->circular()
                    ->width(40)
                    ->defaultImageUrl(fn ($record) => 'https://ui-avatars.com/api/?name=' . urlencode($record->name) . '&color=FFFFFF&background=E53935'),

                Tables\Columns\TextColumn::make('name')
                    ->label('Client Name')
                    ->weight('bold'),

                Tables\Columns\TextColumn::make('email')
                    ->copyable()
                    ->icon('heroicon-m-envelope'),

                Tables\Columns\IconColumn::make('email_verified_at')
                    ->label('Verified')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-badge')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger')
                    ->alignCenter(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Registered')
                    ->since()
                    ->alignEnd(),
            ])
            ->actions([
                Tables\Actions\Action::make('quick_verify')
                    ->label('Verify')
                    ->icon('heroicon-o-check')
                    ->color('success')
                    ->button()
                    ->size('xs')
                    ->visible(fn (User $record) => is_null($record->email_verified_at))
                    ->requiresConfirmation()
                    ->modalHeading('Verify Client')
                    ->action(function (User $record) {
                        $record->markEmailAsVerified();
                        Notification::make()
                            ->title('Client Verified')
                            ->success()
                            ->send();
                    }),
            ])
            ->paginated(false);
    }
}
