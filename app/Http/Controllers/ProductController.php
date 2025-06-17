<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        $productsSql = DB::table('products', 'p')
            ->join('users as u', 'u.id', '=', 'p.created_by')
            ->select(['p.id', 'p.code', 'p.name', 'p.costprice', DB::raw('u.name as created_by'), 'p.per_pack']);

        return inertia('Products', [
            'products' => fn() => $productsSql->get()
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
        $data = $request->validate([
            'code' => 'required|string|unique:products,code',
            'name' => 'required|string|unique:products,name',
            'costprice' => 'nullable|numeric',
            'per_pack' => 'nullable|numeric'
        ]);

        $data['created_by'] = auth()->user()->id;

        Product::create($data);
        return back()->with('message', 'Product created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'code' => 'required|string|unique:products,code,' . $product->id,
            'name' => 'required|string|unique:products,name,' . $product->id,
            'costprice' => 'nullable|numeric',
            'per_pack' => 'nullable|numeric'
        ]);

        $data['modified_by'] = auth()->user()->id;

        $product->update($data);
        return back()->with('message', 'Product updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();
        return back()->with('message', $product->name . ' deleted successfully');
    }
}
