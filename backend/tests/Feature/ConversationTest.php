<?php

namespace Tests\Feature;

use Backend\Domain\Entities\Conversation;
use Backend\Domain\Entities\Message;
use Backend\Domain\Entities\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ConversationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_private_conversation_and_send_message(): void
    {
        $user = User::factory()->create();
        $friend = User::factory()->create();
        Sanctum::actingAs($user);

        $createResponse = $this->postJson('/api/conversations/private', [
            'friend_id' => $friend->id,
        ]);

        $createResponse->assertStatus(200)
            ->assertJsonStructure([
                'conversation' => ['id', 'type', 'participants'],
            ]);

        $conversationId = $createResponse->json('conversation.id');

        $sendResponse = $this->postJson("/api/conversations/{$conversationId}/messages", [
            'content' => 'Olá, mundo',
        ]);

        $sendResponse->assertStatus(200)
            ->assertJsonStructure([
                'message' => ['id', 'content', 'conversation_id'],
            ])
            ->assertJsonPath('message.content', 'Olá, mundo');

        $messagesResponse = $this->getJson("/api/conversations/{$conversationId}/messages");

        $messagesResponse->assertStatus(200)
            ->assertJsonStructure([
                'messages' => [
                    ['id', 'content', 'conversation_id', 'user'],
                ],
            ]);
    }

    public function test_user_can_list_show_search_and_delete_conversations(): void
    {
        $user = User::factory()->create();
        $friend = User::factory()->create();
        Sanctum::actingAs($user);

        $createResponse = $this->postJson('/api/conversations/private', [
            'friend_id' => $friend->id,
        ]);

        $conversationId = $createResponse->json('conversation.id');

        $this->postJson("/api/conversations/{$conversationId}/messages", [
            'content' => 'Mensagem de teste',
        ])->assertStatus(200);

        $listResponse = $this->getJson('/api/conversations');
        $listResponse->assertStatus(200)
            ->assertJsonStructure([
                'conversations' => [
                    ['id', 'type', 'name'],
                ],
            ]);

        $showResponse = $this->getJson("/api/conversations/{$conversationId}");
        $showResponse->assertStatus(200)
            ->assertJsonStructure([
                'conversation' => ['id', 'type', 'participants'],
            ]);

        $searchResponse = $this->getJson('/api/conversations/search?q=Mensagem');
        $searchResponse->assertStatus(200)
            ->assertJsonStructure([
                'conversations' => [
                    ['id', 'matched_message'],
                ],
            ]);

        $deleteResponse = $this->deleteJson("/api/conversations/{$conversationId}");
        $deleteResponse->assertStatus(200)
            ->assertJson([
                'message' => 'Conversa excluída com sucesso',
            ]);

        $this->assertDatabaseMissing('conversations', ['id' => $conversationId]);
    }
}
