export function isInterviewStarted(interview: { startTime: string }): boolean {
  return new Date(interview.startTime) <= new Date();
}

export function getInitials(firstname?: string, lastname?: string): string {
  const first = firstname?.[0] || '';
  const last = lastname?.[0] || '';
  return (first + last).toUpperCase();
}

export function getInitialsFromName(name: string): string {
  return (name || '? ?').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateLocal(dateStr?: string | null): string {
  if (!dateStr) return '';
  // Parse YYYY-MM-DD components directly to avoid UTC timezone day-shift
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (m) {
    const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function statusClasses(status: string): string {
  const base = 'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide';
  switch (status) {
    case 'Interviewing':
      return `${base} bg-blue-500/10 text-blue-400 border border-blue-500/20`;
    case 'Screening':
      return `${base} bg-yellow-500/10 text-yellow-400 border border-yellow-500/20`;
    case 'Offer Sent':
      return `${base} bg-green-500/10 text-green-400 border border-green-500/20`;
    case 'Rejected':
      return `${base} bg-red-500/10 text-red-400 border border-red-500/20`;
    case 'Draft':
      return `${base} bg-neutral-500/10 text-neutral-400 border border-neutral-500/20`;
    default:
      return `${base} bg-neutral-500/10 text-neutral-400 border border-neutral-500/20`;
  }
}

export function getMonth(dateStr: string): string {
  return new Date(dateStr).toLocaleString('default', { month: 'short' });
}

export function getDay(dateStr: string): string {
  return new Date(dateStr).getDate().toString().padStart(2, '0');
}

export function getTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
