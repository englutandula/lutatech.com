<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Create the default admin user.
     *
     * This seeder is idempotent — safe to run multiple times.
     * It uses firstOrCreate so it will never create a duplicate admin.
     *
     * Run with: php artisan db:seed --class=AdminUserSeeder
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@lutatech.com'],
            [
                'name'              => 'Luta Admin',
                'password'          => Hash::make('Admin@Lutatech2024!'),
                'email_verified_at' => now(),
                'is_admin'          => true,
                'account_status'    => 'active',
            ]
        );

        // If admin already existed, make sure it's marked as admin and active.
        if ($admin->wasRecentlyCreated === false) {
            $admin->update([
                'is_admin'       => true,
                'account_status' => 'active',
            ]);
        }

        $this->command->info('✅ Admin user ready: admin@lutatech.com');
        $this->command->warn('⚠️  IMPORTANT: Change the admin password immediately after first login!');
    }
}
