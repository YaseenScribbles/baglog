<?php

namespace App\Console\Commands;

use App\Models\Delivery;
use App\Models\Receipt;
use App\Models\StockLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncStockLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:sync-stock-logs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'To update the stock logs table';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Syncing stock logs...");

        DB::transaction(function () {
            // Clear logs
            DB::table('stock_logs')->truncate();

            // Rebuild from receipts
            Receipt::with('items')->chunk(100, function ($receipts) {
                foreach ($receipts as $receipt) {
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
            });

            // Rebuild from deliveries
            Delivery::with('items')->chunk(100, function ($deliveries) {
                foreach ($deliveries as $delivery) {
                    foreach ($delivery->items as $item) {
                        StockLog::create([
                            'station_id' => $delivery->from,
                            'product_id' => $item->product_id,
                            'type' => 'delivery',
                            'source_id' => $delivery->id,
                            'qty' => -$item->qty,
                            'recorded_at' => $delivery->created_at,
                            'price' => $item->price
                        ]);

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
            });
        });

        $this->info("Stock logs successfully synced.");
    }
}
