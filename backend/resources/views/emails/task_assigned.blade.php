<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7f6; margin: 0; padding: 0; }
        .wrapper { width: 100%; background-color: #f4f7f6; padding: 20px 0; }
        .container { width: 90%; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #4F46E5; font-size: 28px; font-weight: 800; text-decoration: none; }
        .greeting { font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 15px; }
        .details-box { background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .detail-item { margin-bottom: 10px; font-size: 15px; }
        .detail-label { font-weight: 600; color: #6B7280; width: 100px; display: inline-block; }
        .footer { text-align: center; font-size: 13px; color: #9CA3AF; margin-top: 30px; border-top: 1px solid #E5E7EB; padding-top: 20px; }
        .button { display: block; width: 200px; margin: 30px auto; padding: 12px 0; background-color: #4F46E5; color: #ffffff !important; text-align: center; text-decoration: none; border-radius: 6px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <a href="#" class="logo">CollabCore</a>
            </div>
            
            <div class="greeting">Hi {{ $user->name }},</div>
            <p>You have been assigned a new task. Here are the details:</p>
            
            <div class="details-box">
                <div class="detail-item"><span class="detail-label">Task:</span> {{ $task->title }}</div>
                <div class="detail-item"><span class="detail-label">Project:</span> {{ $task->project->name ?? 'N/A' }}</div>
                <div class="detail-item"><span class="detail-label">Priority:</span> {{ ucfirst($task->priority ?? 'medium') }}</div>
                <div class="detail-item"><span class="detail-label">Due Date:</span> {{ $task->due_date ? \Carbon\Carbon::parse($task->due_date)->format('F j, Y') : 'No deadline' }}</div>
            </div>

            <p>Please log in to your account to view the full description and start working on this task.</p>
            
            <a href="https://project-and-team-management-app-xcf.vercel.app/tasks" class="button">View My Tasks</a>

            <div class="footer">
                This is an automated notification from CollabCore.
            </div>
        </div>
    </div>
</body>
</html>
