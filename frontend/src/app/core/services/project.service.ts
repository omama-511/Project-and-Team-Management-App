import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Project, ProjectMember } from '../models/project.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/projects`;

  getProjects() {
    return this.http.get<Project[]>(this.apiUrl);
  }

  getProject(id: number) {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  createProject(data: Partial<Project>) {
    return this.http.post<Project>(this.apiUrl, data);
  }

  updateProject(id: number, data: Partial<Project>) {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, data);
  }

  deleteProject(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addMember(projectId: number, userId: number, roleInProject?: string) {
    return this.http.post<ProjectMember>(`${this.apiUrl}/${projectId}/members`, {
      user_id: userId,
      role_in_project: roleInProject
    });
  }

  removeMember(projectId: number, userId: number) {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}/members/${userId}`);
  }
}
