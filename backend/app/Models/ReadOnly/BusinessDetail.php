<?php

namespace App\Models\ReadOnly;

use Illuminate\Database\Eloquent\Model;

class BusinessDetail extends Model
{
    protected $connection = 'n8n_pg';
    protected $table = 'business_details';
    protected $primaryKey = 'place_id';
    public $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $casts = [
        'types'  => 'array',
        'rating' => 'float',
    ];

    public static function boot(): void
    {
        parent::boot();
        static::creating(fn () => throw new \LogicException('BusinessDetail is read-only.'));
        static::updating(fn () => throw new \LogicException('BusinessDetail is read-only.'));
        static::deleting(fn () => throw new \LogicException('BusinessDetail is read-only.'));
    }

    public function aiAnalysis()
    {
        return $this->hasOne(AiAnalysis::class, 'place_id', 'place_id');
    }

    public function websiteAnalysis()
    {
        return $this->hasOne(WebsiteAnalysis::class, 'place_id', 'place_id');
    }

    public function enrichedData()
    {
        return $this->hasOne(EnrichedData::class, 'place_id', 'place_id');
    }

    public function crmLead()
    {
        return $this->hasOne(\App\Models\CrmLead::class, 'place_id', 'place_id');
    }
}
