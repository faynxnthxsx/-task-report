<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskCommentResource extends JsonResource
{
    /**
     * แปลง resource ให้เป็น array (รูปแบบ JSON ส่งไปให้ frontend)
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'body'      => $this->body,
            'user_id'   => $this->user_id,
            'user_name' => $this->whenLoaded('user', fn () => $this->user?->name),
            'created_at'=> $this->created_at,
        ];
    }
}
