<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use App\Models\ReceiptItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReceiptController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $receiptsSql = DB::table('receipts', 'r')
            ->join('stations as s', 's.id', '=', 'r.station_id')
            ->join('users as u', 'u.id', '=', 'r.created_by')
            ->select('r.id', 'r.created_at', 'r.ref_no', 'r.ref_date', DB::raw('s.id as station_id'), 's.name', 'r.total_qty', DB::raw('u.name as created_by'));

        $stationsSql = DB::table('stations', 's')
            ->where('s.type', '=', 'floor')
            ->select('s.id', 's.name');

        $productsSql = DB::table('products', 'p')
            ->select('p.id', 'p.name');


        return inertia('Receipts', [
            'receipts' => fn() => $receiptsSql->get(),
            'stations' => fn() => $stationsSql->get(),
            'products' => fn() => $productsSql->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'station_id' => 'required|exists:stations,id',
            'total_qty' => 'required|numeric',
            'ref_no' => 'required|string',
            'ref_date' => 'required|string',
            'receipt_items' => 'required|array',
            'receipt_items.*.product_id' => 'required|exists:products,id',
            'receipts_items.*.qty' => 'required|numeric',
        ]);

        $master = $request->except('receipt_items');
        $master['created_by'] = auth()->user()->id;
        $items = $request->receipt_items;

        try {
            //code...
            DB::beginTransaction();
            $receipt = Receipt::create($master);
            foreach ($items as $value) {
                # code...
                ReceiptItem::create([
                    'receipt_id' => $receipt->id,
                    'product_id' => $value['product_id'],
                    'qty' => $value['qty'],
                ]);
            }
            DB::commit();
            return back()->with('message', 'Receipt created successfully');
        } catch (\Throwable $th) {
            //throw $th;
            DB::rollBack();
            return back()->with('message', $th->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Receipt $receipt)
    {
        $receipt->load(['station', 'items.product']);
        return response()->json($receipt);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Receipt $receipt)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Receipt $receipt)
    {
        $request->validate([
            'station_id' => 'required|exists:stations,id',
            'total_qty' => 'required|numeric',
            'ref_no' => 'required|string',
            'ref_date' => 'required|string',
            'receipt_items' => 'required|array',
            'receipt_items.*.product_id' => 'required|exists:products,id',
            'receipts_items.*.qty' => 'required|numeric',
        ]);

        $master = $request->except('receipt_items');
        $master['modified_by'] = auth()->user()->id;
        $items = $request->receipt_items;

        try {
            //code...
            DB::beginTransaction();
            $receipt->update($master);
            ReceiptItem::where('receipt_id', $receipt->id)->delete();
            foreach ($items as $value) {
                # code...
                ReceiptItem::create([
                    'receipt_id' => $receipt->id,
                    'product_id' => $value['product_id'],
                    'qty' => $value['qty'],
                ]);
            }
            DB::commit();
            return back()->with('message', 'Receipt updated successfully');
        } catch (\Throwable $th) {
            //throw $th;
            DB::rollBack();
            return back()->with('message', $th->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Receipt $receipt)
    {
        try {
            //code...
            DB::beginTransaction();
            ReceiptItem::where('receipt_id', $receipt->id)->delete();
            $receipt->delete();
            DB::commit();
            return back()->with('message', 'Receipt deleted successfully');
        } catch (\Throwable $th) {
            //throw $th;
            DB::rollBack();
            return back()->with('message', $th->getMessage());
        }
    }
}
