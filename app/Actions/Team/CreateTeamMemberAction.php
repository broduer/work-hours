<?php

declare(strict_types=1);

namespace App\Actions\Team;

use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Throwable;

final readonly class CreateTeamMemberAction
{
    /**
     * Execute the action.
     *
     * @throws Throwable
     */
    public function handle(int $ownerUserId,
        array $userData,
        ?float $hourlyRate,
        ?string $currency,
        bool $nonMonetary,
        bool $isEmployee,
        bool $enableClockin = false,
        ?string $clockinPin = null,
        ?float $clockoutDuration = null): array
    {
        return DB::transaction(function () use ($ownerUserId, $userData, $hourlyRate, $currency, $nonMonetary, $isEmployee, $enableClockin, $clockinPin, $clockoutDuration): array {
            $user = User::query()->where('email', $userData['email'])->first();
            $isNewUser = false;

            if (! $user) {
                $isNewUser = true;
                $user = User::query()->create($userData);
            }

            $finalNonMonetary = $isEmployee ? true : $nonMonetary;
            $finalHourlyRate = $finalNonMonetary ? 0 : ($hourlyRate ?? 0);

            $finalEnableClockin = $isEmployee && $enableClockin;
            $sanitizedPin = null;
            if ($finalEnableClockin && $clockinPin !== null) {
                $digitsOnly = preg_replace('/\D+/', '', $clockinPin) ?? '';
                $sanitizedPin = mb_substr($digitsOnly, 0, 4);
                if ($sanitizedPin === '') {
                    $sanitizedPin = null;
                }
            }

            Team::query()->updateOrCreate(
                [
                    'user_id' => $ownerUserId,
                    'member_id' => $user->getKey(),
                ],
                [
                    'hourly_rate' => $finalHourlyRate,
                    'currency' => $currency,
                    'non_monetary' => $finalNonMonetary,
                    'is_employee' => $isEmployee,
                    'enable_clockin' => $finalEnableClockin,
                    'clockin_pin' => $finalEnableClockin ? $sanitizedPin : null,
                    'clockout_duration' => $finalEnableClockin ? $clockoutDuration : null,
                ]
            );

            $user->currencies()->firstOrCreate(['code' => 'USD']);

            return ['user' => $user, 'is_new' => $isNewUser];
        });
    }
}
