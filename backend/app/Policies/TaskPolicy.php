<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager', 'staff'], true);
    }

    public function view(User $user, Task $task): bool
    {
        if (in_array($user->role, ['admin', 'manager'], true)) return true;

        return $user->role === 'staff'
            && (int) $task->assigned_to === (int) $user->id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'manager', 'staff'], true);
    }

    public function update(User $user, Task $task): bool
    {
        if (in_array($user->role, ['admin', 'manager'], true)) return true;

        return $user->role === 'staff'
            && (int) $task->assigned_to === (int) $user->id;
    }

    public function delete(User $user, Task $task): bool
    {
        // staff ลบไม่ได้
        return in_array($user->role, ['admin', 'manager'], true);
    }
}
