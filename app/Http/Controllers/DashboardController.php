<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function show(Request $request)
    {
        $fromDate = Carbon::parse($request->input('from_date') ?? Carbon::now()->startOfMonth())->startOfDay();
        $toDate = Carbon::parse($request->input('to_date') ?? Carbon::now())->endOfDay();

        $fromDateStockSub = DB::table('stock_logs')
            ->select('station_id', 'product_id', DB::raw('sum(qty) as stock'))
            ->where('recorded_at', '<=', $fromDate)
            ->groupBy('station_id', 'product_id');

        $toDateStockSub = DB::table('stock_logs')
            ->select('station_id', 'product_id', DB::raw('sum(qty) as stock'))
            ->where('recorded_at', '<=', $toDate)
            ->groupBy('station_id', 'product_id');

        $deliveryInBetweenSub = DB::table('deliveries as d')
            ->join('delivery_items as di', 'di.delivery_id','=', 'd.id')
            ->select(DB::raw('d.[from] as station_id'), 'di.product_id', DB::raw('sum(di.qty) as qty'))
            ->whereBetween('d.created_at', [$fromDate, $toDate])
            ->groupBy('d.from', 'di.product_id');


        $stock = DB::table("stations", "s")
            // ->where('s.type', 'floor')
            ->crossJoin('products as p')
            ->leftJoinSub($fromDateStockSub, 'from_stock', function ($join) {
                $join->on('from_stock.station_id', '=', 's.id')
                    ->on('from_stock.product_id', '=', 'p.id');
            })
            ->leftJoinSub($toDateStockSub, 'to_stock', function ($join) {
                $join->on('to_stock.station_id', '=', 's.id')
                    ->on('to_stock.product_id', '=', 'p.id');
            })
            ->leftJoinSub($deliveryInBetweenSub, 'delivery', function ($join) {
                $join->on('delivery.station_id', '=',  's.id')
                    ->on('delivery.product_id', '=', 'p.id');
            })
            ->select([
                DB::raw("s.name as station"),
                DB::raw("p.name as product"),
                DB::raw("coalesce(p.costprice, 0) as cost_price"),
                DB::raw("coalesce(from_stock.stock, 0) as [from]"),
                DB::raw("coalesce(to_stock.stock, 0) as [to]"),
                DB::raw("coalesce(delivery.qty,0) as [delivery]")
            ])
            ->orderBy('s.id');

        // $sql = $stock->toSql();
        // Log::info($sql);

        return inertia('Dashboard', [
            'stock' => fn() => $stock->get()
        ]);
    }
}
