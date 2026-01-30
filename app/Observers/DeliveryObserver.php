<?php

namespace App\Observers;

use App\Models\Delivery;
use App\Models\StockLog;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class DeliveryObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the Delivery "created" event.
     */
    public function created(Delivery $delivery): void
    {
        $delivery->loadMissing('items');
        foreach ($delivery->items as $item) {
            //from station
            StockLog::create([
                'station_id' => $delivery->from,
                'product_id' => $item->product_id,
                'type' => 'delivery',
                'source_id' => $delivery->id,
                'qty' => -$item->qty,
                'recorded_at' => $delivery->created_at,
                'price' => $item->price
            ]);

            //to station
            StockLog::create([
                'station_id' => $delivery->to,
                'product_id' => $item->product_id,
                'type' => 'delivery',
                'source_id' => $delivery->id,
                'qty' => $item->qty,
                'recorded_at' => $delivery->created_at,
                'price' => $item->price
            ]);
        }
    }

    /**
     * Handle the Delivery "updated" event.
     */
    public function updated(Delivery $delivery): void
    {
        // Delete old logs first
        StockLog::where('type', 'delivery')
            ->where('source_id', $delivery->id)
            ->delete();

        // Recreate logs
        $this->created($delivery);
    }

    /**
     * Handle the Delivery "deleted" event.
     */
    public function deleted(Delivery $delivery): void
    {
        StockLog::where('type', 'delivery')
            ->where('source_id', $delivery->id)
            ->delete();
    }

    /**
     * Handle the Delivery "restored" event.
     */
    public function restored(Delivery $delivery): void
    {
        //
    }

    /**
     * Handle the Delivery "force deleted" event.
     */
    public function forceDeleted(Delivery $delivery): void
    {
        //
    }
}
