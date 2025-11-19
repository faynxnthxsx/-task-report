<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

/**
 * DatabaseSeeder
 *
 * seeder หลักของแอปพลิเคชัน
 * เวลาเรารันคำสั่ง:
 *   php artisan db:seed
 * หรือ  php artisan migrate --seed
 * Laravel จะเรียกคลาสนี้เป็นตัวเริ่มต้น
 */
class DatabaseSeeder extends Seeder
{
    // ใช้ trait นี้เพื่อไม่ให้ Laravel ยิง model events (creating, created, ฯลฯ)
    // ตอนที่กำลัง seed ข้อมูล → ทำให้ seed เร็วขึ้น และไม่มี side-effect แปลก ๆ
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * เมธอดนี้คือจุดเริ่ม seed ข้อมูล
     * สามารถเรียก seeder อื่น ๆ จากในนี้ได้ หรือสร้าง model ตรง ๆ ก็ได้
     */
    public function run(): void
    {
        // ตัวอย่าง (ถูกคอมเมนต์ไว้)
        // ถ้าเอา // ออก จะสร้าง user ปลอม 10 คนจาก UserFactory
        // User::factory(10)->create();

        // สร้างผู้ใช้ 1 คน โดยใช้ UserFactory + override name & email
        User::factory()->create([
            'name' => 'Test User',            // กำหนดชื่อเอง
            'email' => 'test@example.com',   // กำหนดอีเมลเอง
            // ส่วน password, email_verified_at, remember_token
            // จะมาจาก definition() ใน UserFactory
        ]);
    }
}
