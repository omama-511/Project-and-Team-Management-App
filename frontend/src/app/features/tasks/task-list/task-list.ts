import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { Task } from '../../../core/models/task.model';
import { User } from '../../../core/models/user.model';
import { Observable, BehaviorSubject, combineLatest, map, switchMap, startWith } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { TasksCreate } from '../tasks-create/tasks-create';
import { TaskAssign } from '../task-assign/task-assign';
import { NotificationService } from '../../../core/services/notification.service';


@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatChipsModule,
    MatMenuModule
  ],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css'
})
export class TaskList implements OnInit {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private notify = inject(NotificationService);

  private refresh$ = new BehaviorSubject<void>(undefined);
  private statusFilter$ = new BehaviorSubject<string>('all');
  
  currentUser$: Observable<User | null> = this.authService.currentUser$;
  
  tasks$: Observable<Task[]> = this.refresh$.pipe(
    switchMap(() => this.taskService.getTasks()),
    startWith([])
  );

  filteredTasks$: Observable<Task[]> = combineLatest([this.tasks$, this.statusFilter$]).pipe(
    map(([tasks, status]) => {
      if (status === 'all') return tasks;
      return tasks.filter(t => t.status === status);
    })
  );

  displayedColumns: string[] = ['title', 'assignees', 'status', 'priority', 'due_date', 'actions'];
  selectedStatus: string = 'all';
  private isAdminFlag = false;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAdminFlag = !!(user && user.role === 'admin');
    });
  }

  get isAdmin(): boolean {
    return this.isAdminFlag;
  }

  loadTasks() {
    this.refresh$.next();
  }

  applyFilter(status: string) {
    this.selectedStatus = status;
    this.statusFilter$.next(status);
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(TasksCreate, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasks();
        this.notify.showSuccess('Task created successfully!');
      }
    });
  }

  openEditDialog(task: Task) {
    const dialogRef = this.dialog.open(TasksCreate, {
      width: '500px',
      data: { task, isAdmin: this.isAdmin }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasks();
        this.notify.showSuccess('Task updated successfully!');
      }
    });
  }

  openAssignDialog(task: Task) {
    if (!this.isAdmin) return;

    const dialogRef = this.dialog.open(TaskAssign, {
      width: '400px',
      data: { task }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasks();
        this.notify.showSuccess('Assignees updated.');
      }
    });
  }

  deleteTask(id: number) {
    if (!this.isAdmin) return;
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.loadTasks();
          this.notify.showSuccess('Task deleted.');
        },
        error: (err: any) => {
          console.error('Error deleting task', err);
          this.notify.showError('Failed to delete task.');
        }
      });
    }
  }

  updateStatus(task: Task, newStatus: string) {
    this.taskService.updateTask(task.id, { status: newStatus }).subscribe({
      next: () => {
        this.loadTasks();
        this.notify.showInfo(`Task status: ${newStatus}`);
      },
      error: (err: any) => {
        console.error('Error updating status', err);
        this.notify.showError('Failed to update status.');
      }
    });
  }

  viewDetails(id: number) {
    this.router.navigate(['/tasks', id]);
  }
}
