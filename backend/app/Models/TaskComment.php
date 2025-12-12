<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Task;
use App\Models\User;

class TaskComment extends Model
{
    use HasFactory;

    // 👇 ให้ตรงกับชื่อคอลัมน์ในตาราง task_comments
    protected $fillable = [
        'task_id',
        'user_id',
        'body',   // ใช้ body เป็นหลัก
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
