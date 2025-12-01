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
        Schema::create('task_comments', function (Blueprint $table) {
            $table->id();

            // งานไหน (เชื่อมกับ tasks)
            $table->foreignId('task_id')
                ->constrained()
                ->cascadeOnDelete();

            // ใครเป็นคนคอมเมนต์ (ถ้า null แปลว่าไม่รู้ว่าใคร)
            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            // เนื้อหาคอมเมนต์
            $table->text('body');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_comments');
    }
};
