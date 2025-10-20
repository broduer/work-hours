<?php

declare(strict_types=1);

namespace App\Http\Stores;

use App\Models\Team;
use App\Models\User;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Throwable;

final class TeamStore
{
    public static function teamMembersIds(int $userId): Collection
    {
        return Team::query()->where('user_id', $userId)->pluck('member_id');
    }

    public static function teamMemberCount(int $userId): int
    {
        return Team::query()->where('user_id', $userId)->count();
    }

    public static function teamMembers(int $userId, bool $map = true): ?Collection
    {
        $team = Team::query()
            ->where('user_id', $userId)
            ->with('member')
            ->get();

        if ($map) {
            return $team->map(fn ($team): array => [
                'id' => $team->member->id,
                'name' => $team->member->name,
                'email' => $team->member->email,
                'hourly_rate' => (float) ($team->hourly_rate ?? 0),
                'currency' => $team->currency ?? 'USD',
                'non_monetary' => (bool) ($team->non_monetary ?? false),
                'is_employee' => (bool) ($team->is_employee ?? false),
                'enable_clockin' => (bool) ($team->enable_clockin ?? false),
                'clockin_pin' => $team->clockin_pin,
                'clockout_duration' => $team->clockout_duration,
            ]);
        }

        return $team;
    }

    public static function teamEntry(int $userId, int $memberId): ?Team
    {
        return Team::query()
            ->where('user_id', $userId)
            ->where('member_id', $memberId)
            ->first();
    }

    /**
     * Update a member user's details and the team entry for a specific owner.
     * Returns flags indicating password change state and the plain password (for notifications).
     *
     * @param  array<string, mixed>  $data
     * @return array{password_changed: bool, plain_password: ?string}
     *
     * @throws Exception|Throwable
     */
    public static function updateMemberForUser(int $ownerUserId, User $memberUser, array $data): array
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

    public static function filters(): array
    {
        return [
            'start-date' => request('start-date', ''),
            'end-date' => request('end-date', ''),
            'search' => request('search', ''),
        ];
    }

    public static function removeUserFromTeam(int $teamLeaderId, int $memberId): void
    {
        Team::query()
            ->where('user_id', $teamLeaderId)
            ->where('member_id', $memberId)
            ->delete();
    }

    public static function exportHeaders(): array
    {
        return [
            'id',
            'name',
            'email',
            'hourly_rate',
            'currency',
            'non_monetary',
            'totalHours',
            'weeklyAverage',
            'unpaidHours',
            'unpaidAmount',
        ];
    }

    /**
     * Build the team context for the given user.
     *
     * Returns an array with keys:
     * - leaderIds: list<int> IDs of leaders for teams where the user is a member
     * - memberIds: list<int> IDs of members for teams where the user is a leader
     *
     * @return array{leaderIds: list<int>, memberIds: list<int>}
     */
    public static function getContextFor(User $user): array
    {
        $memberIds = Team::query()
            ->where('user_id', $user->id)
            ->pluck('member_id')
            ->map(static fn ($id): int => (int) $id)
            ->values()
            ->all();

        $leaderIds = Team::query()
            ->where('member_id', $user->id)
            ->pluck('user_id')
            ->map(static fn ($id): int => (int) $id)
            ->unique()
            ->values()
            ->all();

        return [
            'leaderIds' => $leaderIds,
            'memberIds' => $memberIds,
        ];
    }
}
