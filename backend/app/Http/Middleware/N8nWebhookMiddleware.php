<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class N8nWebhookMiddleware
{
    public function handle(Request $request, Closure $next): mixed
    {
        $secret = config('services.n8n.webhook_secret');

        if (empty($secret) || $request->header('X-CRM-Secret') !== $secret) {
            return response()->json(['message' => 'Invalid webhook secret.'], 403);
        }

        return $next($request);
    }
}
