<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'station_id',
        'product_id',
        'type',
        'source_id',
        'qty',
        'recorded_at',
    ];
}
