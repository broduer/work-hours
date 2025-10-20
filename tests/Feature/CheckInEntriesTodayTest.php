<?php

declare(strict_types=1);

use App\Models\Attendance;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

it('exposes entriesToday with todays clockins and breaks', function (): void {
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

    Attendance::query()->create([
        'user_id' => $employee->id,
        'type' => 'clockin',
        'date' => now()->toDateString(),
        'start_time' => '09:00:00',
        'end_time' => '10:00:00',
    ]);

    Attendance::query()->create([
        'user_id' => $employee->id,
        'type' => 'breaks',
        'date' => now()->toDateString(),
        'start_time' => '09:15:00',
        'end_time' => '09:30:00',
    ]);

    $response = actingAs($employee)
        ->withHeader('X-Inertia', 'true')
        ->get(route('checkin.index'));

    $response->assertSuccessful();

    $response->assertInertia(function ($page): void {
        $page->where('entriesToday', function ($val): bool {
            return is_array($val) && count($val) >= 2 && in_array('clockin', array_column($val, 'type'), true);
        });
    });
});
