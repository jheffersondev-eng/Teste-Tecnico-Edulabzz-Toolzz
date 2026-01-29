<?php

namespace Tests\Feature;

use Backend\Domain\Entities\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_search_excludes_authenticated_user(): void
    {
        $user = User::factory()->create(['name' => 'Alice']);
        $other = User::factory()->create(['name' => 'Bob']);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/users/search?q=Bob');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'users')
            ->assertJsonFragment([
                'id' => $other->id,
                'name' => $other->name,
                'email' => $other->email,
            ]);
    }
}
