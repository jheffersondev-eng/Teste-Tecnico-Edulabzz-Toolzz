<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_returns_status_payload(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'uptime',
                'db',
            ]);
    }

    public function test_metrics_endpoint_returns_metrics_payload(): void
    {
        $response = $this->getJson('/api/metrics');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'requests_total',
                'requests_4xx',
                'requests_5xx',
                'avg_response_time_ms',
            ]);
    }
}
