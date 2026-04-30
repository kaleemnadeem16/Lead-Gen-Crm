<?php

namespace App\Models\ReadOnly;

use Illuminate\Database\Eloquent\Model;

class WebsiteAnalysis extends Model
{
    protected $connection = 'n8n_pg';
    protected $table = 'website_analysis';
    public $timestamps = false;

    protected $casts = [
        'has_google_analytics'  => 'boolean',
        'detected_technologies' => 'array',
    ];

    public static function boot(): void
    {
        parent::boot();
        static::creating(fn () => throw new \LogicException('WebsiteAnalysis is read-only.'));
        static::updating(fn () => throw new \LogicException('WebsiteAnalysis is read-only.'));
        static::deleting(fn () => throw new \LogicException('WebsiteAnalysis is read-only.'));
    }
}
