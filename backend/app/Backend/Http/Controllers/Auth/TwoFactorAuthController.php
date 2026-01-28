<?php

namespace Backend\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Backend\Domain\Entities\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Laravel\Fortify\TwoFactorAuthenticationProvider;

class TwoFactorAuthController extends Controller
{
    public function verify(Request $request, TwoFactorAuthenticationProvider $provider)
    {
        $request->validate([
            'challenge' => 'required|string',
            'code' => 'nullable|string',
            'recovery_code' => 'nullable|string',
        ]);

        $challenge = DB::table('two_factor_challenges')
            ->where('token', $request->challenge)
            ->where('expires_at', '>', now())
            ->first();

        if (!$challenge) {
            return response()->json(['message' => 'Desafio expirado ou inválido.'], 422);
        }

        /** @var User $user */
        $user = User::find($challenge->user_id);

        if (!$user || !$user->hasEnabledTwoFactorAuthentication()) {
            return response()->json(['message' => '2FA não habilitado.'], 422);
        }

        $valid = false;

        if ($request->filled('recovery_code')) {
            $codes = $user->recoveryCodes();
            if (in_array($request->recovery_code, $codes, true)) {
                $user->replaceRecoveryCode($request->recovery_code);
                $valid = true;
            }
        }

        if (!$valid && $request->filled('code')) {
            $valid = $provider->verify(
                decrypt($user->two_factor_secret),
                $request->code
            );
        }

        if (!$valid) {
            return response()->json(['message' => 'Código inválido.'], 422);
        }

        DB::table('two_factor_challenges')->where('id', $challenge->id)->delete();

        $token = $user->createToken('oauth-token')->plainTextToken;

        return response()->json(['token' => $token]);
    }
}
