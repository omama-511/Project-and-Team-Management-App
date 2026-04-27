import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="not-found-container">
      <div class="content">
        <h1>404</h1>
        <mat-icon class="huge-icon">search_off</mat-icon>
        <h2>Oops! Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <button mat-raised-button color="primary" routerLink="/">
          <mat-icon>home</mat-icon> Back to Safety
        </button>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      color: white;
    }
    .content {
      padding: 40px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      max-width: 500px;
    }
    h1 {
      font-size: 120px;
      margin: 0;
      line-height: 1;
      background: linear-gradient(to bottom, #fff, #666);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      opacity: 0.8;
    }
    .huge-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      margin: 20px 0;
      color: #ff4081;
    }
    h2 {
      font-size: 28px;
      margin: 10px 0;
    }
    p {
      color: #aaa;
      margin-bottom: 30px;
    }
    button {
      padding: 0 30px;
      height: 48px;
      font-size: 16px;
      border-radius: 24px;
    }
  `]
})
export class NotFoundComponent {}
