import { useState } from 'react';
import { useTicketStore } from '../store/ticketStore';
import { PlusCircle, Clock, CheckCircle2, AlertCircle, XCircle, Ticket } from 'lucide-react';
import CreateTicketModal from '../components/CreateTicketModal';
import TicketDetailModal from '../components/TicketDetailModal';
import { StatusBadge, PriorityIcon, CategoryTag, Avatar, timeAgo } from '../components/JiraComponents';
import type { Ticket as TicketType } from '../types/ticket';

const MY_NAME = 'Alice Employee';

const statusIcon = (status: string) => {
  if (status === 'Open')        return <AlertCircle size={14} style={{ color: 'var(--status-todo-text)' }} />;
  if (status === 'In Progress') return <Clock size={14} style={{ color: 'var(--status-progress-text)' }} />;
  if (status === 'Resolved')    return <CheckCircle2 size={14} style={{ color: 'var(--status-resolved-text)' }} />;
  return <XCircle size={14} style={{ color: 'var(--status-closed-text)' }} />;
};

export default function EmployeeDashboard() {
  const { tickets } = useTicketStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<TicketType | null>(null);

  const myTickets = tickets.filter(t => t.createdBy === MY_NAME);
  const open      = myTickets.filter(t => t.status === 'Open').length;
  const inProg    = myTickets.filter(t => t.status === 'In Progress').length;
  const resolved  = myTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  return (
    <div className="animate-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>My Requests</h1>
          <p className="page-subtitle">Track all support tickets you have raised</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={15} />
          Create Issue
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(87,157,255,0.12)' }}>
            <Ticket size={20} style={{ color: 'var(--status-todo-text)' }} />
          </div>
          <div>
            <div className="stat-value">{myTickets.length}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(87,157,255,0.12)' }}>
            <AlertCircle size={20} style={{ color: 'var(--status-todo-text)' }} />
          </div>
          <div>
            <div className="stat-value">{open}</div>
            <div className="stat-label">Open</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(246,189,41,0.12)' }}>
            <Clock size={20} style={{ color: 'var(--status-progress-text)' }} />
          </div>
          <div>
            <div className="stat-value">{inProg}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(23,195,134,0.12)' }}>
            <CheckCircle2 size={20} style={{ color: 'var(--status-resolved-text)' }} />
          </div>
          <div>
            <div className="stat-value">{resolved}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      {myTickets.length === 0 ? (
        <div className="jira-panel empty-state">
          <Ticket size={40} />
          <p>No tickets yet — you're all clear!</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setIsModalOpen(true)}>
            <PlusCircle size={15} /> Create your first issue
          </button>
        </div>
      ) : (
        <div className="jira-panel" style={{ overflow: 'hidden' }}>
          <table className="jira-table">
            <thead>
              <tr>
                <th style={{ width: 100 }}>Key</th>
                <th>Summary</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Assignee</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {myTickets.map(ticket => (
                <tr key={ticket.id} onClick={() => setSelected(ticket)}>
                  <td>
                    <span className="ticket-id" style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-link)', fontWeight: 600 }}>
                      {ticket.id}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {statusIcon(ticket.status)}
                      <span style={{ fontWeight: 500, color: 'var(--text-heading)' }}>{ticket.title}</span>
                    </div>
                  </td>
                  <td><StatusBadge status={ticket.status} /></td>
                  <td><PriorityIcon urgency={ticket.urgency} /></td>
                  <td><CategoryTag cat={ticket.category} /></td>
                  <td>
                    {ticket.assignee
                      ? <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Avatar name={ticket.assignee} size={22} /><span style={{ fontSize: 12 }}>{ticket.assignee.split(' ')[0]}</span></div>
                      : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Unassigned</span>}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{timeAgo(ticket.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && <CreateTicketModal onClose={() => setIsModalOpen(false)} />}
      {selected && <TicketDetailModal ticket={selected} onClose={() => setSelected(null)} isAgent={false} />}
    </div>
  );
}
