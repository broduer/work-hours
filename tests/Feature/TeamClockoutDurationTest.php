<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('persists clockout_duration when clock-in enabled', function (): void {
    $this->actingAs($owner = User::factory()->create());

    $payload = [
        'name' => 'Emp One',
        'email' => 'emp1@corp.test',
        'password' => 'password',
        'hourly_rate' => 0,
        'currency' => 'USD',
        'is_employee' => true,
        'enable_clockin' => true,
        'clockin_pin' => '1234',
        'clockout_duration' => 0.5,
    ];

    $response = $this->post(route('team.store'), $payload);
    $response->assertOk();

    $this->assertDatabaseHas('teams', [
        'user_id' => $owner->id,
        'clockin_pin' => '1234',
        'enable_clockin' => true,
        'clockout_duration' => 0.5,
    ]);
});

it('ignores clockout_duration when clock-in is disabled', function (): void {
    $this->actingAs($owner = User::factory()->create());

    $payload = [
        'name' => 'Emp Two',
        'email' => 'emp2@corp.test',
        'password' => 'password',
        'hourly_rate' => 0,
        'currency' => 'USD',
        'is_employee' => true,
        'enable_clockin' => false,
        'clockin_pin' => '',
        'clockout_duration' => 1.25,
    ];

    $response = $this->post(route('team.store'), $payload);
    $response->assertOk();

    $this->assertDatabaseHas('teams', [
        'user_id' => $owner->id,
        'enable_clockin' => false,
        'clockout_duration' => null,
    ]);
});
