import { insertComplaint, fetchComplaintsByStudent, fetchAllComplaints, updateComplaintStatus } from '@/dao/complaintDAO';
import { insertAssignment } from '@/dao/assignmentDAO';
import type { Complaint, ComplaintCategory, ComplaintStatus } from '@/types/models';

export interface NewComplaintInput {
  category: ComplaintCategory;
  description: string;
}

export function validateComplaintInput(input: NewComplaintInput): string | null {
  if (!input.category) return 'Please select a category.';
  if (!input.description.trim()) return 'Description is required.';
  if (input.description.trim().length < 10) return 'Description must be at least 10 characters long.';
  return null;
}

export async function submitComplaint(
  studentId: string,
  input: NewComplaintInput
): Promise<Complaint> {
  const validationError = validateComplaintInput(input);
  if (validationError) throw new Error(validationError);
  return insertComplaint(studentId, input.category, input.description.trim());
}

export async function getMyComplaints(studentId: string): Promise<Complaint[]> {
  return fetchComplaintsByStudent(studentId);
}

export async function getAllComplaints(): Promise<Complaint[]> {
  return fetchAllComplaints();
}

export async function updateStatus(
  complaintId: string,
  newStatus: ComplaintStatus,
  currentStatus: ComplaintStatus
): Promise<Complaint> {
  // Business rule: once Resolved, cannot revert.
  if (currentStatus === 'Resolved') {
    throw new Error('A resolved complaint cannot be moved back to Pending or In Progress.');
  }
  if (newStatus === 'Pending') {
    throw new Error('Status cannot be set back to Pending.');
  }
  return updateComplaintStatus(complaintId, newStatus);
}

export async function assignComplaint(
  complaintId: string,
  staffId: string,
  assignedBy: string,
  notes: string | null,
  currentStatus: ComplaintStatus
): Promise<void> {
  // Business rule: cannot assign a resolved complaint.
  if (currentStatus === 'Resolved') {
    throw new Error('Cannot assign a complaint that is already resolved.');
  }
  await insertAssignment(complaintId, staffId, assignedBy, notes);
  // Flip status to In Progress when assigned.
  if (currentStatus === 'Pending') {
    await updateComplaintStatus(complaintId, 'In Progress');
  }
}

export const VALID_CATEGORIES: ComplaintCategory[] = [
  'WiFi',
  'Classroom Equipment',
  'Hostel',
  'Cleanliness',
  'Electricity',
  'Plumbing',
  'Other',
];

export const VALID_STATUSES: ComplaintStatus[] = ['Pending', 'In Progress', 'Resolved'];
