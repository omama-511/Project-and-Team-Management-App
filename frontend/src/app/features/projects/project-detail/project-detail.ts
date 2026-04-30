import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project } from '../../../core/models/project.model';
import { Observable, BehaviorSubject, switchMap, startWith, map, catchError, of, EMPTY } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProjectMemberAssign } from '../project-member-assign/project-member-assign';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatChipsModule,
    MatListModule,
    MatDividerModule,
    MatTabsModule,
    MatDialogModule
  ],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css'
})
export class ProjectDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  private refresh$ = new BehaviorSubject<void>(undefined);
  
  projectId = +(this.route.snapshot.paramMap.get('id') || 0);
  
  project$: Observable<Project | null> = this.refresh$.pipe(
    switchMap(() => this.projectService.getProject(this.projectId).pipe(
      catchError(err => {
        console.error('Error loading project', err);
        this.goBack();
        return EMPTY;
      })
    )),
    startWith(null)
  );

  currentUser$ = this.authService.currentUser$;

  ngOnInit(): void {
    if (!this.projectId) {
      this.goBack();
    }
  }

  loadProject() {
    this.refresh$.next();
  }

  openAddMemberDialog() {
    const dialogRef = this.dialog.open(ProjectMemberAssign, {
      width: '400px',
      data: { projectId: this.projectId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadProject();
    });
  }

  removeMember(userId: number) {
    if (confirm('Remove this member from the project?')) {
      this.projectService.removeMember(this.projectId, userId).subscribe({
        next: () => this.loadProject(),
        error: (err) => console.error('Remove member failed', err)
      });
    }
  }

  goBack() {
    this.router.navigate(['/projects']);
  }
}
