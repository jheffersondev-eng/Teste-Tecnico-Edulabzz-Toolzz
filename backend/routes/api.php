<?php

use Backend\Http\Controllers\Api\ConversationController;
use Backend\Http\Controllers\Api\FriendshipController;
use Backend\Http\Controllers\Api\UserController;
use Backend\Http\Controllers\Api\TwoFactorController;
use Backend\Http\Controllers\Auth\TwoFactorAuthController;
use Backend\Http\Controllers\Auth\RegisterController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'API funcionando com Laravel 10!',
        'websockets' => 'Rodando na porta 6001',
    ]);
});

Route::get('/health', function () {
    $dbStatus = 'disconnected';
    try {
        DB::connection()->getPdo();
        $dbStatus = 'connected';
    } catch (Throwable $e) {
        $dbStatus = 'disconnected';
    }

    $uptime = isset($GLOBALS['LARAVEL_START'])
        ? (int) (microtime(true) - $GLOBALS['LARAVEL_START'])
        : null;

    return response()->json([
        'status' => 'ok',
        'uptime' => $uptime,
        'db' => $dbStatus,
    ]);
    }); 

Route::get('/metrics', function () {
    $total = (int) Cache::get('metrics:requests_total', 0);
    $errors4xx = (int) Cache::get('metrics:requests_4xx', 0);
    $errors5xx = (int) Cache::get('metrics:requests_5xx', 0);
    $sumMs = (int) Cache::get('metrics:response_time_sum_ms', 0);

    $avgMs = $total > 0 ? (int) round($sumMs / $total) : 0;

    return response()->json([
        'requests_total' => $total,
        'requests_4xx' => $errors4xx,
        'requests_5xx' => $errors5xx,
        'avg_response_time_ms' => $avgMs,
    ]);
}); 

Route::post('/auth/2fa/verify', [TwoFactorAuthController::class, 'verify']);
Route::post('/auth/register', [RegisterController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    // Current user
    Route::get('/user', [UserController::class, 'show']);

    // User search
    Route::get('/users/search', [UserController::class, 'search']);

    // Search conversations by message content
    Route::get('/conversations/search', [ConversationController::class, 'search']);

    // Two-factor authentication
    Route::get('/2fa/status', [TwoFactorController::class, 'status']);
    Route::post('/2fa/enable', [TwoFactorController::class, 'enable']);
    Route::post('/2fa/confirm', [TwoFactorController::class, 'confirm']);
    Route::post('/2fa/disable', [TwoFactorController::class, 'disable']);
    Route::post('/2fa/recovery-codes', [TwoFactorController::class, 'recoveryCodes']);

    // Friendships
    Route::post('/friendships', [FriendshipController::class, 'sendRequest']);
    Route::get('/friendships', [FriendshipController::class, 'friends']);
    Route::get('/friendships/pending', [FriendshipController::class, 'pending']);
    Route::put('/friendships/{id}/accept', [FriendshipController::class, 'acceptRequest']);
    Route::delete('/friendships/{id}/reject', [FriendshipController::class, 'rejectRequest']);
    Route::delete('/friends/{friendId}', [FriendshipController::class, 'removeFriend']);

    // Conversations
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::get('/conversations/{id}', [ConversationController::class, 'show']);
    Route::post('/conversations/private', [ConversationController::class, 'getOrCreate']);
    Route::post('/conversations/ai', [ConversationController::class, 'createAIChat']);
    Route::get('/conversations/{id}/messages', [ConversationController::class, 'getMessages']);
    Route::post('/conversations/{id}/messages', [ConversationController::class, 'sendMessage']);
    Route::delete('/conversations/{id}', [ConversationController::class, 'destroy']);
});
