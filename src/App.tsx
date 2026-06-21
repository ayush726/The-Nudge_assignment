
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AgentDashboard from './pages/AgentDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import { LayoutDashboard, Users, BarChart3, Bell, Check } from 'lucide-react';
import { useTicketStore } from './store/ticketStore';

import { useState } from 'react';

function Navigation() {
  const location = useLocation();
  const { notifications, markNotificationsRead } = useTicketStore();
  const [showNotifs, setShowNotifs] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const navItems = [
    { path: '/', label: 'Employee Portal', icon: <LayoutDashboard size={20} /> },
    { path: '/agent', label: 'Agent Workspace', icon: <Users size={20} /> },
    { path: '/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
  ];

  return (
    <nav className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }} className="text-gradient">
        NudgeSupport
      </div>
      <div className="flex gap-4">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              textDecoration: 'none',
              color: location.pathname === item.path ? 'var(--text-primary)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
              transition: 'all 0.2s ease',
            }}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>
      
      <div style={{ marginLeft: 'auto', position: 'relative' }}>
        <button 
          className="btn btn-secondary" 
          style={{ padding: '0.5rem', borderRadius: '50%', position: 'relative' }}
          onClick={() => {
            setShowNotifs(!showNotifs);
            if (showNotifs && unreadCount > 0) markNotificationsRead();
          }}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--accent-secondary)', color: 'white', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: 'bold' }}>
              {unreadCount}
            </span>
          )}
        </button>

        {showNotifs && (
          <div className="glass-panel animate-fade-in" style={{ position: 'absolute', right: 0, top: '120%', width: '300px', padding: '1rem', zIndex: 1000, maxHeight: '400px', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ fontSize: '1rem' }}>Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markNotificationsRead} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Check size={12}/> Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-muted" style={{ fontSize: '0.85rem', textAlign: 'center' }}>No notifications.</p>
            ) : (
              <div className="grid gap-2">
                {notifications.map(n => (
                  <div key={n.id} style={{ padding: '0.75rem', background: n.read ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.1)', borderRadius: 'var(--radius-sm)', borderLeft: n.read ? 'none' : '3px solid var(--accent-primary)' }}>
                    <p style={{ fontSize: '0.85rem', color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.message}</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(n.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="container animate-fade-in">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<EmployeeDashboard />} />
            <Route path="/agent" element={<AgentDashboard />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
