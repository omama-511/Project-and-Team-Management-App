import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, take } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="profile-container">
      <mat-card class="profile-card">
        <mat-card-header>
          <div mat-card-avatar class="avatar-icon">
            <mat-icon>account_circle</mat-icon>
          </div>
          <mat-card-title>My Profile</mat-card-title>
          <mat-card-subtitle>Update your personal information</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-form">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="name" placeholder="John Doe">
              <mat-icon matPrefix>person</mat-icon>
              <mat-error *ngIf="profileForm.get('name')?.hasError('required')">Name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email" placeholder="john@example.com">
              <mat-icon matPrefix>email</mat-icon>
              <mat-error *ngIf="profileForm.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="profileForm.get('email')?.hasError('email')">Invalid email format</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Current Password (required to change password)</mat-label>
              <input matInput [type]="hideCurrentPassword ? 'password' : 'text'" formControlName="current_password">
              <mat-icon matPrefix>lock_open</mat-icon>
              <button mat-icon-button matSuffix (click)="hideCurrentPassword = !hideCurrentPassword" type="button">
                <mat-icon>{{hideCurrentPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>New Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              <mat-error *ngIf="profileForm.get('password')?.hasError('minlength')">Minimum 8 characters</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Confirm New Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password_confirmation">
              <mat-icon matPrefix>lock_outline</mat-icon>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" (click)="onCancel()" [disabled]="isLoading">
                Cancel
              </button>
              <button mat-raised-button color="primary" type="submit" [disabled]="profileForm.invalid || isLoading">
                <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                <span *ngIf="!isLoading">Update Profile</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 40px 24px;
      display: flex;
      justify-content: center;
    }
    .profile-card {
      width: 100%;
      max-width: 600px;
      padding: 16px;
      border-radius: 12px;
    }
    .avatar-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e0e0e0;
      color: #666;
      border-radius: 50%;
    }
    .avatar-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
    .profile-form {
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .w-full {
      width: 100%;
    }
    .form-actions {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    button[type="submit"] {
      height: 48px;
      padding: 0 32px;
      border-radius: 24px;
    }
    @media (prefers-color-scheme: dark) {
      .avatar-icon {
        background: #333;
        color: #aaa;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  profileForm!: FormGroup;
  isLoading = false;
  hideCurrentPassword = true;
  hidePassword = true;

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      current_password: [''],
      password: ['', [Validators.minLength(8)]],
      password_confirmation: ['']
    });

    this.authService.currentUser$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.profileForm.patchValue({
          name: user.name,
          email: user.email
        });
      }
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    this.isLoading = true;
    const data = { ...this.profileForm.value };
    
    // Only send password fields if user is trying to change password
    if (!data.password) {
      delete data.current_password;
      delete data.password;
      delete data.password_confirmation;
    }

    this.authService.updateProfile(data).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => {
        this.notify.showSuccess('Profile updated successfully!');
        this.profileForm.patchValue({
          current_password: '',
          password: '',
          password_confirmation: ''
        });
      },
      error: (err: any) => {
        const msg = err.error?.message || 'Failed to update profile.';
        if (err.status === 422 && err.error?.errors) {
          const firstError = Object.values(err.error.errors)[0] as string[];
          this.notify.showError(firstError[0]);
        } else {
          this.notify.showError(msg);
        }
      }
    });
  }

  onCancel() {
    this.router.navigate(['/']);
  }
}
