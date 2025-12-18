<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'color',
    ];

    /**
     * Tag หนึ่งอัน อยู่ได้หลาย Task
     */
    public function tasks()
    {
        return $this->belongsToMany(Task::class, 'task_tag')
            ->withTimestamps();
    }
}
