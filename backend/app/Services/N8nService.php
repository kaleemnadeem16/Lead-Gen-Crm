<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class N8nService
{
    public function triggerOrchestrator(array $params): bool
    {
        $url = config('services.n8n.webhook_url');

        try {
            $response = Http::timeout(10)->post($url, [
                'business_type'  => $params['business_type'],
                'location'       => $params['location'],
                'max_results'    => $params['max_results'] ?? 20,
                'min_lead_score' => $params['min_lead_score'] ?? 6,
                'ai_model'       => $params['ai_model'] ?? 'gpt-4o-mini',
                'is_testing'     => false,
            ]);

            if ($response->failed()) {
                Log::warning('n8n webhook returned non-2xx', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::warning('n8n webhook unreachable', ['error' => $e->getMessage()]);
            return false;
        }
    }
}
