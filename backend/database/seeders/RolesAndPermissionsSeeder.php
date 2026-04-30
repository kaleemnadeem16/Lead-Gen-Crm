<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'leads.view', 'leads.edit', 'leads.assign',
            'workflows.view', 'workflows.trigger',
            'outreach.view', 'outreach.draft', 'outreach.send',
            'analytics.view',
            'ai.chat',
            'templates.manage',
            'team.manage',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        $admin  = Role::firstOrCreate(['name' => 'admin']);
        $member = Role::firstOrCreate(['name' => 'member']);
        Role::firstOrCreate(['name' => 'super_admin']); // bypasses all checks via Gate::before

        $admin->syncPermissions($permissions);

        $member->syncPermissions([
            'leads.view',
            'workflows.view',
            'outreach.view',
            'analytics.view',
        ]);

        $this->command->info('Roles and permissions seeded.');
    }
}
