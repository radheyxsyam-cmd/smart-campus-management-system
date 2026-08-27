import { supabase } from '@/lib/supabaseClient';
import { fetchResolvedCountsByStaff } from '@/dao/assignmentDAO';

export interface StatusCount {
  status: string;
  count: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface StaffResolvedCount {
  staff_name: string;
  department: string;
  resolved_count: number;
}

export interface ReportData {
  statusCounts: StatusCount[];
  categoryCounts: CategoryCount[];
  staffResolvedCounts: StaffResolvedCount[];
  total: number;
}

export async function getReportData(): Promise<ReportData> {
  const { data, error } = await supabase
    .from('complaints')
    .select('status, category');

  if (error) throw error;

  const rows = (data ?? []) as Array<{ status: string; category: string }>;

  // Count by status
  const statusMap = new Map<string, number>();
  for (const row of rows) {
    statusMap.set(row.status, (statusMap.get(row.status) ?? 0) + 1);
  }

  // Count by category
  const categoryMap = new Map<string, number>();
  for (const row of rows) {
    categoryMap.set(row.category, (categoryMap.get(row.category) ?? 0) + 1);
  }

  // Resolved per staff
  const staffResolvedCounts = await fetchResolvedCountsByStaff();

  return {
    statusCounts: Array.from(statusMap.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count),
    categoryCounts: Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count),
    staffResolvedCounts,
    total: rows.length,
  };
}
