<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Factory สำหรับสร้างข้อมูลจำลองของโมเดล App\Models\User
 *
 * @extends \Illuminate\Database\EloquentFactories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * รหัสผ่าน (ที่ hash แล้ว) ที่ factory นี้ใช้ร่วมกัน
     * ใช้ static เก็บไว้เพื่อไม่ต้อง Hash::make() ซ้ำ ๆ ทุกครั้งที่สร้าง user ใหม่
     */
    protected static ?string $password;

    /**
     * กำหนดค่าเริ่มต้น (default state) ของ model ตอนสร้างด้วย factory
     *
     * @return array<string, mixed>  คืนค่าเป็น array ของ column => value
     */
    public function definition(): array
    {
        return [
            // ชื่อผู้ใช้ ปลอม ๆ สุ่มจาก Faker
            'name' => fake()->name(),

            // อีเมลปลอม ไม่ซ้ำกันในแต่ละ record
            'email' => fake()->unique()->safeEmail(),

            // ถือว่าอีเมลถูกยืนยันแล้ว โดยใส่ timestamp ปัจจุบัน
            'email_verified_at' => now(),

            // รหัสผ่านที่ hash แล้ว (ของคำว่า "password")
            // static::$password ??= ... หมายถึง:
            //    ถ้า static::$password ยังไม่มีค่า → คำนวณ Hash::make('password') แล้วเก็บไว้
            //    ครั้งถัดไปจะใช้ค่าที่เก็บไว้อยู่แล้ว ไม่ต้อง hash ใหม่
            'password' => static::$password ??= Hash::make('password'),

            // token สำหรับฟีเจอร์ "remember me" หรืออื่น ๆ
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * ระบุว่า user ที่สร้างจาก factory นี้ "ยังไม่ได้ยืนยันอีเมล"
     * ใช้โดยการเปลี่ยน state ให้ email_verified_at = null
     */
    public function unverified(): static
    {
        // state() จะปรับค่า field บางตัวทับค่าปกติใน definition()
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
