import type { TicketUrgency, TicketCategory } from '../types/ticket';

/** Returns the colour class for priority icon */
export function priorityClass(urgency: TicketUrgency): string {
  switch (urgency) {
    case 'Critical': return 'critical';
    case 'High':     return 'high';
    case 'Medium':   return 'medium';
    case 'Low':      return 'low';
    default:         return 'low';
  }
}

/** Returns SVG path for priority arrow */
export function PriorityIcon({ urgency }: { urgency: TicketUrgency }) {
  const cls = `priority-icon ${priorityClass(urgency)}`;
  const arrows: Record<TicketUrgency, string> = {
    Critical: '↑↑',
    High:     '↑',
    Medium:   '→',
    Low:      '↓',
  };
  return (
    <span className={cls} title={urgency}>
      <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '-1px' }}>{arrows[urgency]}</span>
      {urgency}
    </span>
  );
}

export function CategoryTag({ cat }: { cat: TicketCategory }) {
  return <span className={`cat-tag ${cat}`}>{cat}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const cls = status.toLowerCase().replace(' ', '');
  return <span className={`status-badge ${cls}`}>{status}</span>;
}

export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <span
      className="avatar"
      title={name}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `hsl(${hue}, 55%, 38%)`,
      }}
    >
      {initials}
    </span>
  );
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
