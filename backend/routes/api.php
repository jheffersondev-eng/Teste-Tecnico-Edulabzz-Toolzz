<?php

use Backend\Http\Controllers\Api\ConversationController;
use Backend\Http\Controllers\Api\FriendshipController;
use Backend\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'API funcionando com Laravel 10!',
        'websockets' => 'Rodando na porta 6001',
    ]);
});

Route::middleware('auth:sanctum')->group(function () {
    // Current user
    Route::get('/user', [UserController::class, 'show']);

    // User search
    Route::get('/users/search', [UserController::class, 'search']);

    // Search conversations by message content
    Route::get('/conversations/search', [ConversationController::class, 'search']);

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
