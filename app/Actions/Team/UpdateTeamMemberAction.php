<?php

declare(strict_types=1);

namespace App\Actions\Team;

use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Throwable;

final readonly class UpdateTeamMemberAction
{
    /**
     * Execute the action.
     *
     * @throws Throwable
     */
    public function handle(int $ownerUserId, User $memberUser, array $data): array
    {
        return DB::transaction(function () use ($ownerUserId, $memberUser, $data): array {
            $passwordChanged = false;
            $plainPassword = null;

            if (! empty($data['password'])) {
                $plainPassword = (string) $data['password'];

                $passwordChanged = true;
            } else {
                unset($data['password']);
            }

            $isEmployee = isset($data['is_employee']) && (bool) $data['is_employee'];
            $nonMonetary = isset($data['non_monetary']) && (bool) $data['non_monetary'];
            if ($isEmployee) {
                $nonMonetary = true;
            }
            $hourlyRate = $nonMonetary ? 0 : ((float) ($data['hourly_rate'] ?? 0));

            $enableClockin = isset($data['enable_clockin']) && (bool) $data['enable_clockin'];
            $clockinPin = $data['clockin_pin'] ?? null;
            $clockoutDuration = array_key_exists('clockout_duration', $data) ? ($data['clockout_duration'] !== null ? (float) $data['clockout_duration'] : null) : null;
            $finalEnableClockin = $isEmployee && $enableClockin;
            $sanitizedPin = null;
            if ($finalEnableClockin && $clockinPin !== null) {
                $digitsOnly = preg_replace('/\D+/', '', (string) $clockinPin) ?? '';
                $sanitizedPin = mb_substr($digitsOnly, 0, 4);
                if ($sanitizedPin === '') {
                    $sanitizedPin = null;
                }
            }

            $teamData = [
                'hourly_rate' => $hourlyRate,
                'currency' => $data['currency'] ?? null,
                'non_monetary' => $nonMonetary,
                'is_employee' => $isEmployee,
                'enable_clockin' => $finalEnableClockin,
                'clockin_pin' => $finalEnableClockin ? $sanitizedPin : null,
                'clockout_duration' => $finalEnableClockin ? $clockoutDuration : null,
            ];

            unset($data['hourly_rate'], $data['currency'], $data['non_monetary'], $data['is_employee'], $data['enable_clockin'], $data['clockin_pin'], $data['clockout_duration']);

            $memberUser->update($data);

            Team::query()
                ->where('user_id', $ownerUserId)
                ->where('member_id', $memberUser->getKey())
                ->update($teamData);

            return [
                'password_changed' => $passwordChanged,
                'plain_password' => $plainPassword,
            ];
        });
    }
}
