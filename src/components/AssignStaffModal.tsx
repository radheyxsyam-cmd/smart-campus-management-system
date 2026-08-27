import { X, UserPlus, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { assignComplaint } from '@/services/complaintService';
import { getAllStaff } from '@/services/staffService';
import { useToast } from '@/context/ToastContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Complaint, Staff, ComplaintStatus } from '@/types/models';

interface AssignStaffModalProps {
  complaint: Complaint;
  assignedById: string;
  onClose: () => void;
  onAssigned: () => void;
}

export default function AssignStaffModal({
  complaint,
  assignedById,
  onClose,
  onAssigned,
}: AssignStaffModalProps) {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const staff = await getAllStaff();
        setStaffList(staff);
      } catch {
        setError('Failed to load staff list.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    setError(null);
    if (!selectedStaffId) {
      setError('Please select a staff member.');
      return;
    }
    setSubmitting(true);
    try {
      await assignComplaint(
        complaint.complaint_id,
        selectedStaffId,
        assignedById,
        notes.trim() || null,
        complaint.status as ComplaintStatus
      );
      showToast('Complaint assigned successfully. Status set to In Progress.', 'success');
      onAssigned();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to assign complaint.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isResolved = complaint.status === 'Resolved';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-slate-600" />
            Assign Complaint to Staff
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition p-1 rounded-md hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Complaint info */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-xs font-medium">
                {complaint.category}
              </span>
              {complaint.student_name && (
                <span className="text-xs text-slate-500">by {complaint.student_name}</span>
              )}
            </div>
            <p className="text-sm text-slate-600 line-clamp-3">{complaint.description}</p>
          </div>

          {isResolved && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>This complaint is already resolved and cannot be assigned.</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <LoadingSpinner label="Loading staff..." />
          ) : (
            !isResolved && (
              <>
                <div>
                  <label htmlFor="staff" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Select Staff Member
                  </label>
                  <select
                    id="staff"
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    disabled={submitting}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition disabled:bg-slate-50 bg-white"
                  >
                    <option value="">Choose a staff member...</option>
                    {staffList.map((s) => (
                      <option key={s.staff_id} value={s.staff_id}>
                        {s.staff_name} — {s.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={submitting}
                    rows={3}
                    placeholder="Add any instructions for the staff member..."
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition disabled:bg-slate-50 resize-none"
                  />
                </div>
              </>
            )
          )}
        </div>

        {/* Footer */}
        {!isResolved && !loading && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedStaffId}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-medium text-sm px-4 py-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? <LoadingSpinner size="sm" /> : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Assign
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
