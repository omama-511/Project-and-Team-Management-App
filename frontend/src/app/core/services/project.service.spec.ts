import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjectService } from './project.service';
import { firstValueFrom } from 'rxjs';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  const apiUrl = 'https://project-and-team-management-app-production.up.railway.app/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectService]
    });
    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all projects', async () => {
    const mockProjects = [{ id: 1, title: 'Project 1' }, { id: 2, title: 'Project 2' }];
    const promise = firstValueFrom(service.getProjects());

    const req = httpMock.expectOne(`${apiUrl}/projects`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProjects);

    const projects = await promise;
    expect(projects).toEqual(mockProjects);
  });

  it('should fetch a single project', async () => {
    const mockProject = { id: 1, title: 'Project 1' };
    const promise = firstValueFrom(service.getProject(1));

    const req = httpMock.expectOne(`${apiUrl}/projects/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockProject);

    const project = await promise;
    expect(project).toEqual(mockProject);
  });

  it('should create a project', async () => {
    const newProject = { title: 'New Project' };
    const mockResponse = { id: 3, ...newProject };
    const promise = firstValueFrom(service.createProject(newProject));

    const req = httpMock.expectOne(`${apiUrl}/projects`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    const res = await promise;
    expect(res).toEqual(mockResponse);
  });

  it('should update a project', async () => {
    const updatedData = { title: 'Updated Project' };
    const mockResponse = { id: 1, ...updatedData };
    const promise = firstValueFrom(service.updateProject(1, updatedData));

    const req = httpMock.expectOne(`${apiUrl}/projects/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);

    const res = await promise;
    expect(res).toEqual(mockResponse);
  });

  it('should delete a project', async () => {
    const promise = firstValueFrom(service.deleteProject(1));

    const req = httpMock.expectOne(`${apiUrl}/projects/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    const res = await promise;
    expect(res).toBeNull();
  });

  it('should add a member', async () => {
    const mockMember = { id: 1, user_id: 2, project_id: 1 };
    const promise = firstValueFrom(service.addMember(1, 2, 'editor'));

    const req = httpMock.expectOne(`${apiUrl}/projects/1/members`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ user_id: 2, role_in_project: 'editor' });
    req.flush(mockMember);

    const res = await promise;
    expect(res).toEqual(mockMember as any);
  });

  it('should remove a member', async () => {
    const promise = firstValueFrom(service.removeMember(1, 2));

    const req = httpMock.expectOne(`${apiUrl}/projects/1/members/2`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    const res = await promise;
    expect(res).toBeNull();
  });
});
