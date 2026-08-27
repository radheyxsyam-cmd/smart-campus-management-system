import type { ComplaintStatus } from '@/types/models';

interface StatusBadgeProps {
  status: ComplaintStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<ComplaintStatus, string> = {
    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
    Resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  const dots: Record<ComplaintStatus, string> = {
    Pending: 'bg-amber-500',
    'In Progress': 'bg-blue-500',
    Resolved: 'bg-emerald-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
}
