<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * โมเดล User หลักของระบบ
 *
 * ใช้ร่วมกับระบบ authentication (ล็อกอิน) ของ Laravel
 * และรองรับ Sanctum API token
 */
class User extends Authenticatable
{
    /**
     * HasApiTokens = ให้ผู้ใช้สร้าง token ได้ (Sanctum)
     * HasFactory   = ใช้ factory ได้ เช่น User::factory()->create()
     * Notifiable   = รับ notification ได้ เช่น $user->notify(...)
     */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * รายชื่อ attribute ที่ "ยอมให้กรอกแบบ mass assignment"
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',     // เราเพิ่ม field role เอาไว้ใช้ RBAC
    ];

    /**
     * รายชื่อ attribute ที่ควรถูก "ซ่อน" เวลาแปลง model เป็น array หรือ JSON
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
            'email_verified_at' => 'datetime',
            'password'          => 'hashed', // เวลาตั้งค่า password จะถูก hash ให้อัตโนมัติ
        ];
    }
}
