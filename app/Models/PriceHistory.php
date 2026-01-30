<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'price',
        'valid_from',
        'valid_to',
    ];

    //set the table name
    protected $table = 'price_history';
}
