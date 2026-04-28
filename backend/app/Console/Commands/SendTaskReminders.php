<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SendTaskReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-task-reminders';
    protected $description = 'Send email reminders for tasks due in 24 hours';

    public function handle()
    {
        $tomorrow = now()->addDay()->format('Y-m-d');
        
        $tasks = \App\Models\Task::with('assignees')
            ->whereDate('due_date', $tomorrow)
            ->where('status', '!=', 'completed')
            ->get();

        foreach ($tasks as $task) {
            foreach ($task->assignees as $user) {
                \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\TaskReminder($task, $user));
            }
        }

        $this->info('Sent reminders for ' . $tasks->count() . ' tasks.');
    }
}
