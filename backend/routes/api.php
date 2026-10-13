<?php

use App\Http\Controllers\Api\PublicMenuController;
use App\Http\Controllers\Api\PublicPlanController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => ['ok' => true]);

// Public, no login: everything is found from the table's QR token.
Route::prefix('public')->middleware('throttle:120,1')->group(function () {
    Route::get('/tables/{token}', [PublicMenuController::class, 'show'])
        ->where('token', '[A-Za-z0-9]{16,40}');

    // Price list for the marketing site's pricing page.
    Route::get('/plans', [PublicPlanController::class, 'index']);
});
