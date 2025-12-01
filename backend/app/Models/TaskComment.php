<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskComment extends Model
{
    use HasFactory;

    protected $table = 'task_comments';

    protected $fillable = [
        'task_id',
        'user_id',
        'body',
    ];

    /**
     * คอมเมนต์นี้อยู่ใต้ Task ไหน
     */
    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * คนที่เขียนคอมเมนต์ (user)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
