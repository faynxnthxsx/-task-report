<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    /**
     * รายชื่อคอลัมน์ที่อนุญาตให้กรอก/อัปเดตแบบ mass assignment
     *
     * ต้องมีอยู่จริงในตาราง tasks:
     * - title
     * - detail
     * - status
     */
    protected $fillable = [
        'title',
        'detail',
        'status', // ✅ ใช้เก็บ pending / in_progress / completed
    ];
}
