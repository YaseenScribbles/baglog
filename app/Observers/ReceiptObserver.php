<?php

namespace App\Observers;

use App\Models\Receipt;
use App\Models\StockLog;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class ReceiptObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the Receipt "created" event.
     */
    public function created(Receipt $receipt): void
    {
        $receipt->loadMissing('items');
        foreach ($receipt->items as $item) {
            StockLog::create([
                'station_id' => $receipt->station_id,
                'product_id' => $item->product_id,
                'type' => 'receipt',
                'source_id' => $receipt->id,
                'qty' => $item->qty,
                'recorded_at' => $receipt->created_at,
                'price' => $item->price
            ]);
        }
    }



    /**
     * Handle the Receipt "updated" event.
     */
    public function updated(Receipt $receipt): void
    {
        // Delete old logs first
        StockLog::where('type', 'receipt')
            ->where('source_id', $receipt->id)
            ->delete();

        // Recreate logs
        $this->created($receipt);
    }

    /**
     * Handle the Receipt "deleted" event.
     */
    public function deleted(Receipt $receipt): void
    {
        StockLog::where('type', 'receipt')
            ->where('source_id', $receipt->id)
            ->delete();
    }

    /**
     * Handle the Receipt "restored" event.
     */
    public function restored(Receipt $receipt): void
    {
        //
    }

    /**
     * Handle the Receipt "force deleted" event.
     */
    public function forceDeleted(Receipt $receipt): void
    {
        //
    }
}
