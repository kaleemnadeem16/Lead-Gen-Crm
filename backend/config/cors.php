<?php

return [

    /*
     * Cross-Origin Resource Sharing (CORS) configuration.
     * In development, the Vite proxy makes requests same-origin — CORS is irrelevant.
     * In production, crm.x1techs.com calls api-crm.x1techs.com — the origin must be allowed.
     */

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter([
        'https://crm.x1techs.com',
        env('CORS_ALLOWED_ORIGIN'),   // override per environment if needed
    ]),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
