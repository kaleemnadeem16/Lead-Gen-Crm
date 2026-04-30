<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CrmNote extends Model
{
    protected $table = 'crm_notes';

    protected $fillable = ['lead_id', 'user_id', 'content'];

    public function lead()
    {
        return $this->belongsTo(CrmLead::class, 'lead_id');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
