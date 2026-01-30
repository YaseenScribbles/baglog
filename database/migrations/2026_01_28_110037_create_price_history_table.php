<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('price_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->decimal('price', 16, 2);
            $table->dateTime('valid_from');
            $table->dateTime('valid_to')->nullable();
            $table->timestamps();
        });

        DB::statement("
            CREATE UNIQUE INDEX idx_product_validto_unique
            ON price_history (product_id)
            WHERE valid_to IS NULL
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('price_history');
    }
};
