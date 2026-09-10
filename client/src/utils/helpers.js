export const PRIORITY_CONFIG = {
  LOW: {
    label: 'Low',
    bg: 'bg-stone-100',
    text: 'text-stone-600',
    border: 'border-stone-200',
    dot: 'bg-stone-400'
  },
  MEDIUM: {
    label: 'Medium',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500'
  },
  HIGH: {
    label: 'High',
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
    dot: 'bg-orange-500'
  },
  URGENT: {
    label: 'Urgent',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    dot: 'bg-rose-600'
  }
};

export const STATUS_CONFIG = {
  NEW: {
    label: 'To do',
    shortLabel: 'To do',
    badgeBg: 'bg-stone-100',
    badgeText: 'text-stone-700',
    badgeBorder: 'border-stone-200',
    dot: 'bg-stone-400'
  },
  IN_PROGRESS: {
    label: 'In progress',
    shortLabel: 'In progress',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    dot: 'bg-blue-500'
  },
  BLOCKED: {
    label: 'Blocked',
    shortLabel: 'Blocked',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    dot: 'bg-amber-500'
  },
  DONE: {
    label: 'Done',
    shortLabel: 'Done',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    dot: 'bg-emerald-600'
  }
};

export const CATEGORIES = [
  'Client Request',
  'Operations',
  'Maintenance',
  'Hardware',
  'Bug Fix',
  'General'
];

export const CATEGORY_COLORS = {
  'Client Request': 'bg-stone-100 text-stone-700 border-stone-200',
  'Operations': 'bg-purple-50 text-purple-700 border-purple-200',
  'Maintenance': 'bg-amber-50 text-amber-700 border-amber-200',
  'Hardware': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Bug Fix': 'bg-rose-50 text-rose-700 border-rose-200',
  'General': 'bg-stone-100 text-stone-600 border-stone-200'
};

export function getChannelMeta(contact) {
  if (!contact) return null;
  const str = contact.toLowerCase();
  if (str.includes('whatsapp') || str.includes('wa')) {
    return { type: 'whatsapp', label: 'WhatsApp', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }
  if (str.includes('@') || str.includes('email') || str.includes('mail')) {
    return { type: 'email', label: 'Email', color: 'bg-sky-50 text-sky-700 border-sky-200' };
  }
  if (str.includes('phone') || str.includes('call') || str.includes('+') || /\d{3}[-\s]?\d{3}/.test(str)) {
    return { type: 'phone', label: 'Phone', color: 'bg-purple-50 text-purple-700 border-purple-200' };
  }
  return { type: 'portal', label: 'Web/Ticket', color: 'bg-stone-100 text-stone-600 border-stone-200' };
}

export function isTaskOverdue(task) {
  if (!task.dueDate || task.status === 'DONE') return false;
  return new Date(task.dueDate) < new Date();
}

export function isTaskStale(task) {
  if (task.status === 'DONE') return false;
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
  return new Date() - new Date(task.updatedAt) > threeDaysMs;
}

export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDueDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
