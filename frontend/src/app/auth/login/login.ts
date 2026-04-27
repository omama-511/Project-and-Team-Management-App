import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  isLoading = false;
  errorMessage = '';
  hidePassword = true;

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value as any).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (res) => {
        // Dynamically route based on their backend administrative credentials 
        if (res?.user?.role === 'admin') {
          this.router.navigate(['/projects']);
        } else {
          this.router.navigate(['/tasks']);
        }
      },
      error: (err) => {
        if (err.status === 422 && err.error?.errors) {
          const errors = err.error.errors;
          this.errorMessage = Object.values(errors).flat().join(' ');
        } else if (err.status === 401) {
          this.errorMessage = 'Incorrect email or password.';
        } else if (err.status === 404) {
          this.errorMessage = 'User account not found.';
        } else {
          this.errorMessage = err.error?.message || 'Unable to log in. Please check your credentials.';
        }
      }
    });
  }
}
