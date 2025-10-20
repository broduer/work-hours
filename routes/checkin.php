<?php

declare(strict_types=1);

use App\Http\Controllers\CheckInController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::get('checkin', [CheckInController::class, 'index'])->name('checkin.index');
    Route::post('checkin', [CheckInController::class, 'store'])->name('checkin.store');
    Route::post('checkin/break', [CheckInController::class, 'startBreak'])->name('checkin.break');
    Route::post('checkin/break/end', [CheckInController::class, 'endBreak'])->name('checkin.break.end');
    Route::post('checkin/checkout', [CheckInController::class, 'checkout'])->name('checkin.checkout');
});
