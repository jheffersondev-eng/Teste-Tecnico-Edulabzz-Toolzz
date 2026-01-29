<?php

namespace Backend\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Backend\Domain\Repositories\UserRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class OAuthController extends Controller
{
    public function __construct(
        private UserRepositoryInterface $userRepository
    ) {}

    /**
     * Redirect to OAuth provider
     */
    public function redirect(string $provider)
    {
        $this->validateProvider($provider);
        
        return Socialite::driver($provider)->redirect();
    }

    /**
     * Handle OAuth callback
     */
    public function callback(string $provider)
    {
        $this->validateProvider($provider);

        try {
            $socialUser = Socialite::driver($provider)->user();
            
            // Find or create user
            $user = $this->userRepository->findOrCreateFromOAuth(
                $provider,
                $socialUser->getId(),
                [
                    'name' => $socialUser->getName(),
                    'email' => $socialUser->getEmail(),
                ]
            );

            // Login user
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            $twoFactorRequired = $user->hasEnabledTwoFactorAuthentication();

            if ($twoFactorRequired) {
                $challenge = Str::random(64);

                DB::table('two_factor_challenges')->insert([
                    'user_id' => $user->id,
                    'token' => $challenge,
                    'expires_at' => now()->addMinutes(10),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                return redirect()->away("{$frontendUrl}/auth/callback?challenge={$challenge}");
            }

            Auth::login($user, true);

            // Generate Sanctum token for API
            $token = $user->createToken('oauth-token')->plainTextToken;

            // Redirect to frontend with token
            return redirect()->away("{$frontendUrl}/auth/callback?token={$token}");

        } catch (\Exception $e) {
            return redirect('/login')->with('error', 'OAuth authentication failed: ' . $e->getMessage());
        }
    }

    /**
     * Validate OAuth provider
     */
    protected function validateProvider(string $provider)
    {
        if (!in_array($provider, ['google', 'github'])) {
            abort(404, 'Invalid OAuth provider');
        }
    }
}
