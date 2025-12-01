<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDeadlineAndPriorityToTasksTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // เอา after('description') ออก เพราะใน table จริงไม่มีคอลัมน์นี้
            $table->date('deadline')->nullable();   // วันที่ครบกำหนด
            $table->string('priority', 20)->default('normal'); // low/normal/high
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['deadline', 'priority']);
        });
    }
}
