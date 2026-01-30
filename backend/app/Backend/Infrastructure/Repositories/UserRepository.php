<?php

namespace Backend\Infrastructure\Repositories;

use Backend\Domain\Entities\User;
use Backend\Domain\Repositories\UserRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

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
        try {
            $user = User::create($data);
            return $user;
        } catch (\Exception $e) {
            throw $e;
        }
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

    // Se não achou, cria! Simples e direto.
    public function findOrCreateFromOAuth(string $provider, string $providerId, array $userData): User
    {
        $email = $userData['email'] ?? sprintf('%s@%s.oauth', $providerId, $provider);
        $user = User::where('oauth_provider', $provider)
            ->where('oauth_provider_id', $providerId)
            ->first();
        if (!$user) {
            $user = User::create([
                'name' => $userData['name'],
                'email' => $email,
                'oauth_provider' => $provider,
                'oauth_provider_id' => $providerId,
                'password' => Hash::make(Str::random(32)),
                'email_verified_at' => now(),
            ]);
        }
        return $user;
    }
}
