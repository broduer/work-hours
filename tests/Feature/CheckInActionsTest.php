<?php

declare(strict_types=1);

use App\Models\Attendance;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

it('starts a break when user is checked in', function (): void {
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

    $response = actingAs($employee)
        ->withHeader('X-Inertia', 'true')
        ->post(route('checkin.break'));

    $response->assertSessionHas('success');

    expect(
        Attendance::query()->where('user_id', $employee->id)->where('type', 'breaks')->whereNull('end_time')->exists()
    )->toBeTrue();
});

it('checks out and closes any open break', function (): void {
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
        'start_time' => now()->format('H:i:s'),
        'end_time' => null,
    ]);

    Attendance::query()->create([
        'user_id' => $employee->id,
        'type' => 'breaks',
        'date' => now()->toDateString(),
        'start_time' => now()->format('H:i:s'),
        'end_time' => null,
    ]);

    $response = actingAs($employee)
        ->withHeader('X-Inertia', 'true')
        ->post(route('checkin.checkout'));

    $response->assertSessionHas('success');

    $openClockin = Attendance::query()
        ->where('user_id', $employee->id)
        ->where('type', 'clockin')
        ->latest('id')
        ->first();

    expect($openClockin->end_time)->not->toBeNull();

    $openBreak = Attendance::query()
        ->where('user_id', $employee->id)
        ->where('type', 'breaks')
        ->latest('id')
        ->first();

    expect($openBreak->end_time)->not->toBeNull();
});
