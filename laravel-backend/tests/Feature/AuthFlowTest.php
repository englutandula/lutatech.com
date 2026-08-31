<?php

namespace Tests\Feature;

use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_normal_registration_creates_account_and_returns_unverified_token(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'John Doe',
            'email' => 'john.flow@example.com',
            'password' => 'LutaTech!Test2026!Sec',
            'password_confirmation' => 'LutaTech!Test2026!Sec',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'name' => 'John Doe',
                        'email' => 'john.flow@example.com',
                        'email_verified' => false,
                    ],
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'john.flow@example.com',
        ]);
    }

    public function test_duplicate_registration_with_existing_password_is_rejected(): void
    {
        User::create([
            'name' => 'Existing User',
            'email' => 'existing.flow@example.com',
            'password' => Hash::make('LutaTech!Test2026!Sec'),
            'account_status' => User::STATUS_ACTIVE,
        ]);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Existing User',
            'email' => 'existing.flow@example.com',
            'password' => 'LutaTech!New2026!Sec',
            'password_confirmation' => 'LutaTech!New2026!Sec',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'user_exists' => true,
            ]);
    }

    public function test_google_user_without_password_can_link_password_via_register(): void
    {
        // Google user has email_verified_at set and password = null
        $googleUser = User::create([
            'name' => 'Google User',
            'email' => 'google.flow@example.com',
            'password' => null,
            'email_verified_at' => now(),
            'account_status' => User::STATUS_ACTIVE,
        ]);

        $googleUser->socialAccounts()->create([
            'provider_name' => 'google',
            'provider_id' => '1234567890',
            'token' => 'mock_token',
        ]);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Google User Updated',
            'email' => 'google.flow@example.com',
            'password' => 'LutaTech!Test2026!Sec',
            'password_confirmation' => 'LutaTech!Test2026!Sec',
        ]);

        // Registration should fail, prompting them to log in with Google
        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'user_exists' => true,
                'provider' => 'google',
            ]);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::create([
            'name' => 'Login User',
            'email' => 'login.flow@example.com',
            'password' => Hash::make('LutaTech!Secret2026!Sec'),
            'email_verified_at' => now(),
            'account_status' => User::STATUS_ACTIVE,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'login.flow@example.com',
            'password' => 'LutaTech!Secret2026!Sec',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'user' => [
                        'email' => 'login.flow@example.com',
                        'email_verified' => true,
                    ],
                ],
            ]);

        $this->assertNotEmpty($response->json('data.token'));
    }

    public function test_login_fails_with_incorrect_password(): void
    {
        User::create([
            'name' => 'Wrong Password User',
            'email' => 'wrong.pass@example.com',
            'password' => Hash::make('LutaTech!Correct2026!Sec'),
            'account_status' => User::STATUS_ACTIVE,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'wrong.pass@example.com',
            'password' => 'LutaTech!Wrong2026!Sec',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_google_user_with_no_password_is_informed_to_use_google_login(): void
    {
        $user = User::create([
            'name' => 'Social Only',
            'email' => 'socialonly@example.com',
            'password' => null,
            'account_status' => User::STATUS_ACTIVE,
        ]);

        $user->socialAccounts()->create([
            'provider_name' => 'google',
            'provider_id' => '9988776655',
            'token' => 'mock_token',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'socialonly@example.com',
            'password' => 'LutaTech!Any2026!Sec',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'provider' => 'google',
            ]);
    }

    public function test_email_verification_via_signed_route(): void
    {
        $user = User::create([
            'name' => 'Unverified User',
            'email' => 'unverified@example.com',
            'password' => Hash::make('Password!123'),
            'email_verified_at' => null,
            'account_status' => User::STATUS_PENDING,
        ]);

        $signedUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $user->id,
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );

        $response = $this->getJson($signedUrl);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $user->refresh();
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_authenticated_user_can_logout_and_revoke_token(): void
    {
        $user = User::create([
            'name' => 'Logout User',
            'email' => 'logout.test@example.com',
            'password' => Hash::make('Password!123'),
            'account_status' => User::STATUS_ACTIVE,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Successfully logged out.',
            ]);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
