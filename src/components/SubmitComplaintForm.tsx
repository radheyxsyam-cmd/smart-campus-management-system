import { useState, type FormEvent } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import { submitComplaint, VALID_CATEGORIES } from '@/services/complaintService';
import { useToast } from '@/context/ToastContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Complaint, ComplaintCategory } from '@/types/models';

interface SubmitComplaintFormProps {
  studentId: string;
  onSubmitted: (complaint: Complaint) => void;
}

export default function SubmitComplaintForm({ studentId, onSubmitted }: SubmitComplaintFormProps) {
  const [category, setCategory] = useState<ComplaintCategory | ''>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!category) {
      setError('Please select a category.');
      return;
    }
    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters long.');
      return;
    }

    setLoading(true);
    try {
      const complaint = await submitComplaint(studentId, {
        category: category as ComplaintCategory,
        description,
      });
      showToast('Complaint submitted successfully!', 'success');
      setCategory('');
      setDescription('');
      onSubmitted(complaint);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit complaint.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Send className="w-4 h-4 text-blue-600" />
        Submit a New Complaint
      </h3>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1.5">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
            disabled={loading}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-slate-50 bg-white"
          >
            <option value="">Select a category...</option>
            {VALID_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            rows={4}
            placeholder="Describe the issue in detail (at least 10 characters)..."
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-slate-50 resize-none"
          />
          <p className="text-xs text-slate-400 mt-1">{description.trim().length} characters</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? <LoadingSpinner size="sm" /> : (
            <>
              <Send className="w-4 h-4" />
              Submit Complaint
            </>
          )}
        </button>
      </form>
    </div>
  );
}
