<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Receipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'station_id',
        'ref_no',
        'ref_date',
        'total_qty',
        'created_by',
        'modified_by'
    ];

    public function station()
    {
        return $this->belongsTo(Station::class);
    }

    public function items()
    {
        return $this->hasMany(ReceiptItem::class, 'receipt_id');
    }

    public function images()
    {
        return $this->hasMany(ReceiptImage::class);
    }
}
