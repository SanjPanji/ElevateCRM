import { type MeetingStatus } from '@/types';

const statusConfig: Record<MeetingStatus, { label: string; color: string; bgColor: string }> = {
  not_scheduled: { label: 'Not Scheduled', color: 'text-gray-800', bgColor: 'bg-gray-100' },
  scheduled: { label: 'Scheduled', color: 'text-orange-800', bgColor: 'bg-orange-100' },
  completed: { label: 'Completed', color: 'text-green-800', bgColor: 'bg-green-100' },
};

interface LeadStatusBadgeProps {
  status: MeetingStatus;
  className?: string;
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bgColor} ${config.color} ${className || ''}`}>
      {config.label}
    </span>
  );
}
