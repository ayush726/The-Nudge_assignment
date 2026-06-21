import React, { useState } from 'react';
import { useTicketStore } from '../store/ticketStore';
import type { Ticket } from '../types/ticket';
import { Search } from 'lucide-react';
import TicketDetailModal from '../components/TicketDetailModal';

const AgentDashboard: React.FC = () => {
  const { tickets } = useTicketStore();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTickets = tickets.filter(t => {
    const matchCat = filterCategory === 'All' || t.category === filterCategory;
    const matchStatus = filterStatus === 'All' || t.status === filterStatus;
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.createdBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl mb-2">Agent Workspace</h1>
          <p className="text-muted">Manage and resolve internal support tickets.</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search size={16} className="text-muted" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search tickets..." 
              style={{ paddingLeft: '2.5rem', width: '250px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select className="input-field" style={{ width: '150px' }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="All">All Categories</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Admin">Admin</option>
          </select>

          <select className="input-field" style={{ width: '150px' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>ID</th>
              <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Title</th>
              <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>From</th>
              <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Category</th>
              <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Updated</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map(ticket => (
              <tr 
                key={ticket.id} 
                style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => setSelectedTicket(ticket)}
              >
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{ticket.id}</td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{ticket.title}</td>
                <td style={{ padding: '1rem' }}>{ticket.createdBy}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
                    {ticket.category}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span className={`status-badge ${ticket.status.toLowerCase().replace(' ', '')}`}>
                    {ticket.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                  {new Date(ticket.updatedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {filteredTickets.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No tickets found matching the filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedTicket && <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />}
    </div>
  );
};

export default AgentDashboard;
