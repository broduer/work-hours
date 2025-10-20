<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\CheckInPinRequest;
use App\Models\Attendance;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Date;
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

        $openAttendance = Attendance::query()
            ->where('user_id', $user->id)
            ->where('type', 'clockin')
            ->whereNull('end_time')
            ->latest('id')
            ->first();

        $checkedInAt = null;
        if ($openAttendance) {
            $base = Date::parse($openAttendance->date);
            if (! empty($openAttendance->start_time)) {
                $base = $base->copy()->setTimeFromTimeString($openAttendance->start_time);
            }
            $checkedInAt = $base->toAtomString();
        }
        $openBreak = null;
        if ($openAttendance) {
            $openBreak = Attendance::query()
                ->where('user_id', $user->id)
                ->where('type', 'breaks')
                ->whereNull('end_time')
                ->latest('id')
                ->first();
        }

        $breakStartedAt = null;
        if ($openBreak) {
            $base = Date::parse($openBreak->date);
            if (! empty($openBreak->start_time)) {
                $base = $base->copy()->setTimeFromTimeString($openBreak->start_time);
            }
            $breakStartedAt = $base->toAtomString();
        }
        $today = Date::now();
        $todayStr = $today->toDateString();

        $attendancesToday = Attendance::query()
            ->where('user_id', $user->id)
            ->whereDate('date', $todayStr)
            ->get(['type', 'start_time', 'end_time']);

        $totalClockinSeconds = 0;
        $totalBreakSeconds = 0;

        foreach ($attendancesToday as $row) {
            $start = Date::parse($todayStr . ' ' . $row->start_time);
            $end = $row->end_time ? Date::parse($todayStr . ' ' . $row->end_time) : Date::now();
            $seconds = abs($end->diffInSeconds($start));

            if ($row->type === 'clockin') {
                $totalClockinSeconds += $seconds;
            } elseif ($row->type === 'breaks') {
                $totalBreakSeconds += $seconds;
            }
        }

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
            'checkedInAt' => $checkedInAt,
            'breakStartedAt' => $breakStartedAt,
            'totalWorkedSecondsToday' => $totalClockinSeconds,
            'totalBreakSecondsToday' => $totalBreakSeconds,
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
            return back()->withErrors(['pin' => 'Invalid PIN.']);
        }
        $existsOpen = Attendance::query()
            ->where('user_id', $user->id)
            ->where('type', 'clockin')
            ->whereNull('end_time')
            ->exists();

        $now = now();
        if (! $existsOpen) {
            Attendance::query()->create([
                'user_id' => $user->id,
                'type' => 'clockin',
                'date' => $now->toDateString(),
                'start_time' => $now->format('H:i:s'),
                'end_time' => null,
            ]);
        }

        return to_route('checkin.index')->with('success', 'Checked in successfully.');
    }

    public function startBreak(): RedirectResponse
    {
        $user = auth()->user();
        $openClockIn = Attendance::query()
            ->where('user_id', $user->id)
            ->where('type', 'clockin')
            ->whereNull('end_time')
            ->latest('id')
            ->first();

        if (! $openClockIn) {
            return back()->with('error', 'You are not currently checked in.');
        }
        $hasOpenBreak = Attendance::query()
            ->where('user_id', $user->id)
            ->where('type', 'breaks')
            ->whereNull('end_time')
            ->exists();

        if ($hasOpenBreak) {
            return back()->with('error', 'You already have an active break.');
        }

        $now = now();
        Attendance::query()->create([
            'user_id' => $user->id,
            'type' => 'breaks',
            'date' => $now->toDateString(),
            'start_time' => $now->format('H:i:s'),
            'end_time' => null,
        ]);

        return back()->with('success', 'Break started.');
    }

    public function endBreak(): RedirectResponse
    {
        $user = auth()->user();
        $openClockIn = Attendance::query()
            ->where('user_id', $user->id)
            ->where('type', 'clockin')
            ->whereNull('end_time')
            ->latest('id')
            ->first();

        if (! $openClockIn) {
            return back()->with('error', 'You are not currently checked in.');
        }
        $openBreak = Attendance::query()
            ->where('user_id', $user->id)
            ->where('type', 'breaks')
            ->whereNull('end_time')
            ->latest('id')
            ->first();

        if (! $openBreak) {
            return back()->with('error', 'No active break to end.');
        }

        $openBreak->end_time = now()->format('H:i:s');
        $openBreak->save();

        return back()->with('success', 'Welcome back! Break ended.');
    }

    public function checkout(): RedirectResponse
    {
        $user = auth()->user();

        $openClockIn = Attendance::query()
            ->where('user_id', $user->id)
            ->where('type', 'clockin')
            ->whereNull('end_time')
            ->latest('id')
            ->first();

        if (! $openClockIn) {
            return back()->with('error', 'No active check-in found.');
        }

        $now = now();
        $openBreak = Attendance::query()
            ->where('user_id', $user->id)
            ->where('type', 'breaks')
            ->whereNull('end_time')
            ->latest('id')
            ->first();

        if ($openBreak) {
            $openBreak->end_time = $now->format('H:i:s');
            $openBreak->save();
        }

        $openClockIn->end_time = $now->format('H:i:s');
        $openClockIn->save();

        return to_route('checkin.index')->with('success', 'Checked out successfully.');
    }
}
