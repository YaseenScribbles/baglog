<?php

namespace App\Providers;

use App\Models\Delivery;
use App\Models\Receipt;
use App\Observers\DeliveryObserver;
use App\Observers\ReceiptObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Receipt::observe(ReceiptObserver::class);
        Delivery::observe(DeliveryObserver::class);
    }
}
