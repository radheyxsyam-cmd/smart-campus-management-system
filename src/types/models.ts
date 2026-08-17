export type UserRole = 'STUDENT' | 'ADMIN';

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

export type ComplaintCategory =
  | 'WiFi'
  | 'Classroom Equipment'
  | 'Hostel'
  | 'Cleanliness'
  | 'Electricity'
  | 'Plumbing'
  | 'Other';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Staff {
  staff_id: string;
  staff_name: string;
  department: string;
  contact: string;
  is_active: boolean;
}

export interface Complaint {
  complaint_id: string;
  student_id: string;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  submitted_at: string;
  updated_at: string;
  // joined fields (optional — present when fetched with relations)
  student_name?: string;
  student_email?: string;
  assignment?: ComplaintAssignment | null;
}

export interface ComplaintAssignment {
  assignment_id: string;
  complaint_id: string;
  staff_id: string;
  assigned_by: string;
  assigned_at: string;
  notes: string | null;
  // joined fields
  staff_name?: string;
  staff_department?: string;
  assigned_by_name?: string;
}

export interface AuthSession {
  user: Profile;
  session: unknown;
}
