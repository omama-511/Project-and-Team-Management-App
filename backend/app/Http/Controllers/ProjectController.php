<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectMember;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index()
    {
        return Project::with('creator')
            ->withCount(['tasks', 'tasks as completed_tasks_count' => function ($query) {
                $query->where('status', 'Completed');
            }])
            ->get();
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $project = Project::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'status' => $validated['status'] ?? 'active',
            'created_by' => $request->user()->id,
        ]);

        return response()->json($project, 201);
    }

    public function show($id)
    {
        return Project::with(['tasks', 'members', 'creator'])
            ->withCount(['tasks', 'tasks as completed_tasks_count' => function ($query) {
                $query->where('status', 'Completed');
            }])
            ->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $project = Project::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|string',
        ]);

        $project->update($validated);
        return response()->json($project);
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $project = Project::findOrFail($id);
        $project->delete();

        return response()->json(null, 204);
    }

    public function addMember(Request $request, $projectId)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role_in_project' => 'nullable|string'
        ]);

        $member = ProjectMember::firstOrCreate([
            'project_id' => $projectId,
            'user_id' => $request->user_id,
        ], [
            'role_in_project' => $request->role_in_project
        ]);

        return response()->json($member, 201);
    }

    public function removeMember(Request $request, $projectId, $userId)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        ProjectMember::where('project_id', $projectId)
            ->where('user_id', $userId)
            ->delete();

        return response()->json(null, 204);
    }
}
