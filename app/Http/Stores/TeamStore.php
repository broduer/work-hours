<?php

declare(strict_types=1);

namespace App\Http\Stores;

use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Collection;

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

    public static function filters(): array
    {
        return [
            'start-date' => request('start-date', ''),
            'end-date' => request('end-date', ''),
            'search' => request('search', ''),
        ];
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
