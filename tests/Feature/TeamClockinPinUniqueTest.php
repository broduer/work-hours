<?php

declare(strict_types=1);

use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('prevents duplicate clockin_pin for the same owner on create', function (): void {
    $this->actingAs($owner = User::factory()->create());

    // First member with PIN 1234
    $resp1 = $this->post(route('team.store'), [
        'name' => 'Member One',
        'email' => 'one@corp.test',
        'password' => 'password',
        'hourly_rate' => 0,
        'currency' => 'USD',
        'is_employee' => true,
        'enable_clockin' => true,
        'clockin_pin' => '1234',
    ]);
    $resp1->assertOk();

    // Second member with same PIN should fail
    $resp2 = $this->from('/team')->post(route('team.store'), [
        'name' => 'Member Two',
        'email' => 'two@corp.test',
        'password' => 'password',
        'hourly_rate' => 0,
        'currency' => 'USD',
        'is_employee' => true,
        'enable_clockin' => true,
        'clockin_pin' => '1234',
    ]);

    $resp2->assertSessionHasErrors(['clockin_pin']);
});

it('allows same clockin_pin for different owners', function (): void {
    $this->actingAs($ownerA = User::factory()->create());

    $this->post(route('team.store'), [
        'name' => 'A1',
        'email' => 'a1@corp.test',
        'password' => 'password',
        'hourly_rate' => 0,
        'currency' => 'USD',
        'is_employee' => true,
        'enable_clockin' => true,
        'clockin_pin' => '4321',
    ])->assertOk();

    // Switch owner
    $this->actingAs($ownerB = User::factory()->create());

    $this->post(route('team.store'), [
        'name' => 'B1',
        'email' => 'b1@corp.test',
        'password' => 'password',
        'hourly_rate' => 0,
        'currency' => 'USD',
        'is_employee' => true,
        'enable_clockin' => true,
        'clockin_pin' => '4321',
    ])->assertOk();

    expect(Team::query()->where('user_id', $ownerA->id)->where('clockin_pin', '4321')->exists())->toBeTrue();
    expect(Team::query()->where('user_id', $ownerB->id)->where('clockin_pin', '4321')->exists())->toBeTrue();
});

it('allows updating member keeping the same pin but prevents changing to a conflicting pin', function (): void {
    $this->actingAs($owner = User::factory()->create());

    // Create two members with different PINs
    $m1 = $this->post(route('team.store'), [
        'name' => 'Member One',
        'email' => 'one2@corp.test',
        'password' => 'password',
        'hourly_rate' => 0,
        'currency' => 'USD',
        'is_employee' => true,
        'enable_clockin' => true,
        'clockin_pin' => '1111',
    ]);
    $m1->assertOk();

    $m2 = $this->post(route('team.store'), [
        'name' => 'Member Two',
        'email' => 'two2@corp.test',
        'password' => 'password',
        'hourly_rate' => 0,
        'currency' => 'USD',
        'is_employee' => true,
        'enable_clockin' => true,
        'clockin_pin' => '2222',
    ]);
    $m2->assertOk();

    $member1 = User::query()->where('email', 'one2@corp.test')->firstOrFail();

    // Keep same pin should pass
    $this->put(route('team.update', $member1->id), [
        'name' => $member1->name,
        'email' => $member1->email,
        'hourly_rate' => 0,
        'currency' => 'USD',
        'non_monetary' => true,
        'is_employee' => true,
        'enable_clockin' => true,
        'clockin_pin' => '1111',
    ])->assertOk();

    // Change to conflicting pin '2222' should fail
    $this->from('/team')->put(route('team.update', $member1->id), [
        'name' => $member1->name,
        'email' => $member1->email,
        'hourly_rate' => 0,
        'currency' => 'USD',
        'non_monetary' => true,
        'is_employee' => true,
        'enable_clockin' => true,
        'clockin_pin' => '2222',
    ])->assertSessionHasErrors(['clockin_pin']);
});
