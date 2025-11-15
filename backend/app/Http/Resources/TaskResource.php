<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
     * แปลง resource ให้เป็น array
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'title'      => $this->title,
            // ถ้ามีฟิลด์อื่นในตาราง เช่น detail, status ค่อยเพิ่มทีหลังได้
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
