<?php

namespace Backend\Infrastructure\Repositories;

use Backend\Domain\Entities\User;
use Backend\Domain\Repositories\UserRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;

class UserRepository implements UserRepositoryInterface
{
    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function create(array $data): User
    {
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        return User::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $user = User::find($id);
        
        if (!$user) {
            return false;
        }

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        return $user->update($data);
    }

    public function search(string $term): Collection
    {
        try {
            return User::search($term)
                ->take(10)
                ->get();
        } catch (\Throwable $e) {
            return User::where('name', 'LIKE', "%{$term}%")
                ->orWhere('email', 'LIKE', "%{$term}%")
                ->limit(10)
                ->get();
        }
    }

    public function findOrCreateFromOAuth(string $provider, string $providerId, array $userData): User
    {
        $user = User::where('oauth_provider', $provider)
            ->where('oauth_provider_id', $providerId)
            ->first();

        if (!$user) {
            $user = User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'oauth_provider' => $provider,
                'oauth_provider_id' => $providerId,
                'email_verified_at' => now(),
            ]);
        }

        return $user;
    }
}
