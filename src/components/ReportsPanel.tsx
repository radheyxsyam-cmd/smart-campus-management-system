import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, ClipboardList } from 'lucide-react';
import { getReportData, type ReportData } from '@/services/reportService';
import { useToast } from '@/context/ToastContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-500',
  'In Progress': 'bg-blue-500',
  Resolved: 'bg-emerald-500',
};

const CATEGORY_COLORS: string[] = [
  'bg-slate-700',
  'bg-slate-600',
  'bg-slate-500',
  'bg-slate-400',
  'bg-slate-300',
  'bg-blue-500',
  'bg-blue-400',
];

export default function ReportsPanel() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const report = await getReportData();
        setData(report);
      } catch {
        showToast('Failed to load reports.', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [showToast]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 flex items-center justify-center">
        <LoadingSpinner label="Loading reports..." />
      </div>
    );
  }

  if (!data || data.total === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
          <BarChart3 className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700">No data available</h3>
        <p className="text-sm text-slate-500 mt-1">Reports will appear once complaints are submitted.</p>
      </div>
    );
  }

  const maxStatusCount = Math.max(...data.statusCounts.map((s) => s.count), 1);
  const maxCategoryCount = Math.max(...data.categoryCounts.map((c) => c.count), 1);
  const maxStaffCount = Math.max(...data.staffResolvedCounts.map((s) => s.resolved_count), 1);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="w-4 h-4 text-slate-500" />
            <p className="text-xs font-medium text-slate-500">Total Complaints</p>
          </div>
          <p className="text-2xl font-bold text-slate-800">{data.total}</p>
        </div>
        {data.statusCounts.map((s) => (
          <div key={s.status} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              <p className="text-xs font-medium text-slate-500">{s.status}</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{s.count}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Complaints by Status</h3>
          <div className="space-y-3">
            {data.statusCounts.map((s) => (
              <div key={s.status}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-600">{s.status}</span>
                  <span className="text-xs font-bold text-slate-700">{s.count}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${STATUS_COLORS[s.status] ?? 'bg-slate-500'}`}
                    style={{ width: `${(s.count / maxStatusCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Complaints by Category</h3>
          <div className="space-y-3">
            {data.categoryCounts.map((c, idx) => (
              <div key={c.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-600">{c.category}</span>
                  <span className="text-xs font-bold text-slate-700">{c.count}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}`}
                    style={{ width: `${(c.count / maxCategoryCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resolved per staff */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            Resolved Complaints per Staff Member
          </h3>
        </div>
        {data.staffResolvedCounts.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-slate-500">No resolved complaints assigned to staff yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.staffResolvedCounts.map((s) => (
              <div key={`${s.staff_name}-${s.department}`} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-sm font-medium text-slate-700">{s.staff_name}</span>
                    <span className="text-xs text-slate-400 ml-2">{s.department}</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">{s.resolved_count} resolved</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(s.resolved_count / maxStaffCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
