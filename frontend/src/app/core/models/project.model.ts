import { User } from './user.model';
import { Task } from './task.model';

export interface Project {
  id: number;
  title: string;
  description: string | null;
  status: 'active' | 'completed' | 'archived' | string;
  created_by: number;
  creator?: User;
  tasks?: Task[];
  members?: ProjectMember[];
  tasks_count?: number;
  completed_tasks_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectMember extends User {
  pivot: {
    project_id: number;
    user_id: number;
    role_in_project: string | null;
    created_at: string;
    updated_at: string;
  };
}
