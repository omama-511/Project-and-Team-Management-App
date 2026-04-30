import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskDetail } from './task-detail';
import { TaskService } from '../../../core/services/task.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TaskDetail Component', () => {
  let component: TaskDetail;
  let fixture: ComponentFixture<TaskDetail>;
  let taskServiceSpy: any;
  let routerSpy: any;

  beforeEach(async () => {
    taskServiceSpy = {
      getTask: vi.fn().mockReturnValue(of({ id: 1, title: 'Test Task' }))
    };
    routerSpy = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TaskDetail, NoopAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(taskServiceSpy.getTask).toHaveBeenCalledWith(1);
  });

  it('should navigate back if taskId is 0', () => {
    // We need a new fixture with taskId 0
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TaskDetail, NoopAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '0' } }
          }
        }
      ]
    }).compileComponents();
    
    const newFixture = TestBed.createComponent(TaskDetail);
    newFixture.detectChanges();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('should navigate back when goBack is called', () => {
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tasks']);
  });
});
