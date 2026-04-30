<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CrmTemplate extends Model
{
    protected $table = 'crm_templates';

    protected $fillable = [
        'created_by', 'name', 'channel', 'subject', 'body', 'variables', 'is_shared',
    ];

    protected $casts = [
        'variables' => 'array',
        'is_shared' => 'boolean',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
