<?php

namespace App\Models;

use App\Notifications\ResetPasswordNotification;
use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Account status constants.
 *
 * pending   - registered but not yet activated
 * active    - fully activated, can access protected areas
 * suspended - temporarily blocked by an administrator
 * disabled  - permanently deactivated by an administrator
 */
class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    // -------------------------------------------------------------------------
    // Account status constants
    // -------------------------------------------------------------------------
    const STATUS_PENDING   = 'pending';
    const STATUS_ACTIVE    = 'active';
    const STATUS_SUSPENDED = 'suspended';
    const STATUS_DISABLED  = 'disabled';

    // -------------------------------------------------------------------------
    // Mass-assignable attributes
    // -------------------------------------------------------------------------
    protected $fillable = [
        'name',
        'email',
        'avatar',
        'password',
        'email_verified_at',
        'account_status',
        'last_login_at',
        'welcome_email_sent_at',
    ];

    // -------------------------------------------------------------------------
    // Hidden attributes (never serialised in responses)
    // -------------------------------------------------------------------------
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // -------------------------------------------------------------------------
    // Attribute casts
    // -------------------------------------------------------------------------
    protected function casts(): array
    {
        return [
            'email_verified_at'     => 'datetime',
            'last_login_at'         => 'datetime',
            'welcome_email_sent_at' => 'datetime',
            'is_admin'              => 'boolean',
            'password'              => 'hashed',
        ];
    }

    // -------------------------------------------------------------------------
    // Filament admin panel access
    // -------------------------------------------------------------------------
    public function canAccessPanel(Panel $panel): bool
    {
        return (bool) $this->is_admin;
    }

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    /**
     * OAuth social accounts linked to this user.
     */
    public function socialAccounts(): HasMany
    {
        return $this->hasMany(SocialAccount::class);
    }

    // -------------------------------------------------------------------------
    // Account status helpers
    // -------------------------------------------------------------------------

    public function isActive(): bool
    {
        return $this->account_status === self::STATUS_ACTIVE;
    }

    public function isPending(): bool
    {
        return $this->account_status === self::STATUS_PENDING;
    }

    public function isSuspended(): bool
    {
        return $this->account_status === self::STATUS_SUSPENDED;
    }

    public function isDisabled(): bool
    {
        return $this->account_status === self::STATUS_DISABLED;
    }

    public function hasVerifiedEmail(): bool
    {
        return $this->email_verified_at !== null;
    }

    /**
     * Returns the email address used for email verification logic.
     * Required by Laravel's signed URL verification helpers.
     */
    public function getEmailForVerification(): string
    {
        return $this->email;
    }

    /**
     * Activate the account (sets status to active and marks email verified
     * if not already verified — safe to call for both user types).
     */
    public function activate(?bool $markEmailVerified = false): bool
    {
        $data = ['account_status' => self::STATUS_ACTIVE];

        if ($markEmailVerified && $this->email_verified_at === null) {
            $data['email_verified_at'] = now();
        }

        return $this->forceFill($data)->save();
    }

    /**
     * Mark the welcome email as sent (idempotent — only sets once).
     */
    public function markWelcomeEmailSent(): bool
    {
        if ($this->welcome_email_sent_at !== null) {
            return false;
        }

        $this->forceFill(['welcome_email_sent_at' => now()])->save();
        return true;
    }

    /**
     * Record a successful login timestamp.
     */
    public function recordLogin(): void
    {
        $this->forceFill(['last_login_at' => now()])->save();
    }

    /**
     * Whether the user registered using only a social provider (no local password).
     */
    public function isSocialOnlyUser(): bool
    {
        return empty($this->password) && $this->socialAccounts()->exists();
    }

    // -------------------------------------------------------------------------
    // Notification overrides
    // -------------------------------------------------------------------------

    /**
     * Custom password reset notification using our branded template.
     */
    public function sendPasswordResetNotification(#[\SensitiveParameter] $token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }
}
