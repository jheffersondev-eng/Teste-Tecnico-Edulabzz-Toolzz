<?php

namespace Tests\Feature;

use Backend\Domain\Entities\Friendship;
use Backend\Domain\Entities\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FriendshipTest extends TestCase
{
    use RefreshDatabase;

    public function test_friend_request_flow(): void
    {
        $user = User::factory()->create();
        $friend = User::factory()->create();

        Sanctum::actingAs($user);

        $sendResponse = $this->postJson('/api/friendships', [
            'friend_id' => $friend->id,
        ]);

        $sendResponse->assertStatus(200)
            ->assertJson([
                'message' => 'Friend request sent',
            ]);

        $friendshipId = $sendResponse->json('friendship.id');

        Sanctum::actingAs($friend);

        $pendingResponse = $this->getJson('/api/friendships/pending');
        $pendingResponse->assertStatus(200)
            ->assertJsonStructure([
                'requests' => [
                    ['id', 'user'],
                ],
            ]);

        $acceptResponse = $this->putJson("/api/friendships/{$friendshipId}/accept");
        $acceptResponse->assertStatus(200)
            ->assertJson([
                'message' => 'Friend request accepted',
            ]);

        $friendsResponse = $this->getJson('/api/friendships');
        $friendsResponse->assertStatus(200)
            ->assertJsonStructure([
                'friends' => [
                    ['id', 'name', 'email'],
                ],
            ]);

        $removeResponse = $this->deleteJson("/api/friends/{$user->id}");
        $removeResponse->assertStatus(200)
            ->assertJson([
                'message' => 'Friend removed',
            ]);
    }
}
