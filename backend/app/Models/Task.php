<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    /**
     * ฟิลด์ที่ให้กรอก/แก้ไขผ่าน create() / update()
     */
    protected $fillable = [
        'title',
        'detail',    // ↔ คอลัมน์ใน DB
        'status',    // pending / in_progress / completed
        'deadline',
        'priority',  // low / normal / high
    ];

    /**
     * cast field บางตัวให้เป็น type ที่อ่านง่ายขึ้น
     */
    protected $casts = [
        'deadline'   => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * ความสัมพันธ์: 1 Task มีได้หลาย Comment
     */
    public function comments()
    {
        return $this->hasMany(TaskComment::class);
    }
}
