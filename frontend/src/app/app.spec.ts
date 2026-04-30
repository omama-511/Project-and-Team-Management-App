import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { AuthService } from './core/services/auth.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('App', () => {
  let authServiceSpy: any;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    authServiceSpy = {
      initializeAuth: vi.fn().mockReturnValue(of(null))
    };

    await TestBed.configureTestingModule({
      imports: [App, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    expect(app).toBeTruthy();
    expect(authServiceSpy.initializeAuth).toHaveBeenCalled();
  });
});
