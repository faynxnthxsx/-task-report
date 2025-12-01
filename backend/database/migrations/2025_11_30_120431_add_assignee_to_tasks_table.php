<?php

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
        Schema::table('tasks', function (Blueprint $table) {
            // ⭐ เพิ่มคอลัมน์ assignee_id (เจ้าของงาน / ผู้รับผิดชอบ)
            $table->unsignedBigInteger('assignee_id')->nullable()->after('id');

            // ⭐ ทำ foreign key ผูกกับตาราง users
            $table->foreign('assignee_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // ลบ foreign key ก่อน
            $table->dropForeign(['assignee_id']);

            // แล้วค่อยลบคอลัมน์
            $table->dropColumn('assignee_id');
        });
    }
};
