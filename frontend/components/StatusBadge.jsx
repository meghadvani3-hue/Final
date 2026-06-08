import React from 'react';

export default function StatusBadge({ status }) {
  const getStatusStyles = () => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          label: 'Pending Approval'
        };
      case 'accepted':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          label: 'Accepted'
        };
      case 'declined':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          label: 'Declined'
        };
      case 'completed':
        return {
          bg: 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400',
          label: 'Completed'
        };
      case 'active':
        return {
          bg: 'bg-companion-purple/15 border-companion-purple/50 text-companion-violet pulse-purple-border',
          label: 'Session Active'
        };
      case 'cancelled':
        return {
          bg: 'bg-zinc-500/10 border-zinc-500/20 text-zinc-500',
          label: 'Cancelled'
        };
      default:
        return {
          bg: 'bg-zinc-500/10 border-zinc-500/30 text-zinc-300',
          label: status || 'Unknown'
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${styles.bg}`}>
      {styles.label}
    </span>
  );
}
