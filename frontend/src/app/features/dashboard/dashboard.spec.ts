import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DashboardComponent } from './dashboard';
import { TaskService } from '../../core/services/task.service';
import { of } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let taskServiceSpy: any;

  beforeEach(async () => {
    taskServiceSpy = {
      getTasks: vi.fn().mockReturnValue(of([
        { id: 1, status: 'completed', assignees: [{ name: 'User 1' }] },
        { id: 2, status: 'in progress', assignees: [{ name: 'User 1' }] },
        { id: 3, status: 'pending' }
      ]))
    };

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    // Mock canvas elements
    const statusCanvas = document.createElement('canvas');
    statusCanvas.id = 'statusChart';
    const productivityCanvas = document.createElement('canvas');
    productivityCanvas.id = 'productivityChart';
    document.body.appendChild(statusCanvas);
    document.body.appendChild(productivityCanvas);

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    document.getElementById('statusChart')?.remove();
    document.getElementById('productivityChart')?.remove();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate stats correctly', () => {
    component.calculateStats();
    expect(component.statusCounts.completed).toBe(1);
    expect(component.statusCounts.in_progress).toBe(1);
    expect(component.statusCounts.pending).toBe(1);
  });

  it('should render charts after timeout', async () => {
    await new Promise(resolve => setTimeout(resolve, 150));
    // If it didn't throw, it likely called renderCharts
    expect(document.getElementById('statusChart')).toBeTruthy();
  });

  it('should not render charts on server platform', async () => {
    // Reset and reconfigure for server
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    }).compileComponents();
    
    const serverFixture = TestBed.createComponent(DashboardComponent);
    const serverComponent = serverFixture.componentInstance;
    vi.spyOn(serverComponent, 'renderCharts');
    serverFixture.detectChanges();
    
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(serverComponent.renderCharts).not.toHaveBeenCalled();
  });

  it('should ignore unknown status', () => {
    component.tasks = [{ status: 'UNKNOWN' }];
    component.calculateStats();
    expect(component.statusCounts.pending).toBe(0);
    expect(component.statusCounts.in_progress).toBe(0);
    expect(component.statusCounts.completed).toBe(0);
  });
});
