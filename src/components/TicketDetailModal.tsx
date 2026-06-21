import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTicketStore } from '../store/ticketStore';
import { aiService } from '../services/aiService';
import type { Ticket, TicketStatus } from '../types/ticket';
import { X, Sparkles, Loader2, Save } from 'lucide-react';

interface Props {
  ticket: Ticket;
  onClose: () => void;
}

const TicketDetailModal: React.FC<Props> = ({ ticket, onClose }) => {
  const { updateTicketStatus, updateAgentNotes, setAiSuggestedResponse } = useTicketStore();
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [notes, setNotes] = useState(ticket.agentNotes || '');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    // If ticket is newly opened and has no AI response, generate one
    if (ticket.status === 'Open' && !ticket.aiSuggestedResponse) {
      setIsAiLoading(true);
      aiService.draftResponse(ticket).then(response => {
        setAiSuggestedResponse(ticket.id, response);
        setIsAiLoading(false);
      });
    }
  }, [ticket.id, ticket.status, ticket.aiSuggestedResponse, setAiSuggestedResponse]);

  const handleSave = () => {
    if (status !== ticket.status) updateTicketStatus(ticket.id, status);
    if (notes !== ticket.agentNotes) updateAgentNotes(ticket.id, notes);
    onClose();
  };

  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '800px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl mb-2">{ticket.title}</h2>
            <div className="flex gap-4 text-muted" style={{ fontSize: '0.85rem' }}>
              <span>ID: {ticket.id}</span>
              <span>From: {ticket.createdBy}</span>
              <span>Category: {ticket.category}</span>
              <span>Urgency: <strong style={{ color: ticket.urgency === 'Critical' ? '#ef4444' : 'inherit' }}>{ticket.urgency}</strong></span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
          {/* Left Column: Details & Notes */}
          <div className="grid gap-4">
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Description</h3>
              <p style={{ whiteSpace: 'pre-wrap' }}>{ticket.description}</p>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
              <div className="flex items-center gap-2 mb-4 text-accent-primary" style={{ fontWeight: 600 }}>
                <Sparkles size={18} />
                AI Suggested Response
              </div>
              {isAiLoading ? (
                <div className="flex items-center gap-2 text-muted">
                  <Loader2 size={16} className="animate-spin" /> Drafting response...
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <textarea 
                    className="input-field" 
                    rows={6}
                    value={ticket.aiSuggestedResponse || ''}
                    readOnly
                    style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--text-primary)' }}
                  />
                  <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => navigator.clipboard.writeText(ticket.aiSuggestedResponse || '')}>
                      Copy to Clipboard
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-secondary" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Internal Agent Notes</label>
              <textarea 
                className="input-field" 
                rows={3}
                placeholder="Add private notes for other agents..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Right Column: Actions */}
          <div className="grid gap-4" style={{ alignContent: 'start' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <label className="text-secondary" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Status</label>
              <select className="input-field mb-4" value={status} onChange={(e) => setStatus(e.target.value as TicketStatus)}>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
              
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default TicketDetailModal;
