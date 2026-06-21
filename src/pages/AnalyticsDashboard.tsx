import { useMemo } from 'react';
import { useTicketStore } from '../store/ticketStore';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from 'recharts';
import { TrendingUp, Ticket, CheckCircle2, Clock } from 'lucide-react';

const CAT_COLORS: Record<string, string> = {
  IT: '#579DFF', HR: '#998DD9', Finance: '#17C386', Admin: '#F6BD29', Other: '#8C9BAB'
};
const STATUS_COLORS: Record<string, string> = {
  'Open': '#579DFF', 'In Progress': '#F6BD29', 'Resolved': '#17C386', 'Closed': '#8C9BAB'
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ fontSize: 13, fontWeight: 600, color: p.fill ?? p.stroke }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { tickets } = useTicketStore();

  const stats = useMemo(() => {
    const total    = tickets.length;
    const open     = tickets.filter(t => t.status === 'Open').length;
    const inProg   = tickets.filter(t => t.status === 'In Progress').length;
    const resolved = tickets.filter(t => t.status === 'Resolved').length;
    const closed   = tickets.filter(t => t.status === 'Closed').length;
    const resRate  = total > 0 ? Math.round((resolved + closed) / total * 100) : 0;

    const byCategory = Object.entries(
      tickets.reduce((acc, t) => { acc[t.category] = (acc[t.category] ?? 0) + 1; return acc; }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value }));

    const byStatus = [
      { name: 'Open', value: open },
      { name: 'In Progress', value: inProg },
      { name: 'Resolved', value: resolved },
      { name: 'Closed', value: closed },
    ].filter(d => d.value > 0);

    const byPriority = ['Critical', 'High', 'Medium', 'Low'].map(p => ({
      name: p,
      value: tickets.filter(t => t.urgency === p).length,
    })).filter(d => d.value > 0);

    // Fake trend (last 7 days) from createdAt
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days[d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })] = 0;
    }
    tickets.forEach(t => {
      const d = new Date(t.createdAt);
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      if (label in days) days[label]++;
    });
    const trend = Object.entries(days).map(([name, value]) => ({ name, value }));

    return { total, open, inProg, resolved, closed, resRate, byCategory, byStatus, byPriority, trend };
  }, [tickets]);

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p className="page-subtitle">Ticket metrics and support health overview</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="stats-row">
        {[
          { label: 'Total Issues', value: stats.total, icon: <Ticket size={20} />, color: '#579DFF', bg: 'rgba(87,157,255,0.12)' },
          { label: 'Open', value: stats.open, icon: <Clock size={20} />, color: '#579DFF', bg: 'rgba(87,157,255,0.12)' },
          { label: 'In Progress', value: stats.inProg, icon: <TrendingUp size={20} />, color: '#F6BD29', bg: 'rgba(246,189,41,0.12)' },
          { label: 'Resolved', value: stats.resolved + stats.closed, icon: <CheckCircle2 size={20} />, color: '#17C386', bg: 'rgba(23,195,134,0.12)' },
          { label: 'Resolution Rate', value: `${stats.resRate}%`, icon: <TrendingUp size={20} />, color: '#17C386', bg: 'rgba(23,195,134,0.12)' },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className="stat-icon-wrap" style={{ background: k.bg }}>
              <span style={{ color: k.color }}>{k.icon}</span>
            </div>
            <div>
              <div className="stat-value" style={{ color: k.color }}>{k.value}</div>
              <div className="stat-label">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Ticket Volume Trend */}
        <div className="jira-panel" style={{ padding: '20px 20px 10px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: 'var(--text-heading)' }}>Ticket Volume – Last 7 Days</p>
          {stats.total === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 13 }}>No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(166,197,226,0.08)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="value" name="Issues" stroke="#579DFF" strokeWidth={2} dot={{ fill: '#579DFF', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Pie */}
        <div className="jira-panel" style={{ padding: '20px 20px 10px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: 'var(--text-heading)' }}>Status Distribution</p>
          {stats.total === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 13 }}>No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stats.byStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {stats.byStatus.map((e, i) => <Cell key={i} fill={STATUS_COLORS[e.name] ?? '#ccc'} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* By Category */}
        <div className="jira-panel" style={{ padding: '20px 20px 10px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: 'var(--text-heading)' }}>Issues by Department</p>
          {stats.total === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 13 }}>No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.byCategory} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Issues" radius={[4, 4, 0, 0]}>
                  {stats.byCategory.map((e, i) => <Cell key={i} fill={CAT_COLORS[e.name] ?? '#579DFF'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* By Priority */}
        <div className="jira-panel" style={{ padding: '20px 20px 10px' }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: 'var(--text-heading)' }}>Issues by Priority</p>
          {stats.total === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 13 }}>No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.byPriority} barSize={28} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Issues" radius={[0, 4, 4, 0]}>
                  {stats.byPriority.map((e, i) => {
                    const colors: Record<string, string> = { Critical: '#E5493A', High: '#E97F33', Medium: '#F6BD29', Low: '#579DFF' };
                    return <Cell key={i} fill={colors[e.name] ?? '#579DFF'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
