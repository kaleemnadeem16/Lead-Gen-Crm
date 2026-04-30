<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeamMemberController extends Controller
{
    public function syncRoles(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'roles'   => ['required', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
        ]);

        if ($user->hasRole('super_admin') && ! $request->user()->hasRole('super_admin')) {
            return response()->json(['message' => "Cannot modify a super admin's roles."], 403);
        }

        $user->syncRoles($request->roles);

        return response()->json([
            'data' => [
                'id'    => $user->id,
                'roles' => $user->fresh()->getRoleNames(),
            ],
        ]);
    }

    public function syncPermissions(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'permissions'   => ['required', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $user->syncPermissions($request->permissions);

        return response()->json([
            'data' => [
                'id'          => $user->id,
                'permissions' => $user->fresh()->getAllPermissions()->pluck('name'),
            ],
        ]);
    }
}
