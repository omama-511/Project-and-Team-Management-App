import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksCreate } from './tasks-create';

describe('TasksCreate', () => {
  let component: TasksCreate;
  let fixture: ComponentFixture<TasksCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
