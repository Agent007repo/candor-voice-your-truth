export interface Department {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface IssueCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category_id: string;
  department_id?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  anonymous_token: string;
  reporter_id?: string;
  assigned_to?: string;
  location?: string;
  attachments: any[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  
  // Joined data
  category?: IssueCategory;
  department?: Department;
  assigned_user?: Profile;
}

export interface IssueUpdate {
  id: string;
  issue_id: string;
  update_type: 'status_change' | 'comment' | 'assignment' | 'resolution';
  content: string;
  old_status?: string;
  new_status?: string;
  created_by?: string;
  is_public: boolean;
  created_at: string;
}

export interface AnonymousToken {
  id: string;
  token: string;
  issue_id: string;
  expires_at: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  role: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  department_id?: string;
  manager_id?: string;
  company?: string;
  job_title?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  department?: Department;
}

export type UserRole = 'employee' | 'manager' | 'hr' | 'admin';
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';