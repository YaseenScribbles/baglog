<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'from',
        'to',
        'total_qty',
        'created_by',
        'modified_by',
        'ref_no'
    ];

    protected $table = "deliveries";

    public function from()
    {
        return $this->belongsTo(Station::class, 'from');
    }

    public function to()
    {
        return $this->belongsTo(Station::class, 'to');
    }

    public function items()
    {
        return $this->hasMany(DeliveryItem::class);
    }
}
