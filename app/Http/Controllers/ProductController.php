<?php

namespace App\Http\Controllers;

use App\Models\PriceHistory;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        $productsSql = DB::table('products', 'p')
            ->join('users as u', 'u.id', '=', 'p.created_by')
            ->select(['p.id', 'p.code', 'p.name', 'p.costprice', DB::raw('u.name as created_by'), 'p.per_pack', 'p.product_type'])
            ->orderBy('p.product_type');

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
            'per_pack' => 'nullable|numeric',
            'product_type' => 'required|string',
            'images' => 'nullable|array',
            'images.*.image' => 'nullable|image|mimes:jpg,jpeg,png'
        ]);

        $masterData = $request->except('images');
        $masterData['created_by'] = auth()->user()->id;
        $images = $request->images;
        try {
            //code...
            DB::beginTransaction();
            $product = Product::create($masterData);
            //add to price history
            PriceHistory::create([
                'product_id' => $product->id,
                'price' => $product->costprice,
                'valid_from' => now(),
                'valid_to' => null,
            ]);

            if ($images) {
                foreach ($images as $img) {
                    $imgPath = $img['image']->store('images', 'public');

                    ProductImage::create([
                        'product_id' => $product->id,
                        'img_path' => $imgPath
                    ]);
                }
            }

            DB::commit();
            return back()->with('message', 'Product created successfully');
        } catch (\Throwable $th) {
            DB::rollBack();
            return back()->with('message', $th->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return response()->json([
            'product' => [
                'id' => $product->id,
                'code' => $product->code,
                'name' => $product->name,
                'costprice' => $product->costprice,
                'per_pack' => $product->per_pack,
                'images' => $product->images->map(function ($img) {
                    return ['img_path' => asset('/storage/' . $img->img_path)];
                })
            ]
        ]);
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
        $validated = $request->validate([
            'code' => 'required|string|unique:products,code,' . $product->id,
            'name' => 'required|string|unique:products,name,' . $product->id,
            'costprice' => 'nullable|numeric',
            'per_pack' => 'nullable|numeric',
            'product_type' => 'required|string',
            'images' => 'nullable|array',
            'images.*.is_new' => 'nullable|boolean',
            'images.*.image' => 'nullable|image|mimes:jpg,jpeg,png',
            'images.*.path' => 'nullable|string',
        ]);

        $images = $request->images ?? [];

        $validated['modified_by'] = auth()->id();

        $masterData = collect($validated)->except('images')->toArray();

        $timeStamp = now();

        $oldImagePaths = [];
        $newImages = [];

        foreach ($images as $image) {
            if (!isset($image['is_new'])) continue;

            if ($image['is_new']) {
                $newImages[] = $image['image'];
            } else {
                $oldImagePaths[] = str_replace(asset('storage') . '/', '', $image['path']);
            }
        }

        try {
            DB::beginTransaction();

            $product->update($masterData);

            //update price history if costprice changed
            if ($product->wasChanged('costprice')) {
                //update existing price history record
                PriceHistory::where('product_id', $product->id)
                    ->whereNull('valid_to')
                    ->update(['valid_to' => $timeStamp]);
                //create new price history record
                PriceHistory::create([
                    'product_id' => $product->id,
                    'price' => $product->costprice,
                    'valid_from' => $timeStamp,
                    'valid_to' => null,
                ]);
            }

            $imagesToDelete = $product->images()->whereNotIn('img_path', $oldImagePaths)->get();

            foreach ($imagesToDelete as $image) {
                Storage::disk('public')->delete($image->img_path);
            }

            $product->images()->whereNotIn('img_path', $oldImagePaths)->delete();

            foreach ($newImages as $image) {
                $imgPath = $image->store('images', 'public');

                ProductImage::create([
                    'product_id' => $product->id,
                    'img_path' => $imgPath,
                ]);
            }

            DB::commit();
            return back()->with('message', 'Product updated successfully');
        } catch (\Throwable $th) {
            DB::rollBack();

            Log::error('Product update failed', [
                'product_id' => $product->id,
                'error' => $th->getMessage(),
                'trace' => $th->getTraceAsString()
            ]);

            return back()->with('message', 'Something went wrong while updating the product.');
        }
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        try {
            DB::beginTransaction();
            foreach ($product->images as $img) {
                Storage::disk('public')->delete($img->img_path);
            }
            $product->images()->delete();
            $product->delete();
            DB::commit();
            return back()->with('message', $product->name . ' deleted successfully');
        } catch (\Throwable $th) {
            DB::rollBack();
            return back()->with('message', $th->getMessage());
        }
    }
}
