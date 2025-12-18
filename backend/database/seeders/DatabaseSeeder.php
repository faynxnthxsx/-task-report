<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // เรียก UserSeeder เพื่อสร้าง admin / manager / staff
        $this->call([
            UserSeeder::class,
        ]);
    }
}
