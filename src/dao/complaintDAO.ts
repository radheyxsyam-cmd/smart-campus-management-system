import { supabase } from '@/lib/supabaseClient';
import type { Complaint, ComplaintStatus, ComplaintCategory } from '@/types/models';

export async function insertComplaint(
  studentId: string,
  category: ComplaintCategory,
  description: string
): Promise<Complaint> {
  const { data, error } = await supabase
    .from('complaints')
    .insert({
      student_id: studentId,
      category,
      description,
      status: 'Pending',
    })
    .select(
      'complaint_id, student_id, category, description, status, submitted_at, updated_at'
    )
    .single();

  if (error) throw error;
  return data as Complaint;
}

export async function fetchComplaintsByStudent(studentId: string): Promise<Complaint[]> {
  const { data, error } = await supabase
    .from('complaints')
    .select(
      `
      complaint_id, student_id, category, description, status, submitted_at, updated_at,
      complaint_assignments (
        assignment_id, complaint_id, staff_id, assigned_by, assigned_at, notes
      )
    `
    )
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return (data as unknown as Complaint[]) ?? [];
}

export async function fetchAllComplaints(): Promise<Complaint[]> {
  const { data, error } = await supabase
    .from('complaints')
    .select(
      `
      complaint_id, student_id, category, description, status, submitted_at, updated_at,
      student:profiles!complaints_student_id_fkey ( full_name, email ),
      complaint_assignments (
        assignment_id, complaint_id, staff_id, assigned_by, assigned_at, notes,
        staff:staff!complaint_assignments_staff_id_fkey ( staff_name, department )
      )
    `
    )
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return normalizeComplaints(data);
}

export async function updateComplaintStatus(
  complaintId: string,
  status: ComplaintStatus
): Promise<Complaint> {
  const { data, error } = await supabase
    .from('complaints')
    .update({ status })
    .eq('complaint_id', complaintId)
    .select(
      'complaint_id, student_id, category, description, status, submitted_at, updated_at'
    )
    .single();

  if (error) throw error;
  return data as Complaint;
}

export async function fetchComplaintById(complaintId: string): Promise<Complaint | null> {
  const { data, error } = await supabase
    .from('complaints')
    .select(
      `
      complaint_id, student_id, category, description, status, submitted_at, updated_at,
      student:profiles!complaints_student_id_fkey ( full_name, email ),
      complaint_assignments (
        assignment_id, complaint_id, staff_id, assigned_by, assigned_at, notes,
        staff:staff!complaint_assignments_staff_id_fkey ( staff_name, department )
      )
    `
    )
    .eq('complaint_id', complaintId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return normalizeComplaints([data])[0];
}

// ---- helpers to flatten Supabase join shapes into our Complaint interface ----

interface RawComplaintRow {
  complaint_id: string;
  student_id: string;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  submitted_at: string;
  updated_at: string;
  student?: { full_name: string; email: string } | null;
  complaint_assignments?: RawAssignmentRow[] | null;
}

interface RawAssignmentRow {
  assignment_id: string;
  complaint_id: string;
  staff_id: string;
  assigned_by: string;
  assigned_at: string;
  notes: string | null;
  staff?: { staff_name: string; department: string } | null;
}

function normalizeComplaints(rows: RawComplaintRow[] | null): Complaint[] {
  if (!rows) return [];
  return rows.map((row) => {
    const assignment = row.complaint_assignments?.[0] ?? null;
    return {
      complaint_id: row.complaint_id,
      student_id: row.student_id,
      category: row.category,
      description: row.description,
      status: row.status,
      submitted_at: row.submitted_at,
      updated_at: row.updated_at,
      student_name: row.student?.full_name,
      student_email: row.student?.email,
      assignment: assignment
        ? {
            assignment_id: assignment.assignment_id,
            complaint_id: assignment.complaint_id,
            staff_id: assignment.staff_id,
            assigned_by: assignment.assigned_by,
            assigned_at: assignment.assigned_at,
            notes: assignment.notes,
            staff_name: assignment.staff?.staff_name,
            staff_department: assignment.staff?.department,
          }
        : null,
    };
  });
}
