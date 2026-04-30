import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '../models/task.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tasks`;

  getTasks() {
    return this.http.get<Task[]>(this.apiUrl);
  }

  getTask(id: number) {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  createTask(data: Partial<Task>) {
    return this.http.post<Task>(this.apiUrl, data);
  }

  updateTask(id: number, data: Partial<Task>) {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, data);
  }

  deleteTask(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignUser(taskId: number, userId: number) {
    return this.http.post<any>(`${this.apiUrl}/${taskId}/assign`, {
      user_id: userId
    });
  }
}
