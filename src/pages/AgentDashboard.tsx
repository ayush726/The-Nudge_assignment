import { useState } from 'react';
import { useTicketStore } from '../store/ticketStore';
import { Search, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import TicketDetailModal from '../components/TicketDetailModal';
import { StatusBadge, PriorityIcon, CategoryTag, Avatar, timeAgo } from '../components/JiraComponents';
import type { Ticket, TicketStatus } from '../types/ticket';

const COLUMNS: { status: TicketStatus; label: string; color: string }[] = [
  { status: 'Open',        label: 'TO DO',       color: 'var(--status-todo-text)' },
  { status: 'In Progress', label: 'IN PROGRESS',  color: 'var(--status-progress-text)' },
  { status: 'Resolved',    label: 'RESOLVED',     color: 'var(--status-resolved-text)' },
  { status: 'Closed',      label: 'CLOSED',       color: 'var(--status-closed-text)' },
];

export default function AgentDashboard() {
  const { tickets } = useTicketStore();
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [view, setView] = useState<'board' | 'list'>('board');
  const [filterCat, setFilterCat]    = useState('All');
  const [filterPri, setFilterPri]    = useState('All');
  const [search, setSearch]          = useState('');

  const filtered = tickets.filter(t => {
    const matchCat = filterCat === 'All' || t.category === filterCat;
    const matchPri = filterPri === 'All' || t.urgency === filterPri;
    const matchSearch = [t.title, t.createdBy, t.id].some(f =>
      f.toLowerCase().includes(search.toLowerCase())
    );
    return matchCat && matchPri && matchSearch;
  });

  return (
    <div className="animate-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Agent Board</h1>
          <p className="page-subtitle">{filtered.length} issue{filtered.length !== 1 ? 's' : ''} across all departments</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn ${view === 'board' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('board')}>
            <LayoutGrid size={15} /> Board
          </button>
          <button className={`btn ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('list')}>
            <List size={15} /> List
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-wrap" style={{ flex: '0 0 240px' }}>
          <Search size={14} />
          <input
            className="input-field"
            placeholder="Search issues..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13 }}>
          <SlidersHorizontal size={14} /> Filters:
        </div>

        <select className="input-field" style={{ width: 140 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="IT">IT</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
          <option value="Admin">Admin</option>
          <option value="Other">Other</option>
        </select>

        <select className="input-field" style={{ width: 140 }} value={filterPri} onChange={e => setFilterPri(e.target.value)}>
          <option value="All">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {(filterCat !== 'All' || filterPri !== 'All' || search) && (
          <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => { setFilterCat('All'); setFilterPri('All'); setSearch(''); }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Board View */}
      {view === 'board' && (
        <div className="kanban-board">
          {COLUMNS.map(col => {
            const colTickets = filtered.filter(t => t.status === col.status);
            return (
              <div key={col.status} className="kanban-column">
                <div className="kanban-col-header">
                  <span className="kanban-col-title" style={{ color: col.color }}>{col.label}</span>
                  <span className="kanban-col-count">{colTickets.length}</span>
                </div>
                <div className="kanban-col-items">
                  {colTickets.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: '12px 0' }}>No issues</p>
                  )}
                  {colTickets.map(ticket => (
                    <div key={ticket.id} className="kanban-ticket-card" onClick={() => setSelected(ticket)}>
                      <div style={{ marginBottom: 6 }}>
                        <CategoryTag cat={ticket.category} />
                      </div>
                      <div className="kanban-ticket-title">{ticket.title}</div>
                      <div className="kanban-ticket-footer">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-link)', fontWeight: 600 }}>{ticket.id}</span>
                          <PriorityIcon urgency={ticket.urgency} />
                        </div>
                        {ticket.assignee
                          ? <Avatar name={ticket.assignee} size={22} />
                          : <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="jira-panel" style={{ overflow: 'hidden' }}>
          <table className="jira-table">
            <thead>
              <tr>
                <th style={{ width: 100 }}>Key</th>
                <th>Summary</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Reporter</th>
                <th>Assignee</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ticket => (
                <tr key={ticket.id} onClick={() => setSelected(ticket)}>
                  <td className="ticket-id" style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-link)', fontWeight: 600 }}>{ticket.id}</td>
                  <td style={{ maxWidth: 320 }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-heading)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {ticket.title}
                    </span>
                  </td>
                  <td><StatusBadge status={ticket.status} /></td>
                  <td><PriorityIcon urgency={ticket.urgency} /></td>
                  <td><CategoryTag cat={ticket.category} /></td>
                  <td style={{ fontSize: 12 }}>{ticket.createdBy.split(' ')[0]}</td>
                  <td>
                    {ticket.assignee
                      ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar name={ticket.assignee} size={22} /><span style={{ fontSize: 12 }}>{ticket.assignee.split(' ')[0]}</span></div>
                      : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Unassigned</span>}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{timeAgo(ticket.updatedAt)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No issues match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selected && <TicketDetailModal ticket={selected} onClose={() => setSelected(null)} isAgent={true} />}
    </div>
  );
}
