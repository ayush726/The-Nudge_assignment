import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { LayoutGrid, Users, BarChart2, Ticket, Bell, Check, ChevronRight } from 'lucide-react';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AgentDashboard from './pages/AgentDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import { useTicketStore } from './store/ticketStore';
import { Avatar, timeAgo } from './components/JiraComponents';

const NAV_ITEMS = [
  { path: '/',          label: 'My Requests',      icon: <Ticket size={16} /> },
  { path: '/agent',     label: 'Board',            icon: <LayoutGrid size={16} /> },
  { path: '/analytics', label: 'Reports',          icon: <BarChart2 size={16} /> },
];

function Sidebar() {
  const location = useLocation();
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">IT</div>
        <div>
          <div className="sidebar-logo-text">NudgeSupport</div>
          <div className="sidebar-logo-sub">Internal Ticket Platform</div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding: '12px 0' }}>
        <div className="sidebar-section-label">Project</div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <div className="sidebar-nav-item" style={{ cursor: 'default', opacity: 0.6 }}>
          <Users size={16} />
          Team Settings
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  const location = useLocation();
  const { notifications, markNotificationsRead } = useTicketStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  const pageLabel = NAV_ITEMS.find(n => n.path === location.pathname)?.label ?? 'Page';

  return (
    <header className="topbar">
      <div className="topbar-breadcrumb">
        <span>NudgeSupport</span>
        <ChevronRight size={14} />
        <span className="page-name">{pageLabel}</span>
      </div>

      <div className="topbar-right">
        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-icon"
            style={{ position: 'relative' }}
            onClick={() => {
              setShowNotifs(v => !v);
              if (!showNotifs && unread > 0) markNotificationsRead();
            }}
          >
            <Bell size={18} />
            {unread > 0 && <span className="notif-badge">{unread}</span>}
          </button>

          {showNotifs && (
            <div className="notif-dropdown animate-in">
              <div className="notif-header">
                <span style={{ fontWeight: 600, fontSize: '13px' }}>Notifications</span>
                {unread > 0 && (
                  <button className="btn-ghost" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: 4 }} onClick={markNotificationsRead}>
                    <Check size={12} /> Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <p style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    All caught up!
                  </p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-subtle)',
                        background: n.read ? 'transparent' : 'rgba(87,157,255,0.06)',
                        borderLeft: n.read ? '3px solid transparent' : '3px solid var(--jira-blue-hover)',
                      }}
                    >
                      <p style={{ fontSize: '13px', color: n.read ? 'var(--text-muted)' : 'var(--text-primary)' }}>{n.message}</p>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{timeAgo(n.timestamp)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <Avatar name="Alice Employee" size={30} />
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <div className="main-content">
          <TopBar />
          <div className="page-body animate-in">
            <Routes>
              <Route path="/"          element={<EmployeeDashboard />} />
              <Route path="/agent"     element={<AgentDashboard />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
