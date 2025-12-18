<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tags', function (Blueprint $table) {
            $table->id();

            // ชื่อ tag ต้องไม่ซ้ำ
            $table->string('name', 50)->unique();

            // เผื่ออนาคตอยากทำสี tag (ยังไม่ใช้ก็ได้)
            $table->string('color', 20)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tags');
    }
};
