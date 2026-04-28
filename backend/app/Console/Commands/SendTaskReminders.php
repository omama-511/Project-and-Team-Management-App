<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Mail\TaskReminder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

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
        
        $tasks = Task::with('assignees')
            ->whereDate('due_date', $tomorrow)
            ->where('status', '!=', 'completed')
            ->get();

        foreach ($tasks as $task) {
            foreach ($task->assignees as $user) {
                Mail::to($user->email)->send(new TaskReminder($task, $user));
            }
        }

        $this->info('Sent reminders for ' . $tasks->count() . ' tasks.');
    }
}
