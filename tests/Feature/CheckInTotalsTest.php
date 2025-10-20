<?php

declare(strict_types=1);

use App\Models\Attendance;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Date;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

it('exposes total worked and break seconds for today when checked in', function (): void {
    Date::setTestNow('2025-10-20 12:00:00');

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

    // A closed clock-in from 09:00 to 10:00 (3600s)
    Attendance::query()->create([
        'user_id' => $employee->id,
        'type' => 'clockin',
        'date' => '2025-10-20',
        'start_time' => '09:00:00',
        'end_time' => '10:00:00',
    ]);

    // A break during that period from 09:15 to 09:30 (900s)
    Attendance::query()->create([
        'user_id' => $employee->id,
        'type' => 'breaks',
        'date' => '2025-10-20',
        'start_time' => '09:15:00',
        'end_time' => '09:30:00',
    ]);

    // An open clock-in from 10:00 to now (12:00) -> 7200s
    Attendance::query()->create([
        'user_id' => $employee->id,
        'type' => 'clockin',
        'date' => '2025-10-20',
        'start_time' => '10:00:00',
        'end_time' => null,
    ]);

    $response = actingAs($employee)
        ->withHeader('X-Inertia', 'true')
        ->get(route('checkin.index'));

    $response->assertSuccessful();

    $response->assertInertia(function ($page): void {
        $page->where('totalBreakSecondsToday', 900);
        $page->where('totalWorkedSecondsToday', 10800 - 900); // 9900
    });
});
