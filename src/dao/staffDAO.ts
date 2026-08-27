import { supabase } from '@/lib/supabaseClient';
import type { Staff } from '@/types/models';

export async function insertStaff(
  staffName: string,
  department: string,
  contact: string
): Promise<Staff> {
  const { data, error } = await supabase
    .from('staff')
    .insert({ staff_name: staffName, department, contact })
    .select('staff_id, staff_name, department, contact, is_active')
    .single();

  if (error) throw error;
  return data as Staff;
}

export async function fetchAllStaff(): Promise<Staff[]> {
  const { data, error } = await supabase
    .from('staff')
    .select('staff_id, staff_name, department, contact, is_active')
    .order('staff_name', { ascending: true });

  if (error) throw error;
  return (data as Staff[]) ?? [];
}

export async function fetchActiveStaff(): Promise<Staff[]> {
  const { data, error } = await supabase
    .from('staff')
    .select('staff_id, staff_name, department, contact, is_active')
    .eq('is_active', true)
    .order('staff_name', { ascending: true });

  if (error) throw error;
  return (data as Staff[]) ?? [];
}

export async function deleteStaff(staffId: string): Promise<void> {
  const { error } = await supabase.from('staff').delete().eq('staff_id', staffId);
  if (error) throw error;
}

export async function setStaffActive(staffId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('staff')
    .update({ is_active: isActive })
    .eq('staff_id', staffId);
  if (error) throw error;
}
