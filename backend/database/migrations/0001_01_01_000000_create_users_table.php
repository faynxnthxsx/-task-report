<?php

// ใช้คลาส Migration เป็นคลาสแม่ของ migration
use Illuminate\Database\Migrations\Migration;
// Blueprint เอาไว้บอกโครงสร้างตาราง (column แต่ละคอลัมน์)
use Illuminate\Database\Schema\Blueprint;
// Schema คือ facade สำหรับสั่งสร้าง/แก้ตาราง
use Illuminate\Support\Facades\Schema;

// ใช้ anonymous class (คลาสไม่มีชื่อ) ที่ extends Migration
// แล้ว return ออกไปให้ Laravel ใช้ตอนรัน migrate
return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * เมธอดนี้จะถูกเรียกตอนสั่ง php artisan migrate
     * ใช้สำหรับ "สร้าง / แก้ไข" ตาราง
     */
    public function up(): void
    {
        // ---------- ตาราง users ----------
        Schema::create('users', function (Blueprint $table) {
            // สร้างคอลัมน์ id แบบ BIGINT auto-increment และเป็น PRIMARY KEY
            $table->id();

            // string('name') = VARCHAR(255) ไม่ระบุความยาว = default 255
            $table->string('name');

            // email (string) + unique() = ห้ามมีค่า email ซ้ำในตาราง
            $table->string('email')->unique();

            // timestamp เวลาอีเมลถูกยืนยัน
            // nullable() = อนุญาตให้เป็น NULL (ยังไม่ยืนยัน)
            $table->timestamp('email_verified_at')->nullable();

            // password (string) = เก็บรหัสผ่าน (hashed) เช่น bcrypt
            $table->string('password');

            // remember_token = สร้างคอลัมน์ VARCHAR(100) สำหรับฟีเจอร์ "จำฉันไว้"
            $table->rememberToken();

            // timestamps() = สร้าง 2 คอลัมน์:
            // - created_at  (เวลาสร้าง)
            // - updated_at  (เวลาอัปเดตล่าสุด)
            $table->timestamps();
        });

        // ---------- ตาราง password_reset_tokens ----------
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            // email เป็น PRIMARY KEY ของตารางนี้ (แปลว่า 1 email มี 1 token ล่าสุด)
            $table->string('email')->primary();

            // token = string เอาไว้เก็บ token reset password
            $table->string('token');

            // เวลาที่ token ถูกสร้างขึ้น (nullable = อาจว่างได้)
            $table->timestamp('created_at')->nullable();
        });

        // ---------- ตาราง sessions ----------
        Schema::create('sessions', function (Blueprint $table) {
            // id ของ session (เช่น session_id) เป็น string และเป็น PRIMARY KEY
            $table->string('id')->primary();

            // foreignId('user_id') = BIGINT unsigned สำหรับโยงไปยัง users.id
            // nullable() = บาง session อาจไม่มี user (guest)
            // index() = สร้าง index เพื่อค้นหาตาม user_id ได้เร็วขึ้น
            $table->foreignId('user_id')->nullable()->index();

            // ip_address = IP ผู้ใช้ที่ถือ session นี้
            // ความยาว 45 รองรับ IPv6 (ยาวกว่า IPv4)
            $table->string('ip_address', 45)->nullable();

            // user_agent = เก็บข้อมูล browser / device
            $table->text('user_agent')->nullable();

            // payload = ข้อมูล session จริง ๆ (เข้ารหัส/serialize แล้ว) เก็บเป็น longText
            $table->longText('payload');

            // last_activity = เวลา activity ล่าสุด (เป็น integer timestamp)
            // index() = ช่วยให้เคลียร์ session เก่าได้เร็วขึ้นตอนสแกน
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     *
     * เมธอดนี้จะถูกเรียกตอน php artisan migrate:rollback
     * ใช้ "ย้อนกลับ" สิ่งที่ up() ทำไปแล้ว
     */
    public function down(): void
    {
        // ลบตาราง users ถ้ามีอยู่
        Schema::dropIfExists('users');

        // ลบตาราง password_reset_tokens ถ้ามีอยู่
        Schema::dropIfExists('password_reset_tokens');

        // ลบตาราง sessions ถ้ามีอยู่
        Schema::dropIfExists('sessions');
    }
};
