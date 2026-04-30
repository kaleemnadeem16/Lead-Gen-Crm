<?php

namespace App\Models;

use App\Models\ReadOnly\BusinessDetail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CrmLead extends Model
{
    use HasFactory;

    protected $table = 'crm_leads';

    protected $fillable = [
        'place_id', 'status', 'assigned_to', 'deal_value',
        'pipeline_stage', 'priority_override', 'is_archived',
        'last_contacted_at', 'next_followup_at', 'source_run_id',
    ];

    protected $casts = [
        'is_archived'        => 'boolean',
        'last_contacted_at'  => 'datetime',
        'next_followup_at'   => 'datetime',
        'deal_value'         => 'decimal:2',
    ];

    public function businessDetail()
    {
        return $this->belongsTo(BusinessDetail::class, 'place_id', 'place_id');
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function sourceRun()
    {
        return $this->belongsTo(CrmWorkflowRun::class, 'source_run_id');
    }

    public function notes()
    {
        return $this->hasMany(CrmNote::class, 'lead_id')->orderByDesc('created_at');
    }

    public function outreach()
    {
        return $this->hasMany(CrmOutreach::class, 'lead_id')->orderByDesc('sent_at');
    }

    public function tags()
    {
        return $this->belongsToMany(CrmTag::class, 'crm_lead_tags', 'lead_id', 'tag_id');
    }
}
