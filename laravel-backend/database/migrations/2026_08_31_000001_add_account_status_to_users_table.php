<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds account_status, last_login_at, and welcome_email_sent_at columns.
     *
     * Safe backfill strategy:
     *   - Users with a verified email (email_verified_at IS NOT NULL) → 'active'
     *   - All other users → 'pending'
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('account_status', 20)->default('pending')->after('email_verified_at');
            $table->timestamp('last_login_at')->nullable()->after('remember_token');
            $table->timestamp('welcome_email_sent_at')->nullable()->after('last_login_at');
        });

        // Safe backfill: existing verified users stay active, unverified become pending.
        DB::statement("
            UPDATE users
            SET account_status = CASE
                WHEN email_verified_at IS NOT NULL THEN 'active'
                ELSE 'pending'
            END
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['account_status', 'last_login_at', 'welcome_email_sent_at']);
        });
    }
};
