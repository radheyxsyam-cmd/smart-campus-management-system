import { useState, useMemo } from 'react';
import { Inbox, UserPlus, Filter } from 'lucide-react';
import StatusBadge from './StatusBadge';
import type { Complaint, ComplaintStatus, ComplaintCategory } from '@/types/models';

interface AllComplaintsTableProps {
  complaints: Complaint[];
  loading: boolean;
  onAssign: (complaint: Complaint) => void;
  onStatusChange: (complaint: Complaint, newStatus: ComplaintStatus) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const STATUS_OPTIONS: ComplaintStatus[] = ['Pending', 'In Progress', 'Resolved'];

export default function AllComplaintsTable({
  complaints,
  loading,
  onAssign,
  onStatusChange,
}: AllComplaintsTableProps) {
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'All'>('All');

  const categories = useMemo(() => {
    const set = new Set(complaints.map((c) => c.category));
    return Array.from(set).sort();
  }, [complaints]);

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
      return true;
    });
  }, [complaints, statusFilter, categoryFilter]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading all complaints...</p>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
          <Inbox className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700">No complaints submitted</h3>
        <p className="text-sm text-slate-500 mt-1">Student complaints will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
          <Filter className="w-4 h-4" />
          Filters:
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | 'All')}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
          >
            <option value="All">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ComplaintCategory | 'All')}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
          >
            <option value="All">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        {(statusFilter !== 'All' || categoryFilter !== 'All') && (
          <button
            onClick={() => { setStatusFilter('All'); setCategoryFilter('All'); }}
            className="text-xs text-slate-500 hover:text-slate-700 underline"
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto text-xs text-slate-400">
          {filtered.length} of {complaints.length} complaints
        </span>
      </div>

      {/* Desktop table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Student</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Category</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Description</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Status</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Assigned To</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Date</th>
                <th className="text-left font-semibold text-slate-600 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-sm">
                    No complaints match these filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.complaint_id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">{c.student_name ?? 'Unknown'}</p>
                      <p className="text-xs text-slate-400">{c.student_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs">
                      <p className="line-clamp-2">{c.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {c.assignment ? (
                        <div>
                          <p className="font-medium text-slate-700 text-xs">{c.assignment.staff_name}</p>
                          <p className="text-xs text-slate-400">{c.assignment.staff_department}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {formatDate(c.submitted_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onAssign(c)}
                          disabled={c.status === 'Resolved'}
                          className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <UserPlus className="w-3.5 h-3.5 inline mr-0.5" />
                          Assign
                        </button>
                        <select
                          value={c.status}
                          onChange={(e) => onStatusChange(c, e.target.value as ComplaintStatus)}
                          disabled={c.status === 'Resolved'}
                          className="text-xs px-2 py-1 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile/tablet cards */}
        <div className="lg:hidden divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No complaints match these filters.
            </div>
          ) : (
            filtered.map((c) => (
              <div key={c.complaint_id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-medium text-slate-700 text-sm">{c.student_name ?? 'Unknown'}</p>
                    <p className="text-xs text-slate-400">{c.student_email}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                    {c.category}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-2 line-clamp-2">{c.description}</p>
                <div className="text-xs text-slate-400 mb-3">
                  {c.assignment ? (
                    <span>Assigned: {c.assignment.staff_name} ({c.assignment.staff_department})</span>
                  ) : (
                    <span>Unassigned</span>
                  )}
                  <span className="mx-1">•</span>
                  {formatDate(c.submitted_at)}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAssign(c)}
                    disabled={c.status === 'Resolved'}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="w-3.5 h-3.5 inline mr-0.5" />
                    Assign
                  </button>
                  <select
                    value={c.status}
                    onChange={(e) => onStatusChange(c, e.target.value as ComplaintStatus)}
                    disabled={c.status === 'Resolved'}
                    className="text-xs px-2.5 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
