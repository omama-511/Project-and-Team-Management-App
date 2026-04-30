import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  private taskService = inject(TaskService);
  private platformId = inject(PLATFORM_ID);
  
  tasks: any[] = [];
  statusCounts = { pending: 0, in_progress: 0, completed: 0 };
  
  ngOnInit() {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
      this.calculateStats();
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.renderCharts(), 100);
      }
    });
  }

  calculateStats() {
    this.statusCounts = { pending: 0, in_progress: 0, completed: 0 };
    this.tasks.forEach(task => {
      const status = task.status?.toLowerCase().replace(' ', '_');
      if (this.statusCounts.hasOwnProperty(status)) {
        (this.statusCounts as any)[status]++;
      }
    });
  }

  renderCharts() {
    const statusCanvas = document.getElementById('statusChart') as HTMLCanvasElement;
    const productivityCanvas = document.getElementById('productivityChart') as HTMLCanvasElement;

    if (!statusCanvas || !productivityCanvas) {
      return;
    }

    // 1. Status Pie Chart
    new Chart(statusCanvas, {
      type: 'pie',
      data: {
        labels: ['Pending', 'In Progress', 'Completed'],
        datasets: [{
          data: [this.statusCounts.pending, this.statusCounts.in_progress, this.statusCounts.completed],
          backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
          borderWidth: 0
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } } 
      }
    });

    // 2. Team Productivity Bar Chart
    const userStats: any = {};
    this.tasks.filter(t => t.status === 'completed').forEach(task => {
      task.assignees?.forEach((user: any) => {
        userStats[user.name] = (userStats[user.name] || 0) + 1;
      });
    });

    new Chart(productivityCanvas, {
      type: 'bar',
      data: {
        labels: Object.keys(userStats),
        datasets: [{
          label: 'Completed Tasks',
          data: Object.values(userStats),
          backgroundColor: '#4f46e5',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
  }
}
