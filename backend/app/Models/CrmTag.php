<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CrmTag extends Model
{
    protected $table = 'crm_tags';

    public $timestamps = false;

    protected $fillable = ['name', 'color'];

    public function leads()
    {
        return $this->belongsToMany(CrmLead::class, 'crm_lead_tags', 'tag_id', 'lead_id');
    }
}
