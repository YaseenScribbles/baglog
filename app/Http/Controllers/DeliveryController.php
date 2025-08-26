<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use App\Models\DeliveryItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeliveryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $deliveriesSql = DB::table('deliveries', 'd')
            ->join('stations as s1', 's1.id', '=', 'd.from')
            ->join('stations as s2', 's2.id', '=', 'd.to')
            ->join('users as u', 'u.id', '=', 'd.created_by')
            ->select('d.id', 'd.created_at', 'd.ref_no', DB::raw('s1.name as [from]'), DB::raw('s2.name as [to]'), 'd.total_qty', DB::raw('u.name as created_by'), DB::raw('ROW_NUMBER () OVER (ORDER BY d.id) as s_no'));

        $stationsSql = DB::table('stations', 's')
            ->select('s.id', 's.name');

        $productsSql = DB::table('products', 'p')
            ->select('p.id', DB::raw("p.name + ISNULL(' (' + CAST(p.per_pack AS VARCHAR(10)) + ')', '') AS name"));


        return inertia('Deliveries', [
            'deliveries' => fn() => $deliveriesSql->get(),
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
            'from' => 'required|exists:stations,id',
            'to' => 'required|exists:stations,id',
            'total_qty' => 'required|numeric',
            'ref_no' => 'nullable|string',
            'delivery_items' => 'required|array',
            'delivery_items.*.product_id' => 'required|exists:products,id',
            'deliverys_items.*.qty' => 'required|numeric',
        ]);

        $master = $request->except('delivery_items');
        $master['created_by'] = auth()->user()->id;
        $items = $request->delivery_items;

        try {
            //code...
            DB::beginTransaction();
            $delivery = Delivery::create($master);
            foreach ($items as $value) {
                # code...
                DeliveryItem::create([
                    'delivery_id' => $delivery->id,
                    'product_id' => $value['product_id'],
                    'qty' => $value['qty'],
                ]);
            }
            DB::commit();
            return back()->with('message', 'Delivery created successfully');
        } catch (\Throwable $th) {
            //throw $th;
            DB::rollBack();
            return back()->with('message', $th->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Delivery $delivery)
    {
        $delivery->load(['from', 'to', 'items.product']);
        return response()->json($delivery);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Delivery $delivery)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Delivery $delivery)
    {
        $request->validate([
            'from' => 'required|exists:stations,id',
            'to' => 'required|exists:stations,id',
            'total_qty' => 'required|numeric',
            'ref_no' => 'nullable|string',
            'delivery_items' => 'required|array',
            'delivery_items.*.product_id' => 'required|exists:products,id',
            'deliverys_items.*.qty' => 'required|numeric',
        ]);

        $master = $request->except('delivery_items');
        $master['modified_by'] = auth()->user()->id;
        $items = $request->delivery_items;

        try {
            //code...
            DB::beginTransaction();
            $delivery->update($master);
            DeliveryItem::where('delivery_id', $delivery->id)->delete();
            foreach ($items as $value) {
                # code...
                DeliveryItem::create([
                    'delivery_id' => $delivery->id,
                    'product_id' => $value['product_id'],
                    'qty' => $value['qty'],
                ]);
            }
            DB::commit();
            return back()->with('message', 'Delivery updated successfully');
        } catch (\Throwable $th) {
            //throw $th;
            DB::rollBack();
            return back()->with('message', $th->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Delivery $delivery)
    {
        try {
            //code...
            DB::beginTransaction();
            DeliveryItem::where('delivery_id', $delivery->id)->delete();
            $delivery->delete();
            DB::commit();
            return back()->with('message', 'Delivery deleted successfully');
        } catch (\Throwable $th) {
            //throw $th;
            DB::rollBack();
            return back()->with('message', $th->getMessage());
        }
    }
}
