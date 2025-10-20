<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $user_id
 * @property string $type
 * @property string $date
 * @property string $start_time
 * @property string|null $end_time
 * @property User $user
 */
final class Attendance extends Model
{
    protected $table = 'attendance';

    protected $fillable = [
        'user_id',
        'type',
        'date',
        'start_time',
        'end_time',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }
}
