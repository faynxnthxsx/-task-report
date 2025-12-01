<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    /**
     * แปลง resource ให้เป็น array (JSON ส่งไปให้ frontend)
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'body'       => $this->body,
            'user_name'  => $this->user->name ?? 'ไม่ระบุชื่อ',
            'created_at' => $this->created_at,
        ];
    }
}
