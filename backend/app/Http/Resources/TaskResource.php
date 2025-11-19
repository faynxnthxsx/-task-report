<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
     * แปลง resource ให้เป็น array (รูปแบบ JSON ส่งไปให้ frontend)
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'title'      => $this->title,

            // ✅ เพิ่มฟิลด์ที่ใช้ใน frontend
            'detail'     => $this->detail,
            'status'     => $this->status,   // pending / in_progress / completed

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
