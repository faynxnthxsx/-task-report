<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ❌ ห้าม truncate เพราะติด foreign key (task_comments.user_id)
        // ✅ ใช้ updateOrCreate แทน ปลอดภัย ไม่พัง FK

        User::updateOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('12345678'),
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'manager@test.com'],
            [
                'name' => 'Manager',
                'password' => Hash::make('12345678'),
                'role' => 'manager',
            ]
        );

        User::updateOrCreate(
            ['email' => 'staff@test.com'],
            [
                'name' => 'Staff',
                'password' => Hash::make('12345678'),
                'role' => 'staff',
            ]
        );
    }
}
