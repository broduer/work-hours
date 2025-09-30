<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('teams', function (Blueprint $table): void {
            $table->boolean('enable_clockin')->default(false)->after('is_employee');
            $table->string('clockin_pin', 4)->nullable()->after('enable_clockin');

            $table->unique(['user_id', 'clockin_pin']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table): void {
            $table->dropColumn(['enable_clockin', 'clockin_pin']);
        });
    }
};
