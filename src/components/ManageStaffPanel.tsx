import { useState, useEffect, type FormEvent } from 'react';
import { UserPlus, Trash2, Users, AlertCircle } from 'lucide-react';
import { getAllStaff, addStaff, removeStaff } from '@/services/staffService';
import { useToast } from '@/context/ToastContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Staff } from '@/types/models';

export default function ManageStaffPanel() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // form state
  const [staffName, setStaffName] = useState('');
  const [department, setDepartment] = useState('');
  const [contact, setContact] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // delete confirmation
  const [confirmDelete, setConfirmDelete] = useState<Staff | null>(null);

  const { showToast } = useToast();

  const loadStaff = async () => {
    setLoading(true);
    try {
      const staff = await getAllStaff();
      setStaffList(staff);
    } catch {
      showToast('Failed to load staff list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const newStaff = await addStaff({ staffName, department, contact });
      showToast(`${newStaff.staff_name} added to staff.`, 'success');
      setStaffName('');
      setDepartment('');
      setContact('');
      await loadStaff();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add staff member.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (staff: Staff) => {
    try {
      await removeStaff(staff.staff_id);
      showToast(`${staff.staff_name} removed.`, 'success');
      setConfirmDelete(null);
      await loadStaff();
    } catch {
      showToast('Failed to remove staff member.', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Add staff form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-slate-600" />
          Add Staff Member
        </h3>

        {formError && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
            <input
              type="text"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              disabled={submitting}
              placeholder="John Smith"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition disabled:bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={submitting}
              placeholder="IT, Maintenance, etc."
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition disabled:bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              disabled={submitting}
              placeholder="Email or phone"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition disabled:bg-slate-50"
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? <LoadingSpinner size="sm" /> : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Add Staff
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Staff list */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            Staff Members
            <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
              {staffList.length}
            </span>
          </h3>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <LoadingSpinner label="Loading staff..." />
          </div>
        ) : staffList.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">No staff members yet. Add one above.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {staffList.map((s) => (
              <div key={s.staff_id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">
                    {s.staff_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{s.staff_name}</p>
                    <p className="text-xs text-slate-400">
                      {s.department} • {s.contact}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setConfirmDelete(s)}
                  className="text-slate-400 hover:text-red-600 transition p-1.5 rounded-md hover:bg-red-50"
                  title="Remove staff member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Remove staff member?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Are you sure you want to remove <span className="font-medium text-slate-700">{confirmDelete.staff_name}</span> from the staff list?
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
