import { Inbox } from 'lucide-react';
import StatusBadge from './StatusBadge';
import type { Complaint } from '@/types/models';

interface MyComplaintsTableProps {
  complaints: Complaint[];
  loading: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MyComplaintsTable({ complaints, loading }: MyComplaintsTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading your complaints...</p>
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
          <Inbox className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700">No complaints yet</h3>
        <p className="text-sm text-slate-500 mt-1">
          Submit your first complaint using the form above.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left font-semibold text-slate-600 px-4 py-3">Category</th>
              <th className="text-left font-semibold text-slate-600 px-4 py-3">Description</th>
              <th className="text-left font-semibold text-slate-600 px-4 py-3">Status</th>
              <th className="text-left font-semibold text-slate-600 px-4 py-3">Assigned To</th>
              <th className="text-left font-semibold text-slate-600 px-4 py-3">Submitted</th>
              <th className="text-left font-semibold text-slate-600 px-4 py-3">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {complaints.map((c) => (
              <tr key={c.complaint_id} className="hover:bg-slate-50 transition">
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
                      <p className="font-medium text-slate-700">{c.assignment.staff_name}</p>
                      <p className="text-xs text-slate-400">{c.assignment.staff_department}</p>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs">Not yet assigned</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                  {formatDate(c.submitted_at)}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                  {formatDate(c.updated_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-slate-100">
        {complaints.map((c) => (
          <div key={c.complaint_id} className="p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                {c.category}
              </span>
              <StatusBadge status={c.status} />
            </div>
            <p className="text-sm text-slate-700 mb-2">{c.description}</p>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{formatDate(c.submitted_at)}</span>
              {c.assignment ? (
                <span className="text-slate-600">
                  Assigned: {c.assignment.staff_name}
                </span>
              ) : (
                <span>Not yet assigned</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
