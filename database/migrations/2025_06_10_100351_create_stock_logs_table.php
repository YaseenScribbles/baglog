<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stock_logs', function (Blueprint $table) {
            $table->id();
            $table->integer('station_id');
            $table->integer('product_id');
            $table->enum('type', ['receipt', 'delivery']);
            $table->integer('source_id');
            $table->decimal('qty');
            $table->timestamp('recorded_at');
            $table->timestamps();

            $table->index(['station_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_logs');
    }
};
