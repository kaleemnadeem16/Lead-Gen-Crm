<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_outreach', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained('crm_leads')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('channel'); // email|phone|linkedin
            $table->string('subject')->nullable();
            $table->text('body')->nullable();
            $table->boolean('ai_generated')->default(false);
            $table->string('gmail_message_id')->nullable();
            $table->string('gmail_thread_id')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('replied_at')->nullable();
            $table->string('status')->default('draft'); // draft|sent|opened|replied|bounced
            $table->timestamps();
        });

        Schema::table('crm_outreach', function (Blueprint $table) {
            $table->index('lead_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_outreach');
    }
};
