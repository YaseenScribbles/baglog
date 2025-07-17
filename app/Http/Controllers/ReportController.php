<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function showReceived(Request $request)
    {

        $fromDate = Carbon::parse($request->input('from_date') ?? Carbon::now()->startOfMonth())->startOfDay();
        $toDate = Carbon::parse($request->input('to_date') ?? Carbon::now())->endOfDay();

        $receivedSql = DB::table('receipts', 'r')
            ->join('receipt_items as ri', 'ri.receipt_id', '=', 'r.id')
            ->join('stations as s', 's.id', '=', 'r.station_id')
            ->join('products as p', 'p.id', '=', 'ri.product_id')
            ->whereBetween('r.created_at', [$fromDate, $toDate])
            ->select([DB::raw('ROW_NUMBER() OVER (ORDER BY r.id) as s_no'), 'r.id', 'r.created_at', DB::raw('s.name as station'), DB::raw('p.name as product'), 'ri.qty'])
            ->orderBy('r.id');

        return inertia('Reports/Received', ['received' => fn() => $receivedSql->get()]);
    }

    public function showDelivered(Request $request)
    {

        $fromDate = Carbon::parse($request->input('from_date') ?? Carbon::now()->startOfMonth())->startOfDay();
        $toDate = Carbon::parse($request->input('to_date') ?? Carbon::now())->endOfDay();

        $deliveredSql = DB::table('deliveries', 'd')
            ->join('delivery_items as di', 'di.delivery_id', '=', 'd.id')
            ->join('stations as s1', 's1.id', '=', 'd.from')
            ->join('stations as s2', 's2.id', '=', 'd.to')
            ->join('products as p', 'p.id', '=', 'di.product_id')
            ->whereBetween('d.created_at', [$fromDate, $toDate])
            ->select([DB::raw('ROW_NUMBER() OVER (ORDER BY d.id) as s_no'), 'd.id', 'd.created_at', DB::raw('s1.name as [from]'), DB::raw('s2.name as [to]'), DB::raw('p.name as product'), 'di.qty'])
            ->orderBy('d.id');

        return inertia('Reports/Delivered', ['delivered' => fn() => $deliveredSql->get()]);
    }

    public function showStock()
    {
        $stockSql = DB::table('stock_summary', 'st')
            ->join('stations as s', 's.id', '=', 'st.station_id')
            ->join('products as p', 'p.id', '=', 'st.product_id')
            ->select([DB::raw('ROW_NUMBER() OVER (ORDER BY s.id, p.id) as s_no'), DB::raw('s.name as station'), DB::raw('p.name as product'), DB::raw('st.stock as qty')])
            ->orderBy('s.id')
            ->orderBy('p.id');

        return inertia('Reports/Stock', ['stock' => fn() => $stockSql->get()]);
    }
}
