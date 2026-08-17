import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({
  size = 'md',
  label,
}: {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  return (
    <div className="flex items-center justify-center gap-2 text-slate-500">
      <Loader2 className={`${sizeClass} animate-spin`} />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
