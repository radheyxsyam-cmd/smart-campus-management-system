import { useCallback, useEffect, useState } from 'react';
import { ListChecks, UserPlus, Users, BarChart3 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AllComplaintsTable from '@/components/AllComplaintsTable';
import AssignStaffModal from '@/components/AssignStaffModal';
import ManageStaffPanel from '@/components/ManageStaffPanel';
import ReportsPanel from '@/components/ReportsPanel';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getAllComplaints, updateStatus } from '@/services/complaintService';
import type { Complaint, ComplaintStatus } from '@/types/models';

type Tab = 'all-complaints' | 'assign' | 'staff' | 'reports';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>('all-complaints');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignTarget, setAssignTarget] = useState<Complaint | null>(null);

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllComplaints();
      setComplaints(data);
    } catch {
      showToast('Failed to load complaints.', 'error');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const handleAssign = (complaint: Complaint) => {
    setAssignTarget(complaint);
  };

  const handleAssigned = () => {
    loadComplaints();
  };

  const handleStatusChange = async (complaint: Complaint, newStatus: ComplaintStatus) => {
    if (complaint.status === newStatus) return;
    try {
      await updateStatus(complaint.complaint_id, newStatus, complaint.status);
      showToast(`Status updated to "${newStatus}".`, 'success');
      loadComplaints();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update status.';
      showToast(msg, 'error');
    }
  };

  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  const tabs: Array<{ id: Tab; label: string; icon: typeof ListChecks }> = [
    { id: 'all-complaints', label: 'All Complaints', icon: ListChecks },
    { id: 'assign', label: 'Assign / Update', icon: UserPlus },
    { id: 'staff', label: 'Manage Staff', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage complaints, staff assignments, and view reports.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 text-center">
            <p className="text-lg sm:text-2xl font-bold text-amber-600">{pendingCount}</p>
            <p className="text-xs text-slate-500">Pending</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 text-center">
            <p className="text-lg sm:text-2xl font-bold text-blue-600">{inProgressCount}</p>
            <p className="text-xs text-slate-500">In Progress</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 text-center">
            <p className="text-lg sm:text-2xl font-bold text-emerald-600">{resolvedCount}</p>
            <p className="text-xs text-slate-500">Resolved</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white rounded-lg border border-slate-200 p-1 overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition ${
                  tab === t.id
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div>
          {tab === 'all-complaints' && (
            <AllComplaintsTable
              complaints={complaints}
              loading={loading}
              onAssign={handleAssign}
              onStatusChange={handleStatusChange}
            />
          )}
          {tab === 'assign' && (
            <AllComplaintsTable
              complaints={complaints}
              loading={loading}
              onAssign={handleAssign}
              onStatusChange={handleStatusChange}
            />
          )}
          {tab === 'staff' && <ManageStaffPanel />}
          {tab === 'reports' && <ReportsPanel />}
        </div>
      </div>

      {/* Assign modal */}
      {assignTarget && profile && (
        <AssignStaffModal
          complaint={assignTarget}
          assignedById={profile.id}
          onClose={() => setAssignTarget(null)}
          onAssigned={handleAssigned}
        />
      )}
    </div>
  );
}
