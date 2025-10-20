<?php

declare(strict_types=1);

namespace App\Actions\Team;

use App\Models\Team;

final readonly class RemoveTeamMemberAction
{
    /**
     * Execute the action.
     */
    public function handle(int $teamLeaderId, int $memberId): void
    {
        Team::query()
            ->where('user_id', $teamLeaderId)
            ->where('member_id', $memberId)
            ->delete();
    }
}
