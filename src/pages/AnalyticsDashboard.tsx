import React, { useMemo } from 'react';
import { useTicketStore } from '../store/ticketStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const AnalyticsDashboard: React.FC = () => {
  const { tickets } = useTicketStore();

  const analytics = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'Open').length;
    const inProgress = tickets.filter(t => t.status === 'In Progress').length;
    const resolved = tickets.filter(t => t.status === 'Resolved').length;
    const closed = tickets.filter(t => t.status === 'Closed').length;

    const categoryCount = tickets.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.keys(categoryCount).map(key => ({
      name: key,
      value: categoryCount[key]
    }));

    const statusData = [
      { name: 'Open', value: open },
      { name: 'In Progress', value: inProgress },
      { name: 'Resolved', value: resolved },
      { name: 'Closed', value: closed },
    ];

    return { total, open, inProgress, resolved, closed, categoryData, statusData };
  }, [tickets]);

  const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];
  const STATUS_COLORS = { 'Open': '#3b82f6', 'In Progress': '#f59e0b', 'Resolved': '#10b981', 'Closed': '#6b7280' };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl mb-2">Analytics Dashboard</h1>
        <p className="text-muted">High-level overview of support performance.</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="glass-card flex flex-col justify-center items-center" style={{ padding: '2rem' }}>
          <div className="text-4xl font-bold mb-2 text-gradient">{analytics.total}</div>
          <div className="text-secondary text-sm uppercase tracking-wider">Total Tickets</div>
        </div>
        <div className="glass-card flex flex-col justify-center items-center" style={{ padding: '2rem' }}>
          <div className="text-4xl font-bold mb-2" style={{ color: STATUS_COLORS['Open'] }}>{analytics.open}</div>
          <div className="text-secondary text-sm uppercase tracking-wider">Open</div>
        </div>
        <div className="glass-card flex flex-col justify-center items-center" style={{ padding: '2rem' }}>
          <div className="text-4xl font-bold mb-2" style={{ color: STATUS_COLORS['Resolved'] }}>{analytics.resolved}</div>
          <div className="text-secondary text-sm uppercase tracking-wider">Resolved</div>
        </div>
        <div className="glass-card flex flex-col justify-center items-center" style={{ padding: '2rem' }}>
          <div className="text-4xl font-bold mb-2" style={{ color: '#10b981' }}>
            {analytics.total > 0 ? Math.round((analytics.resolved / analytics.total) * 100) : 0}%
          </div>
          <div className="text-secondary text-sm uppercase tracking-wider">Resolution Rate</div>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', height: '400px' }}>
          <h3 className="mb-6">Tickets by Category</h3>
          {analytics.total === 0 ? (
            <div className="flex justify-center items-center h-full text-muted">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={analytics.categoryData}>
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '8px' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {analytics.categoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', height: '400px' }}>
          <h3 className="mb-6">Status Distribution</h3>
          {analytics.total === 0 ? (
            <div className="flex justify-center items-center h-full text-muted">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={analytics.statusData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.statusData.filter(d => d.value > 0).map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[_entry.name as keyof typeof STATUS_COLORS]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
