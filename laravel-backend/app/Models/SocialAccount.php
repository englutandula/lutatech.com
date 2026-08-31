<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A single row per (provider, provider_id) pair.
 * Multiple social accounts can link to one User.
 *
 * Supported provider_name values: 'google', 'github'
 */
class SocialAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'provider_name',
        'provider_id',
        'token',
        'refresh_token',
    ];

    protected $hidden = [
        'token',
        'refresh_token',
    ];

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Convenience accessor so callers can use ->provider as well as ->provider_name.
     */
    public function getProviderAttribute(): string
    {
        return $this->provider_name;
    }
}
