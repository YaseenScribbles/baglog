<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReceiptImage extends Model
{
    use HasFactory;

    public function getImageUrlAttribute()
    {
        return asset('storage/' . $this->image_path);
    }

    protected $guarded = [];
    public $timestamps = false;
    public $incrementing = false;
    protected $appends = ['image_url'];
}
