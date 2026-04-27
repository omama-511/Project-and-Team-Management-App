import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { Observable, BehaviorSubject, switchMap, startWith } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserList implements OnInit {
  private authService = inject(AuthService);
  private notify = inject(NotificationService);

  private refresh$ = new BehaviorSubject<void>(undefined);
  users$: Observable<User[]> = this.refresh$.pipe(
    switchMap(() => this.authService.getUsers()),
    startWith([])
  );

  currentUser$ = this.authService.currentUser$;
  displayedColumns: string[] = ['name', 'email', 'role', 'created_at', 'actions'];

  ngOnInit(): void { }

  loadUsers() {
    this.refresh$.next();
  }

  toggleRole(user: User) {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const action = newRole === 'admin' ? 'Promote to Admin' : 'Revoke Admin Access';
    
    if (confirm(`Are you sure you want to ${action} for ${user.name}?`)) {
      this.authService.updateUserRole(user.id, newRole).subscribe({
        next: () => {
          this.loadUsers();
          this.notify.showSuccess(`User role updated to ${newRole}.`);
        },
        error: (err: any) => {
          this.notify.showError(err.error?.message || 'Failed to update role.');
        }
      });
    }
  }
}
