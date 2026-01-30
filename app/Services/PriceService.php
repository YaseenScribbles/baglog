<?php

namespace App\Services;

use App\Models\PriceHistory;
use Carbon\Carbon;

class PriceService
{
    //get Active Price using productId and date
    public function getActivePrice($productId, $date)
    {
        return PriceHistory::where('product_id', $productId)
            ->where('valid_from', '<=', Carbon::parse($date))
            ->where(function ($query) use ($date) {
                $query->whereNull('valid_to')
                  ->orWhere('valid_to', '>', $date);
            })
            ->value('price') ?? 0;
    }
}
