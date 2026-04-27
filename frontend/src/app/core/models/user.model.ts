export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  email_verified_at?: string;
  created_at?: string;
  updated_at?: string;
}
