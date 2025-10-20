<?php

declare(strict_types=1);

use App\Models\Attendance;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

it('returns validation error when PIN is incorrect', function (): void {
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
        ->post(route('checkin.store'), ['pin' => '9999']);

    $response->assertSessionHasErrors(['pin']);
});

it('creates attendance and exposes checkedInAt when PIN is correct', function (): void {
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
        ->post(route('checkin.store'), ['pin' => '1234']);

    $response->assertSessionHas('success');

    expect(Attendance::query()->where('user_id', $employee->id)->whereNull('end_time')->exists())->toBeTrue();

    // Now hit the index to ensure checkedInAt is provided
    $page = actingAs($employee)
        ->withHeader('X-Inertia', 'true')
        ->get(route('checkin.index'));

    $page->assertInertia(function ($inertia): void {
        $inertia->where('checkedInAt', fn ($val): bool => is_string($val) && mb_strlen($val) > 0);
    });
});
