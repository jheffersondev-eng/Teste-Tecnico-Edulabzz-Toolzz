<?php

namespace Backend\Domain\Repositories;

use Backend\Domain\Entities\Message;
use Illuminate\Support\Collection;

interface MessageRepositoryInterface
{
    public function findById(int $id): ?Message;
    
    public function getConversationMessages(int $conversationId): Collection;
    
    public function create(array $data): Message;
    
    public function getRecentMessages(int $conversationId, int $limit = 10): Collection;

    public function searchMessages(string $term, int $limit = 50): Collection;
}
