import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';
import { Observable, BehaviorSubject, switchMap, startWith } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProjectCreate } from '../project-create/project-create';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatDialogModule, 
    MatChipsModule,
    MatProgressBarModule
  ],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css',
})
export class ProjectList implements OnInit {
  private projectService = inject(ProjectService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private notify = inject(NotificationService);

  private refresh$ = new BehaviorSubject<void>(undefined);
  projects$: Observable<Project[]> = this.refresh$.pipe(
    switchMap(() => this.projectService.getProjects()),
    startWith([])
  );

  displayedColumns: string[] = ['title', 'status', 'progress', 'creator', 'actions'];

  ngOnInit(): void { }

  loadProjects() {
    this.refresh$.next();
  }

  calculateProgress(project: Project): number {
    if (!project.tasks_count || project.tasks_count === 0) return 0;
    return Math.round((project.completed_tasks_count || 0) / project.tasks_count * 100);
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(ProjectCreate, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProjects();
        this.notify.showSuccess('Project created successfully!');
      }
    });
  }

  openEditDialog(project: Project) {
    const dialogRef = this.dialog.open(ProjectCreate, {
      width: '500px',
      data: { project }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProjects();
        this.notify.showSuccess('Project updated successfully!');
      }
    });
  }

  deleteProject(id: number) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(id).subscribe({
        next: () => {
          this.loadProjects();
          this.notify.showSuccess('Project deleted.');
        },
        error: (err: any) => {
          console.error('Error deleting project', err);
          this.notify.showError('Failed to delete project.');
        }
      });
    }
  }
  viewDetails(id: number) {
    this.router.navigate(['projects', id]);
  }
}
