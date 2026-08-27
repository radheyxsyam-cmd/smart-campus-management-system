import { insertStaff, fetchAllStaff, deleteStaff, setStaffActive } from '@/dao/staffDAO';
import type { Staff } from '@/types/models';

export interface NewStaffInput {
  staffName: string;
  department: string;
  contact: string;
}

export function validateStaffInput(input: NewStaffInput): string | null {
  if (!input.staffName.trim()) return 'Staff name is required.';
  if (!input.department.trim()) return 'Department is required.';
  if (!input.contact.trim()) return 'Contact information is required.';
  return null;
}

export async function addStaff(input: NewStaffInput): Promise<Staff> {
  const validationError = validateStaffInput(input);
  if (validationError) throw new Error(validationError);
  return insertStaff(input.staffName.trim(), input.department.trim(), input.contact.trim());
}

export async function getAllStaff(): Promise<Staff[]> {
  return fetchAllStaff();
}

export async function removeStaff(staffId: string): Promise<void> {
  await deleteStaff(staffId);
}

export async function toggleStaffActive(staffId: string, isActive: boolean): Promise<void> {
  await setStaffActive(staffId, isActive);
}
