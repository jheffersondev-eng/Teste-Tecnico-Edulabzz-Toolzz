<?php

namespace Backend\Infrastructure\Repositories;

use Backend\Domain\Entities\Message;
use Backend\Domain\Repositories\MessageRepositoryInterface;
use Illuminate\Support\Collection;

class MessageRepository implements MessageRepositoryInterface
{
    public function findById(int $id): ?Message
    {
        return Message::find($id);
    }

    public function getConversationMessages(int $conversationId): Collection
    {
        return Message::where('conversation_id', $conversationId)
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function create(array $data): Message
    {
        return Message::create($data);
    }

    public function getRecentMessages(int $conversationId, int $limit = 10): Collection
    {
        return Message::where('conversation_id', $conversationId)
            ->orderBy('created_at', 'desc')
            ->take($limit)
            ->get()
            ->reverse()
            ->values();
    }

    public function searchMessages(string $term, int $limit = 50): Collection
    {
        try {
            return Message::search($term)
                ->take($limit)
                ->get();
        } catch (\Throwable $e) {
            return Message::where('content', 'LIKE', "%{$term}%")
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();
        }
    }
}
