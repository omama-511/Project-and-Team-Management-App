<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #fefce8; margin: 0; padding: 0; }
        .wrapper { width: 100%; background-color: #fefce8; padding: 20px 0; }
        .container { width: 90%; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #fef08a; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { color: #d97706; font-size: 28px; font-weight: 800; text-decoration: none; }
        .greeting { font-size: 20px; font-weight: 600; color: #92400e; margin-bottom: 15px; }
        .details-box { background-color: #FFFBEB; border: 1px solid #FEF3C7; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .detail-item { margin-bottom: 10px; font-size: 15px; }
        .detail-label { font-weight: 600; color: #B45309; width: 100px; display: inline-block; }
        .footer { text-align: center; font-size: 13px; color: #9CA3AF; margin-top: 30px; border-top: 1px solid #E5E7EB; padding-top: 20px; }
        .button { display: block; width: 200px; margin: 30px auto; padding: 12px 0; background-color: #d97706; color: #ffffff !important; text-align: center; text-decoration: none; border-radius: 6px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <a href="#" class="logo">CollabCore Reminder</a>
            </div>
            
            <div class="greeting">Hi {{ $user->name }},</div>
            <p>This is a friendly reminder that a task assigned to you is due **tomorrow**.</p>
            
            <div class="details-box">
                <div class="detail-item"><span class="detail-label">Task:</span> {{ $task->title }}</div>
                <div class="detail-item"><span class="detail-label">Project:</span> {{ $task->project->name ?? 'N/A' }}</div>
                <div class="detail-item"><span class="detail-label">Priority:</span> {{ ucfirst($task->priority ?? 'medium') }}</div>
                <div class="detail-item"><span class="detail-label">Due Date:</span> {{ \Carbon\Carbon::parse($task->due_date)->format('F j, Y') }}</div>
            </div>

            <p>Please make sure to update the task status once you're finished.</p>
            
            <a href="https://project-and-team-management-app-xcf.vercel.app/tasks" class="button">Go to Dashboard</a>

            <div class="footer">
                You are receiving this because you have an upcoming task deadline.
            </div>
        </div>
    </div>
</body>
</html>
