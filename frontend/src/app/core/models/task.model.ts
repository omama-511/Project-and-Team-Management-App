import { User } from './user.model';
import { Project } from './project.model';

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | string;
  priority: 'low' | 'medium' | 'high' | string | null;
  due_date: string | null;
  project?: Project;
  assignees?: User[];
  created_at?: string;
  updated_at?: string;
}
