<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\TaskComment;


class Task extends Model
{
    use HasFactory;

    /**
     * ฟิลด์ที่อนุญาตให้ fill ผ่าน create()/update()
     */
    protected $fillable = [
        'title',
        'detail',
        'status',
        'deadline',
        'priority',
        'assigned_to',
        'created_by',
    ];

    /**
     * ผู้สร้างงาน (admin / manager ที่กดสร้าง)
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * ผู้รับผิดชอบงาน (staff / manager ที่ถูก assign)
     */
    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * คอมเมนต์ใต้ Task นี้ทั้งหมด
     */
    public function comments()
    {
        return $this->hasMany(TaskComment::class);
    }
}
