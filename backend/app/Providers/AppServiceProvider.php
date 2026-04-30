<?php

namespace App\Providers;

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

    public function boot(): void
    {
        // super_admin bypasses every permission check
        \Illuminate\Support\Facades\Gate::before(function ($user, string $ability) {
            if ($user->hasRole('super_admin')) {
                return true;
            }
        });
    }
}
