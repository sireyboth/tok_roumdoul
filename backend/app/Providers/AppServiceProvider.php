<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Catch typos in mass-assignment during development instead of losing data silently.
        Model::preventSilentlyDiscardingAttributes(! $this->app->isProduction());
    }
}
