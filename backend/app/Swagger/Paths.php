<?php

namespace App\Swagger;

use OpenApi\Annotations as OA;

/**
 * @OA\Tag(name="Auth", description="Authentication")
 * @OA\Tag(name="Users", description="User management")
 * @OA\Tag(name="Conversations", description="Chat conversations")
 * @OA\Tag(name="Friendships", description="Friends and requests")
 * @OA\Tag(name="2FA", description="Two-factor auth")
 * @OA\Tag(name="System", description="System endpoints")
 */
class Paths
{
    /**
     * @OA\Post(
     *   path="/api/auth/register",
     *   summary="Register user",
     *   tags={"Auth"},
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       required={"name","email","password","password_confirmation"},
     *       @OA\Property(property="name", type="string"),
     *       @OA\Property(property="email", type="string", format="email"),
     *       @OA\Property(property="password", type="string"),
     *       @OA\Property(property="password_confirmation", type="string")
     *     )
     *   ),
     *   @OA\Response(response=200, description="Registered")
     * )
     */
    public function register() {}

    /**
     * @OA\Post(
     *   path="/api/auth/2fa/verify",
     *   summary="Verify 2FA challenge",
     *   tags={"Auth"},
     *   @OA\RequestBody(
     *     required=true,
     *     @OA\JsonContent(
     *       required={"challenge"},
     *       @OA\Property(property="challenge", type="string"),
     *       @OA\Property(property="code", type="string"),
     *       @OA\Property(property="recovery_code", type="string")
     *     )
     *   ),
     *   @OA\Response(response=200, description="Verified")
     * )
     */
    public function verify2fa() {}

    /**
     * @OA\Get(
     *   path="/api/user",
     *   summary="Get current user",
     *   tags={"Users"},
     *   security={{"bearerAuth":{}}},
     *   @OA\Response(response=200, description="User")
     * )
     */
    public function currentUser() {}

    /**
     * @OA\Get(
     *   path="/api/users/search",
     *   summary="Search users",
     *   tags={"Users"},
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="q", in="query", required=true, @OA\Schema(type="string")),
     *   @OA\Response(response=200, description="Users")
     * )
     */
    public function searchUsers() {}

    /**
     * @OA\Get(
     *   path="/api/conversations",
     *   summary="List conversations",
     *   tags={"Conversations"},
     *   security={{"bearerAuth":{}}},
     *   @OA\Response(response=200, description="Conversations")
     * )
     */
    public function conversations() {}

    /**
     * @OA\Get(
     *   path="/api/conversations/{id}",
     *   summary="Get conversation",
     *   tags={"Conversations"},
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="Conversation")
     * )
     */
    public function conversation() {}

    /**
     * @OA\Get(
     *   path="/api/conversations/{id}/messages",
     *   summary="List messages",
     *   tags={"Conversations"},
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="Messages")
     * )
     */
    public function conversationMessages() {}

    /**
     * @OA\Post(
     *   path="/api/conversations/{id}/messages",
     *   summary="Send message",
     *   tags={"Conversations"},
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\RequestBody(required=true, @OA\JsonContent(@OA\Property(property="content", type="string"))),
     *   @OA\Response(response=200, description="Message sent")
     * )
     */
    public function sendMessage() {}

    /**
     * @OA\Post(
     *   path="/api/conversations/ai",
     *   summary="Create AI chat",
     *   tags={"Conversations"},
     *   security={{"bearerAuth":{}}},
     *   @OA\Response(response=200, description="Conversation")
     * )
     */
    public function createAiChat() {}

    /**
     * @OA\Post(
     *   path="/api/conversations/private",
     *   summary="Create private chat",
     *   tags={"Conversations"},
     *   security={{"bearerAuth":{}}},
     *   @OA\RequestBody(required=true, @OA\JsonContent(@OA\Property(property="friend_id", type="integer"))),
     *   @OA\Response(response=200, description="Conversation")
     * )
     */
    public function createPrivateChat() {}

    /**
     * @OA\Delete(
     *   path="/api/conversations/{id}",
     *   summary="Delete conversation",
     *   tags={"Conversations"},
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="Deleted")
     * )
     */
    public function deleteConversation() {}

    /**
     * @OA\Get(
     *   path="/api/conversations/search",
     *   summary="Search conversations by message",
     *   tags={"Conversations"},
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="q", in="query", required=true, @OA\Schema(type="string")),
     *   @OA\Response(response=200, description="Results")
     * )
     */
    public function searchConversations() {}

    /**
     * @OA\Post(
     *   path="/api/friendships",
     *   summary="Send friend request",
     *   tags={"Friendships"},
     *   security={{"bearerAuth":{}}},
     *   @OA\RequestBody(required=true, @OA\JsonContent(@OA\Property(property="friend_id", type="integer"))),
     *   @OA\Response(response=200, description="Request sent")
     * )
     */
    public function sendFriendRequest() {}

    /**
     * @OA\Get(
     *   path="/api/friendships/pending",
     *   summary="Pending requests",
     *   tags={"Friendships"},
     *   security={{"bearerAuth":{}}},
     *   @OA\Response(response=200, description="Pending")
     * )
     */
    public function pendingFriendRequests() {}

    /**
     * @OA\Put(
     *   path="/api/friendships/{id}/accept",
     *   summary="Accept friend request",
     *   tags={"Friendships"},
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="Accepted")
     * )
     */
    public function acceptFriendRequest() {}

    /**
     * @OA\Delete(
     *   path="/api/friendships/{id}/reject",
     *   summary="Reject friend request",
     *   tags={"Friendships"},
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="Rejected")
     * )
     */
    public function rejectFriendRequest() {}

    /**
     * @OA\Get(
     *   path="/api/2fa/status",
     *   summary="2FA status",
     *   tags={"2FA"},
     *   security={{"bearerAuth":{}}},
     *   @OA\Response(response=200, description="Status")
     * )
     */
    public function twoFactorStatus() {}

    /**
     * @OA\Post(
     *   path="/api/2fa/enable",
     *   summary="Enable 2FA",
     *   tags={"2FA"},
     *   security={{"bearerAuth":{}}},
     *   @OA\Response(response=200, description="Enabled")
     * )
     */
    public function enable2fa() {}

    /**
     * @OA\Post(
     *   path="/api/2fa/confirm",
     *   summary="Confirm 2FA",
     *   tags={"2FA"},
     *   security={{"bearerAuth":{}}},
     *   @OA\RequestBody(required=true, @OA\JsonContent(@OA\Property(property="code", type="string"))),
     *   @OA\Response(response=200, description="Confirmed")
     * )
     */
    public function confirm2fa() {}

    /**
     * @OA\Post(
     *   path="/api/2fa/disable",
     *   summary="Disable 2FA",
     *   tags={"2FA"},
     *   security={{"bearerAuth":{}}},
     *   @OA\Response(response=200, description="Disabled")
     * )
     */
    public function disable2fa() {}

    /**
     * @OA\Post(
     *   path="/api/2fa/recovery-codes",
     *   summary="Regenerate recovery codes",
     *   tags={"2FA"},
     *   security={{"bearerAuth":{}}},
     *   @OA\Response(response=200, description="Recovery codes")
     * )
     */
    public function recoveryCodes() {}

    /**
     * @OA\Get(
     *   path="/api/health",
     *   summary="Health check",
     *   tags={"System"},
     *   @OA\Response(response=200, description="Health status")
     * )
     */
    public function health() {}

    /**
     * @OA\Get(
     *   path="/api/metrics",
     *   summary="Basic metrics",
     *   tags={"System"},
     *   @OA\Response(response=200, description="Metrics payload")
     * )
     */
    public function metrics() {}
}
