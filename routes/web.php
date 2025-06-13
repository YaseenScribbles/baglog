<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReceiptController;
use App\Http\Controllers\StationController;
use App\Http\Controllers\UserController;
use App\Models\StockSummary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return inertia('Components/LoadingPage');
});

Route::get('/test', function () {
    return inertia('Components/Header');
});

Route::middleware('guest')->group(function () {

    //Authentication
    Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
    Route::post("/login", [AuthController::class, 'login']);
});

Route::middleware(['auth', 'auth.session'])->group(function () {

    //Authentication
    Route::post("/logout", [AuthController::class, 'logout']);

    //Dashboard
    Route::get('/dashboard', [DashboardController::class, 'show'])->name('dashboard');

    //Products
    Route::resource('products', ProductController::class);

    //User
    Route::resource('users', UserController::class);

    //Stations
    Route::resource('stations', StationController::class);

    //Receipts
    Route::resource('receipts', ReceiptController::class);

    //Deliveries
    Route::resource('deliveries', DeliveryController::class);

    //Delivery Stock Api
    Route::get('/deliverystock', function (Request $request) {
        $station = $request->query('station_id');
        $product = $request->query('product_id');

        $stock = StockSummary::where('station_id', $station)->where('product_id', $product)->value('stock');
        return response()->json(['stock' => $stock ?? 0]);
    });
});
