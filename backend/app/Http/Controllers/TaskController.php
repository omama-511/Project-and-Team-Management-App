<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskAssignment;
use App\Models\User;
use App\Mail\TaskAssigned;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role === 'admin') {
            return Task::with(['project', 'assignees'])->get();
        }

        // Return only tasks assigned to the user
        return $request->user()->assignedTasks()->with('project')->get();
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string',
            'priority' => 'nullable|string',
            'due_date' => 'nullable|date',
            'assignee_ids' => 'nullable|array',
            'assignee_ids.*' => 'exists:users,id'
        ]);

        $task = Task::create($validated);
        
        if (!empty($validated['assignee_ids'])) {
            $task->assignees()->sync($validated['assignee_ids']);
            
            // Send emails to all assignees
            $task->load(['assignees', 'project']);
            defer(function () use ($task) {
                foreach ($task->assignees as $assignee) {
                    Mail::to($assignee->email)->send(new TaskAssigned($task, $assignee));
                }
            });
        }

        return response()->json($task->load('assignees'), 201);
    }

    public function show($id)
    {
        return Task::with(['project', 'assignees'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);
        $user = $request->user();

        if ($user->role !== 'admin') {
            // Check if user is assigned
            $isAssigned = $task->assignees()->where('users.id', $user->id)->exists();
            if (!$isAssigned) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Normal users can only update status
            $validated = $request->validate([
                'status' => 'required|string',
            ]);
            
            $task->update(['status' => $validated['status']]);
            return response()->json($task->load('assignees'));
        }

        // Admins can update everything 
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|string',
            'priority' => 'sometimes|string',
            'due_date' => 'nullable|date',
            'assignee_ids' => 'nullable|array',
            'assignee_ids.*' => 'exists:users,id'
        ]);

        $task->update($validated);
        
        if (isset($validated['assignee_ids'])) {
            $task->assignees()->sync($validated['assignee_ids']);
        }

        return response()->json($task->load('assignees'));
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $task = Task::findOrFail($id);
        $task->delete();

        return response()->json(null, 204);
    }

    public function assignUser(Request $request, $taskId)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        $assignment = TaskAssignment::firstOrCreate([
            'task_id' => $taskId,
            'user_id' => $request->user_id
        ]);

        // Send email to the assigned user
        $task = Task::with('project')->findOrFail($taskId);
        $user = User::findOrFail($request->user_id);
        defer(function () use ($task, $user) {
            Mail::to($user->email)->send(new TaskAssigned($task, $user));
        });

        return response()->json($assignment, 201);
    }
}
