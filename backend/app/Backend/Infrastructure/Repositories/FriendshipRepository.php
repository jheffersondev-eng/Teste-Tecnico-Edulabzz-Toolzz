<?php

namespace Backend\Infrastructure\Repositories;

use Backend\Domain\Entities\Friendship;
use Backend\Domain\Repositories\FriendshipRepositoryInterface;
use Illuminate\Support\Collection;

class FriendshipRepository implements FriendshipRepositoryInterface
{
    public function findById(int $id): ?Friendship
    {
        return Friendship::find($id);
    }

    public function create(int $userId, int $friendId, string $status = 'pending'): Friendship
    {
        return Friendship::create([
            'user_id' => $userId,
            'friend_id' => $friendId,
            'status' => $status,
        ]);
    }

    public function updateStatus(int $id, string $status): bool
    {
        $friendship = Friendship::find($id);
        if (!$friendship) {
            return false;
        }
        return $friendship->update(['status' => $status]);
    }

    public function delete(int $id): bool
    {
        $friendship = Friendship::find($id);
        if (!$friendship) {
            return false;
        }
        return $friendship->delete();
    }

    public function getPendingRequests(int $userId): Collection
    {
        return Friendship::where('friend_id', $userId)
            ->where('status', 'pending')
            ->with('user')
            ->get();
    }

    public function getFriends(int $userId): Collection
    {
        $sentFriends = Friendship::where('user_id', $userId)
            ->where('status', 'accepted')
            ->with('friend')
            ->get()
            ->pluck('friend');
        $receivedFriends = Friendship::where('friend_id', $userId)
            ->where('status', 'accepted')
            ->with('user')
            ->get()
            ->pluck('user');
        return $sentFriends->merge($receivedFriends);
    }

    public function exists(int $userId, int $friendId): bool
    {
        return Friendship::where(function ($query) use ($userId, $friendId) {
            $query->where('user_id', $userId)
                  ->where('friend_id', $friendId);
        })->orWhere(function ($query) use ($userId, $friendId) {
            $query->where('user_id', $friendId)
                  ->where('friend_id', $userId);
        })->exists();
    }

    public function deleteBetween(int $userId, int $friendId): bool
    {
        return Friendship::where(function ($query) use ($userId, $friendId) {
            $query->where('user_id', $userId)
                  ->where('friend_id', $friendId);
        })->orWhere(function ($query) use ($userId, $friendId) {
            $query->where('user_id', $friendId)
                  ->where('friend_id', $userId);
        })->delete() > 0;
    }
}
