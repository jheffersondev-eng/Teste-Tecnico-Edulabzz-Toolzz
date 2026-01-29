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

        Log::debug('[OAuth] Iniciando callback para provider', ['provider' => $provider]);
        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
            Log::debug('[OAuth] Dados recebidos do provider', [
                'id' => $socialUser->getId(),
                'email' => $socialUser->getEmail(),
                'name' => $socialUser->getName(),
            ]);
            $frontendUrl = env('FRONTEND_URL');

            $user = $this->userRepository->findByEmail($socialUser->getEmail());
            Log::debug('[OAuth] Resultado busca usuário por email', ['user' => $user]);
            if (!$user) {
                Log::debug('[OAuth] Usuário não encontrado, criando novo usuário');
                $user = $this->userRepository->create([
                    'name' => $socialUser->getName(),
                    'email' => $socialUser->getEmail(),
                    'oauth_provider' => $provider,
                    'oauth_provider_id' => $socialUser->getId(),
                    'password' => Hash::make(Str::random(32)),
                    'email_verified_at' => now(),
                ]);
                Log::debug('[OAuth] Resultado criação de usuário', ['user' => $user]);
            }

            if (!$user) {
                Log::error('[OAuth] Falha ao criar ou encontrar usuário', ['email' => $socialUser->getEmail()]);
                return redirect('/login')->with('error', 'Não foi possível criar ou encontrar o usuário.');
            }

            $twoFactorRequired = $user->hasEnabledTwoFactorAuthentication();
            Log::debug('[OAuth] 2FA required?', ['user_id' => $user->id, 'required' => $twoFactorRequired]);
            if ($twoFactorRequired) {
                $challenge = Str::random(64);
                DB::table('two_factor_challenges')->insert([
                    'user_id' => $user->id,
                    'token' => $challenge,
                    'expires_at' => now()->addMinutes(10),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                Log::debug('[OAuth] Redirecionando para callback com challenge', ['challenge' => $challenge]);
                return redirect()->away("{$frontendUrl}/auth/callback?challenge={$challenge}");
            }

            Log::debug('[OAuth] Logando usuário', ['user_id' => $user->id]);
            Auth::login($user, true);
            session()->put('user_id', $user->id);
            session()->save();
            DB::table('sessions')->where('id', session()->getId())->update(['user_id' => $user->id]);

            $token = $user->createToken('oauth-token')->plainTextToken;
            Log::debug('[OAuth] Token gerado e redirecionando', ['user_id' => $user->id, 'token' => $token]);
            return redirect()->away("{$frontendUrl}/auth/callback?token={$token}");
        } catch (\Exception $e) {
            Log::error('[OAuth] Exceção no callback', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
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
