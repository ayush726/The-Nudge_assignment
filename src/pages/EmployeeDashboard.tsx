import React, { useState } from 'react';
import { useTicketStore } from '../store/ticketStore';
import { PlusCircle, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import CreateTicketModal from '../components/CreateTicketModal';

const EmployeeDashboard: React.FC = () => {
  const { tickets } = useTicketStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter only tickets created by 'Alice Employee' (mocking a logged-in user)
  const myTickets = tickets.filter(t => t.createdBy === 'Alice Employee');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <AlertCircle size={16} />;
      case 'In Progress': return <Clock size={16} />;
      case 'Resolved': return <CheckCircle2 size={16} />;
      default: return <CheckCircle2 size={16} />;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl mb-2">My Tickets</h1>
          <p className="text-muted">Track and manage your support requests.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <PlusCircle size={18} />
          Raise Ticket
        </button>
      </div>

      <div className="grid">
        {myTickets.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <p className="text-muted">You have no active tickets. Great!</p>
          </div>
        ) : (
          myTickets.map(ticket => (
            <div key={ticket.id} className="glass-card" style={{ padding: '1.5rem' }}>
              <div className="flex justify-between items-center mb-4">
                <h3 style={{ fontSize: '1.1rem' }}>{ticket.title}</h3>
                <span className={`status-badge ${ticket.status.toLowerCase().replace(' ', '')}`}>
                  {getStatusIcon(ticket.status)}
                  <span style={{ marginLeft: '0.25rem' }}>{ticket.status}</span>
                </span>
              </div>
              <p className="text-secondary" style={{ marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {ticket.description}
              </p>
              <div className="flex gap-4 text-muted" style={{ fontSize: '0.85rem' }}>
                <span><strong>Category:</strong> {ticket.category}</span>
                <span><strong>Urgency:</strong> {ticket.urgency}</span>
                <span><strong>Updated:</strong> {new Date(ticket.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && <CreateTicketModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default EmployeeDashboard;
