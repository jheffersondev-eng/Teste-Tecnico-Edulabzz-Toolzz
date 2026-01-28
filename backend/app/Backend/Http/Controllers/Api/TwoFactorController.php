<?php

namespace Backend\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Fortify\Actions\ConfirmTwoFactorAuthentication;
use Laravel\Fortify\Actions\DisableTwoFactorAuthentication;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Actions\GenerateNewRecoveryCodes;

class TwoFactorController extends Controller
{
    public function status(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'enabled' => !is_null($user->two_factor_secret),
            'confirmed' => !is_null($user->two_factor_confirmed_at),
            'has_password' => !is_null($user->password),
        ]);
    }

    public function enable(Request $request, EnableTwoFactorAuthentication $enable)
    {
        $user = $request->user();
        $enable($user);

        return response()->json([
            'enabled' => true,
            'confirmed' => !is_null($user->two_factor_confirmed_at),
            'qr_code_svg' => $user->twoFactorQrCodeSvg(),
            'recovery_codes' => $user->recoveryCodes(),
        ]);
    }

    public function confirm(Request $request, ConfirmTwoFactorAuthentication $confirm)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $user = $request->user();
        $confirm($user, $request->code);

        return response()->json([
            'enabled' => !is_null($user->two_factor_secret),
            'confirmed' => !is_null($user->two_factor_confirmed_at),
            'recovery_codes' => $user->recoveryCodes(),
        ]);
    }

    public function disable(Request $request, DisableTwoFactorAuthentication $disable)
    {
        $disable($request->user());

        return response()->json([
            'enabled' => false,
            'confirmed' => false,
        ]);
    }

    public function recoveryCodes(Request $request, GenerateNewRecoveryCodes $generate)
    {
        $codes = $generate($request->user());

        return response()->json([
            'recovery_codes' => $codes,
        ]);
    }
}
