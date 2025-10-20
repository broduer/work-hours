<?php

declare(strict_types=1);

use App\Models\Attendance;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

it('parses checkedInAt when date contains time portion', function (): void {
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

    // Simulate an open attendance where `date` is stored with a time part (e.g., datetime column in some envs)
    Attendance::query()->create([
        'user_id' => $employee->id,
        'type' => 'clockin',
        'date' => '2025-10-20 00:00:00',
        'start_time' => '17:45:52',
        'end_time' => null,
    ]);

    $response = actingAs($employee)
        ->get(route('checkin.index'));

    $response->assertSuccessful();
});
