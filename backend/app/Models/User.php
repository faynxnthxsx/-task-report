<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * โมเดล User หลักของระบบ
 *
 * ใช้ร่วมกับระบบ authentication (ล็อกอิน) ของ Laravel
 * และรองรับ factory + notification
 */
class User extends Authenticatable
{
    /**
     * @use HasFactory<\Database\Factories\UserFactory>
     *
     * HasFactory  = ให้โมเดลนี้ใช้ factory ได้ เช่น User::factory()->create()
     * Notifiable  = ให้โมเดลนี้รับ notification ได้ เช่น $user->notify(...)
     */
    use HasFactory, Notifiable;

    /**
     * รายชื่อ attribute ที่ "ยอมให้กรอกแบบ mass assignment"
     * เช่น User::create([...]) หรือ $user->fill([...])
     *
     * ถ้าไม่อยู่ในลิสต์นี้ จะไม่ถูกเซ็ตค่าเวลาทำ mass assign
     * ช่วยกันการโจมตีที่ส่ง field แปลก ๆ เข้ามา (เช่น is_admin)
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * รายชื่อ attribute ที่ควรถูก "ซ่อน" เวลาแปลง model เป็น array หรือ JSON
     *
     * เช่น เวลา return response()->json($user)
     * ฟิลด์ใน $hidden จะไม่ติดออกไปด้วย
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * กำหนดว่าฟิลด์ไหนควรถูก "cast" (แปลงประเภทอัตโนมัติ)
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            // email_verified_at จะถูกแปลงเป็น object datetime (Carbon)
            // ทำให้จัดการวันที่/เวลาได้สะดวกขึ้น
            'email_verified_at' => 'datetime',

            // password ใช้ cast แบบ 'hashed'
            // เวลาเซ็ตค่าให้ password (เช่น $user->password = '1234')
            // Laravel จะ Hash::make() ให้เองอัตโนมัติ ก่อนเก็บลงฐานข้อมูล
            'password' => 'hashed',
        ];
    }
}
