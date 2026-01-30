<?php

namespace Backend\Infrastructure\Repositories;

use Backend\Domain\Entities\Conversation;
use Backend\Domain\Repositories\ConversationRepositoryInterface;
use Illuminate\Support\Collection;

class ConversationRepository implements ConversationRepositoryInterface
{
    public function findById(int $id): ?Conversation
    {
        return Conversation::find($id);
    }

    public function getUserConversations(int $userId): Collection
    {
        return Conversation::whereHas('participants', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
            ->with(['participants', 'latestMessage.user'])
            ->orderBy('updated_at', 'desc')
            ->get();
    }

    public function getPrivateConversation(int $userId, int $friendId): ?Conversation
    {
        return Conversation::where('type', 'private')
            ->whereHas('participants', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->whereHas('participants', function ($query) use ($friendId) {
                $query->where('user_id', $friendId);
            })
            ->first();
    }

    public function create(string $type, ?string $name = null): Conversation
    {
        return Conversation::create([
            'type' => $type,
            'name' => $name,
        ]);
    }

    public function delete(int $id): bool
    {
        $conversation = Conversation::find($id);
        if (!$conversation) {
            return false;
        }
        $conversation->messages()->delete();
        $conversation->participants()->detach();
        return $conversation->delete();
    }

    public function attachParticipants(int $conversationId, array $userIds): void
    {
        $conversation = Conversation::find($conversationId);
        if ($conversation) {
            $conversation->participants()->attach($userIds);
        }
    }

    public function markAsRead(int $conversationId, int $userId): void
    {
        $conversation = Conversation::find($conversationId);
        if ($conversation) {
            $conversation->participants()
                ->updateExistingPivot($userId, ['last_read_at' => now()]);
        }
    }

    public function touch(int $conversationId): void
    {
        $conversation = Conversation::find($conversationId);
        if ($conversation) {
            $conversation->touch();
        }
    }
}
