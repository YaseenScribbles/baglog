<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockSummary extends Model
{
    use HasFactory;

    protected $guarded = [];
    public $timestamps = false;
    public $incrementing = false;
    public $table = 'stock_summary';
}
