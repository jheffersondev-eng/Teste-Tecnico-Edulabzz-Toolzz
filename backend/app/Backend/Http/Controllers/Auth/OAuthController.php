<?php

namespace Backend\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Backend\Domain\Repositories\UserRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class OAuthController extends Controller
{
    public function __construct(
        private UserRepositoryInterface $userRepository
    ) {}

    public function redirect(string $provider)
    {
        $this->validateProvider($provider);
        return Socialite::driver($provider)->redirect();
    }

    public function callback(string $provider)
    {
        $this->validateProvider($provider);
        $frontendUrl = env('FRONTEND_URL');
        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
            $user = $this->userRepository->findByEmail($socialUser->getEmail());
            if (!$user) {
                $user = $this->userRepository->create([
                    'name' => $socialUser->getName(),
                    'email' => $socialUser->getEmail(),
                    'oauth_provider' => $provider,
                    'oauth_provider_id' => $socialUser->getId(),
                    'password' => Hash::make(Str::random(32)),
                    'email_verified_at' => now(),
                ]);
            }
            if (!$user) {
                return redirect('/login')->with('error', 'Não foi possível criar ou encontrar o usuário.');
            }
            if ($user->hasEnabledTwoFactorAuthentication()) {
                $challenge = Str::random(64);
                DB::table('two_factor_challenges')->insert([
                    'user_id' => $user->id,
                    'token' => $challenge,
                    'expires_at' => now()->addMinutes(10),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                // Bora pro 2FA, segurança nunca é demais!
                return redirect()->away("{$frontendUrl}/auth/callback?challenge={$challenge}");
            }
            Auth::login($user, true);
            session()->put('user_id', $user->id);
            session()->save();
            DB::table('sessions')->where('id', session()->getId())->update(['user_id' => $user->id]);
            $this->ensureSessionUserId($user->id);
            $token = $user->createToken('oauth-token')->plainTextToken;
            // Tudo certo, bora logar!
            return redirect()->away("{$frontendUrl}/auth/callback?token={$token}");
        } catch (\Exception $e) {
            return redirect('/login')->with('error', 'OAuth authentication failed: ' . $e->getMessage());
        }
    }

    // Só pra garantir que o user_id vai pra sessão, insistente igual mãe mandando levar casaco
    private function ensureSessionUserId(int $userId, int $attempts = 0): void
    {
        if (session('user_id') == $userId || $attempts >= 10) {
            return;
        }
        session()->save();
        DB::table('sessions')->where('id', session()->getId())->update(['user_id' => $userId]);
        usleep(100000); // 0.1s
        $this->ensureSessionUserId($userId, $attempts + 1);
    }

    protected function validateProvider(string $provider)
    {
        if (!in_array($provider, ['google', 'github'])) {
            abort(404, 'Invalid OAuth provider');
        }
    }
}
