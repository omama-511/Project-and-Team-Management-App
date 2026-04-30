import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { firstValueFrom } from 'rxjs';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const apiUrl = 'https://project-and-team-management-app-production.up.railway.app/api/tasks';

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all tasks', async () => {
    const mockTasks = [{ id: 1, title: 'Task 1' }];
    const promise = firstValueFrom(service.getTasks());

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockTasks);

    const tasks = await promise;
    expect(tasks).toEqual(mockTasks);
  });

  it('should fetch a single task', async () => {
    const mockTask = { id: 1, title: 'Task 1' };
    const promise = firstValueFrom(service.getTask(1));

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTask);

    const task = await promise;
    expect(task).toEqual(mockTask);
  });

  it('should create a task', async () => {
    const newTask = { title: 'New Task', project_id: 1 };
    const mockResponse = { id: 1, ...newTask };
    const promise = firstValueFrom(service.createTask(newTask));

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    const res = await promise;
    expect(res).toEqual(mockResponse);
  });

  it('should update a task', async () => {
    const updateData = { status: 'completed' };
    const mockResponse = { id: 1, status: 'completed' };
    const promise = firstValueFrom(service.updateTask(1, updateData));

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);

    const res = await promise;
    expect(res).toEqual(mockResponse);
  });

  it('should assign a user to a task', async () => {
    const mockResponse = { success: true };
    const promise = firstValueFrom(service.assignUser(1, 2));

    const req = httpMock.expectOne(`${apiUrl}/1/assign`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ user_id: 2 });
    req.flush(mockResponse);

    const res = await promise;
    expect(res).toEqual(mockResponse);
  });

  it('should delete a task', async () => {
    const promise = firstValueFrom(service.deleteTask(1));

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    const res = await promise;
    expect(res).toBeNull();
  });
});
