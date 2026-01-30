<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'costprice',
        'created_by',
        'modified_by',
        'active',
        'per_pack',
        'product_type',
    ];

    public function images(){
        return $this->hasMany(ProductImage::class);
    }
}
