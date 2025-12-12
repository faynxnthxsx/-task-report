<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ถ้ามีตาราง task_comments อยู่แล้ว ให้ข้าม ไม่ต้องสร้างซ้ำ
        if (Schema::hasTable('task_comments')) {
            return;
        }

        Schema::create('task_comments', function (Blueprint $table) {
            $table->id();

            // ผูกกับ tasks, ลบ task แล้ว comment หายตาม
            $table->foreignId('task_id')
                ->constrained('tasks')
                ->onDelete('cascade');

            // คนคอมเมนต์ (อาจ null ถ้าไม่ล็อกอิน)
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->text('body');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_comments');
    }
};
