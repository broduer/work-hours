<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\CheckInPinRequest;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class CheckInController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        $team = Team::query()
            ->with(['user'])
            ->where('member_id', $user->id)
            ->where('is_employee', true)
            ->first();

        return Inertia::render('checkin/index', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'employer' => $team?->user ? [
                'id' => $team->user->id,
                'name' => $team->user->name,
                'email' => $team->user->email,
            ] : null,
        ]);
    }

    public function store(CheckInPinRequest $request): RedirectResponse
    {
        $user = auth()->user();

        $team = Team::query()
            ->where('member_id', $user->id)
            ->where('is_employee', true)
            ->where('enable_clockin', true)
            ->first();

        if (! $team) {
            return to_route('checkin.index')->with('error', 'Check-in is not enabled.');
        }

        $pin = $request->validated('pin');

        if ($team->clockin_pin !== $pin) {
            return to_route('checkin.index')->with('error', 'Invalid PIN.');
        }

        return to_route('checkin.index')->with('success', 'Checked in successfully.');
    }
}
