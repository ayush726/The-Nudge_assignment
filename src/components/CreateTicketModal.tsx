import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTicketStore } from '../store/ticketStore';
import { aiService } from '../services/aiService';
import type { TicketCategory, TicketUrgency, Ticket } from '../types/ticket';
import { X, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const CreateTicketModal: React.FC<Props> = ({ onClose }) => {
  const { addTicket, tickets } = useTicketStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('Other');
  const [urgency, setUrgency] = useState<TicketUrgency>('Low');
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [similarTickets, setSimilarTickets] = useState<Ticket[]>([]);
  const [aiAutoCategorized, setAiAutoCategorized] = useState(false);
  const [aiError, setAiError] = useState(false);

  const descTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (description.length > 10) {
      if (descTimeout.current) clearTimeout(descTimeout.current);
      
      descTimeout.current = setTimeout(async () => {
        setIsAiLoading(true);
        setAiError(false);
        try {
          const cat = await aiService.categorizeTicket(description.trim());
          setCategory(cat);
          setAiAutoCategorized(true);

          const similar = await aiService.findSimilarTickets(description.trim(), tickets);
          setSimilarTickets(similar);
        } catch (error) {
          console.error("AI Service degraded:", error);
          setAiError(true);
          // Degrade gracefully: don't block
        } finally {
          setIsAiLoading(false);
        }
      }, 800);
    } else {
      setSimilarTickets([]);
      setAiAutoCategorized(false);
      setAiError(false);
    }
  }, [description, tickets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();
    if (!trimmedTitle || !trimmedDesc) return;

    addTicket({
      title: trimmedTitle.substring(0, 150),
      description: trimmedDesc.substring(0, 3000),
      category,
      urgency,
      status: 'Open',
      createdBy: 'Alice Employee',
    });
    onClose();
  };

  return createPortal(
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl">Raise a Support Ticket</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="text-secondary" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Title</label>
            <input 
              required
              maxLength={150}
              type="text" 
              className="input-field" 
              placeholder="Brief summary of the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-secondary" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Description</label>
            <textarea 
              required
              maxLength={3000}
              className="input-field" 
              rows={4}
              placeholder="Please describe the issue in detail. Our AI will automatically categorize it."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* AI Features Area */}
          <div style={{ minHeight: '80px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isAiLoading && (
              <div className="flex items-center gap-2 text-accent-primary" style={{ fontSize: '0.85rem' }}>
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                AI is analyzing your request...
              </div>
            )}
            
            {!isAiLoading && aiError && (
              <div className="flex items-center gap-2" style={{ color: '#ef4444', fontSize: '0.85rem' }}>
                AI assistance is currently unavailable. Please categorize manually.
              </div>
            )}

            {!isAiLoading && !aiError && similarTickets.length > 0 && (
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <div className="flex items-center gap-2 mb-2 text-accent-primary" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  <Sparkles size={16} />
                  Similar resolved tickets found. Does this solve your issue?
                </div>
                <div className="grid gap-2">
                  {similarTickets.map(st => (
                    <div key={st.id} className="flex gap-2 items-start" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <CheckCircle2 size={14} style={{ marginTop: '2px', color: 'var(--status-resolved-text)' }} />
                      <div>
                        <strong>{st.title}</strong>
                        <div style={{ opacity: 0.8 }}>{st.agentNotes || 'Resolved without notes'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <div style={{ flex: 1 }}>
              <label className="text-secondary" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Category
                {aiAutoCategorized && <span className="text-accent-primary flex items-center gap-1" style={{ fontSize: '0.75rem' }}><Sparkles size={12}/> AI Selected</span>}
              </label>
              <select className="input-field" value={category} onChange={(e) => { setCategory(e.target.value as TicketCategory); setAiAutoCategorized(false); }}>
                <option value="IT">IT Support</option>
                <option value="HR">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Admin">Administration</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div style={{ flex: 1 }}>
              <label className="text-secondary" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Urgency</label>
              <select className="input-field" value={urgency} onChange={(e) => setUrgency(e.target.value as TicketUrgency)}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!title.trim() || !description.trim() || isAiLoading}>Submit Ticket</button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default CreateTicketModal;
