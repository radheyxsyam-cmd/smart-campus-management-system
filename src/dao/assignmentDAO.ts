import { supabase } from '@/lib/supabaseClient';
import type { ComplaintAssignment } from '@/types/models';

export async function insertAssignment(
  complaintId: string,
  staffId: string,
  assignedBy: string,
  notes: string | null
): Promise<ComplaintAssignment> {
  const { data, error } = await supabase
    .from('complaint_assignments')
    .insert({
      complaint_id: complaintId,
      staff_id: staffId,
      assigned_by: assignedBy,
      notes,
    })
    .select(
      'assignment_id, complaint_id, staff_id, assigned_by, assigned_at, notes'
    )
    .single();

  if (error) throw error;
  return data as ComplaintAssignment;
}

export async function fetchAssignmentsByComplaint(
  complaintId: string
): Promise<ComplaintAssignment[]> {
  const { data, error } = await supabase
    .from('complaint_assignments')
    .select(
      `
      assignment_id, complaint_id, staff_id, assigned_by, assigned_at, notes,
      staff:staff!complaint_assignments_staff_id_fkey ( staff_name, department )
    `
    )
    .eq('complaint_id', complaintId)
    .order('assigned_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];
  return (data as unknown as Array<{ staff?: { staff_name: string; department: string } }>)
    .map((row) => ({
      assignment_id: row.assignment_id,
      complaint_id: row.complaint_id,
      staff_id: row.staff_id,
      assigned_by: row.assigned_by,
      assigned_at: row.assigned_at,
      notes: row.notes,
      staff_name: row.staff?.staff_name,
      staff_department: row.staff?.department,
    }));
}

export async function fetchResolvedCountsByStaff(): Promise<
  Array<{ staff_name: string; department: string; resolved_count: number }>
> {
  const { data, error } = await supabase.from('complaint_assignments').select(
    `
      staff_id,
      staff:staff!complaint_assignments_staff_id_fkey ( staff_name, department ),
      complaint:complaints!complaint_assignments_complaint_id_fkey ( status )
    `
  );

  if (error) throw error;
  if (!data) return [];

  type Row = {
    staff_id: string;
    staff: { staff_name: string; department: string } | null;
    complaint: { status: string } | null;
  };

  const rows = data as unknown as Row[];
  const map = new Map<string, { staff_name: string; department: string; resolved_count: number }>();

  for (const row of rows) {
    if (!row.staff || !row.complaint) continue;
    if (row.complaint.status !== 'Resolved') continue;
    const key = row.staff_id;
    const existing = map.get(key);
    if (existing) {
      existing.resolved_count += 1;
    } else {
      map.set(key, {
        staff_name: row.staff.staff_name,
        department: row.staff.department,
        resolved_count: 1,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.resolved_count - a.resolved_count);
}
