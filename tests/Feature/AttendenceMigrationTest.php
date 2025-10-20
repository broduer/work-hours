<?php

declare(strict_types=1);

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

it('creates the attendence table with required columns', function (): void {
    expect(Schema::hasTable('attendence'))->toBeTrue();

    expect(Schema::hasColumns('attendence', [
        'id',
        'type',
        'date',
        'start_time',
        'end_time',
        'created_at',
        'updated_at',
    ]))->toBeTrue();
});
