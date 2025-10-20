<?php

declare(strict_types=1);

use App\Models\Team;
use App\Models\User;

use function Pest\Laravel\actingAs;

it('shows the check-in page for employees with check-in enabled', function (): void {
    $employer = User::factory()->create();
    $employee = User::factory()->create();

    Team::query()->create([
        'user_id' => $employer->id,
        'member_id' => $employee->id,
        'is_employee' => true,
        'enable_clockin' => true,
        'clockin_pin' => '1234',
        'currency' => 'USD',
        'hourly_rate' => 0,
        'non_monetary' => false,
    ]);

    $response = actingAs($employee)
        ->withHeader('X-Inertia', 'true')
        ->get(route('checkin.index'));

    $response->assertSuccessful();

    $response->assertInertia(function ($page): void {
        $page->component('checkin/index');
        $page->where('user.name', fn ($name): bool => is_string($name));
        $page->where('employer.id', fn ($id): bool => is_int($id));
        $page->where('hasCheckinEnabled', true);
    });
});

it('does not set hasCheckinEnabled when not enabled', function (): void {
    $employer = User::factory()->create();
    $employee = User::factory()->create();

    Team::query()->create([
        'user_id' => $employer->id,
        'member_id' => $employee->id,
        'is_employee' => true,
        'enable_clockin' => false,
        'currency' => 'USD',
        'hourly_rate' => 0,
        'non_monetary' => false,
    ]);

    $response = actingAs($employee)
        ->withHeader('X-Inertia', 'true')
        ->get(route('calendar.index')); // any page to pick up shared props

    $response->assertSuccessful();

    $response->assertInertia(function ($page): void {
        $page->where('hasCheckinEnabled', false);
    });
});
