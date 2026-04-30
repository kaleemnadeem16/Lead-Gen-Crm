<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CrmOutreach extends Model
{
    protected $table = 'crm_outreach';

    protected $fillable = [
        'lead_id', 'user_id', 'channel', 'subject', 'body',
        'ai_generated', 'gmail_message_id', 'gmail_thread_id',
        'sent_at', 'opened_at', 'replied_at', 'status',
    ];

    protected $casts = [
        'ai_generated' => 'boolean',
        'sent_at'      => 'datetime',
        'opened_at'    => 'datetime',
        'replied_at'   => 'datetime',
    ];

    public function lead()
    {
        return $this->belongsTo(CrmLead::class, 'lead_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
