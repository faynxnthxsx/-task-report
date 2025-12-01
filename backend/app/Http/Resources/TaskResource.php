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
            'id'       => $this->id,
            'title'    => $this->title,

            // ฟิลด์ที่ใช้ใน frontend
            'detail'   => $this->detail,
            'status'   => $this->status,      // pending / in_progress / completed

            // 👇 แก้ตรงนี้: ไม่เรียก ->toDateString() แล้ว
            'deadline' => $this->deadline ? (string) $this->deadline : null,

            'priority' => $this->priority,

            // เวลา ส่งเป็น string ปลอดภัยด้วย optional()
            'created_at' => optional($this->created_at)->toDateTimeString(),
            'updated_at' => optional($this->updated_at)->toDateTimeString(),
        ];
    }
}
