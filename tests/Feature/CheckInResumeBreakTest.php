<?php

declare(strict_types=1);

use App\Models\Attendance;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

it('ends an active break and keeps clock-in open', function (): void {
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

    // Open clock-in
    Attendance::query()->create([
        'user_id' => $employee->id,
        'type' => 'clockin',
        'date' => now()->toDateString(),
        'start_time' => now()->format('H:i:s'),
        'end_time' => null,
    ]);

    // Open break
    Attendance::query()->create([
        'user_id' => $employee->id,
        'type' => 'breaks',
        'date' => now()->toDateString(),
        'start_time' => now()->format('H:i:s'),
        'end_time' => null,
    ]);

    $response = actingAs($employee)
        ->withHeader('X-Inertia', 'true')
        ->post(route('checkin.break.end'));

    $response->assertSessionHas('success');

    $latestBreak = Attendance::query()
        ->where('user_id', $employee->id)
        ->where('type', 'breaks')
        ->latest('id')
        ->first();

    expect($latestBreak->end_time)->not->toBeNull();

    $openClockin = Attendance::query()
        ->where('user_id', $employee->id)
        ->where('type', 'clockin')
        ->latest('id')
        ->first();

    expect($openClockin->end_time)->toBeNull();
});
