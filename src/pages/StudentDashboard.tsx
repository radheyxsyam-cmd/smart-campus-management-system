import { useCallback, useEffect, useState } from 'react';
import { PlusCircle, ListChecks } from 'lucide-react';
import Navbar from '@/components/Navbar';
import SubmitComplaintForm from '@/components/SubmitComplaintForm';
import MyComplaintsTable from '@/components/MyComplaintsTable';
import { useAuth } from '@/context/AuthContext';
import { getMyComplaints } from '@/services/complaintService';
import type { Complaint } from '@/types/models';

type Tab = 'submit' | 'my-complaints';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<Tab>('submit');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const loadComplaints = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const data = await getMyComplaints(profile.id);
      setComplaints(data);
    } catch {
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const handleSubmitted = (_complaint: Complaint) => {
    loadComplaints();
    setTab('my-complaints');
  };

  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome + stats */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Welcome, {profile?.full_name}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Submit complaints and track their progress.
          </p>
        </div>

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
        <div className="flex gap-1 mb-4 bg-white rounded-lg border border-slate-200 p-1 w-full sm:w-auto sm:inline-flex">
          <button
            onClick={() => setTab('submit')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition ${
              tab === 'submit'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Submit Complaint
          </button>
          <button
            onClick={() => setTab('my-complaints')}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition ${
              tab === 'my-complaints'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            My Complaints
            {complaints.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">
                {complaints.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab content */}
        <div>
          {tab === 'submit' && profile && (
            <SubmitComplaintForm studentId={profile.id} onSubmitted={handleSubmitted} />
          )}
          {tab === 'my-complaints' && (
            <MyComplaintsTable complaints={complaints} loading={loading} />
          )}
        </div>
      </div>
    </div>
  );
}
