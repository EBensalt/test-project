<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'location',
        'max_participants',
        "description",
        "title",
        "user_id"
    ];

    protected $casts = [
        'date' => 'datetime',
    ];
}
