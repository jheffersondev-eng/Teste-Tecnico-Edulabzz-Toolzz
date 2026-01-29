<?php

namespace Tests\Unit;

use Backend\Domain\Entities\User;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_user_searchable_fields_are_exposed(): void
    {
        $user = new User();
        $user->id = 10;
        $user->name = 'Ada Lovelace';
        $user->email = 'ada@example.com';

        $this->assertSame('users', $user->searchableAs());

        $this->assertSame(
            [
                'id' => 10,
                'name' => 'Ada Lovelace',
                'email' => 'ada@example.com',
            ],
            $user->toSearchableArray()
        );
    }
}
