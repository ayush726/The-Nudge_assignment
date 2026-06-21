import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTicketStore } from '../store/ticketStore';
import { aiService } from '../services/aiService';
import type { TicketCategory, TicketUrgency, Ticket } from '../types/ticket';
import { X, Sparkles, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CategoryTag, StatusBadge } from './JiraComponents';

interface Props { onClose: () => void; }

const URGENCY_LEVELS: TicketUrgency[] = ['Low', 'Medium', 'High', 'Critical'];
const CATEGORIES: TicketCategory[] = ['IT', 'HR', 'Finance', 'Admin', 'Other'];

const URGENCY_COLOR: Record<TicketUrgency, string> = {
  Low:      '#579DFF',
  Medium:   '#F6BD29',
  High:     '#E97F33',
  Critical: '#E5493A',
};

export default function CreateTicketModal({ onClose }: Props) {
  const { addTicket, tickets } = useTicketStore();
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory]     = useState<TicketCategory>('Other');
  const [urgency, setUrgency]       = useState<TicketUrgency>('Medium');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [similarTickets, setSimilarTickets] = useState<Ticket[]>([]);
  const [aiAutoCat, setAiAutoCat]   = useState(false);
  const [aiError, setAiError]       = useState(false);
  const [titleError, setTitleError] = useState('');
  const [descError, setDescError]   = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (description.trim().length > 10) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setIsAiLoading(true);
        setAiError(false);
        try {
          const [cat, similar] = await Promise.all([
            aiService.categorizeTicket(description.trim()),
            aiService.findSimilarTickets(description.trim(), tickets),
          ]);
          setCategory(cat);
          setAiAutoCat(true);
          setSimilarTickets(similar);
        } catch {
          setAiError(true);
        } finally {
          setIsAiLoading(false);
        }
      }, 800);
    } else {
      setSimilarTickets([]);
      setAiAutoCat(false);
      setAiError(false);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [description]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    const t = title.trim(), d = description.trim();
    if (!t) { setTitleError('Summary is required.'); valid = false; }
    else if (t.length > 150) { setTitleError('Max 150 characters.'); valid = false; }
    else setTitleError('');
    if (!d) { setDescError('Description is required.'); valid = false; }
    else setDescError('');
    if (!valid) return;

    addTicket({ title: t.substring(0, 150), description: d.substring(0, 3000), category, urgency, status: 'Open', createdBy: 'Alice Employee' });
    onClose();
  };

  return createPortal(
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel animate-in" style={{ maxWidth: 580 }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: 16 }}>Create Issue</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>NudgeSupport / Internal Ticket Platform</p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Issue Type row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label className="field-label">Issue Type</label>
                <select className="input-field" defaultValue="Support Request" disabled>
                  <option>Support Request</option>
                </select>
              </div>
              <div>
                <label className="field-label">Priority</label>
                <select
                  className="input-field"
                  value={urgency}
                  onChange={e => setUrgency(e.target.value as TicketUrgency)}
                  style={{ color: URGENCY_COLOR[urgency] }}
                >
                  {URGENCY_LEVELS.map(u => (
                    <option key={u} value={u} style={{ color: URGENCY_COLOR[u] }}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="field-label">Summary *</label>
              <input
                type="text"
                className="input-field"
                maxLength={150}
                placeholder="Brief description of the issue…"
                value={title}
                onChange={e => { setTitle(e.target.value); setTitleError(''); }}
              />
              {titleError && <p style={{ marginTop: 4, fontSize: 12, color: 'var(--priority-critical)' }}>{titleError}</p>}
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>{title.length}/150</p>
            </div>

            {/* Description */}
            <div>
              <label className="field-label">Description *</label>
              <textarea
                className="input-field"
                maxLength={3000}
                rows={4}
                placeholder="Describe the issue in detail. Our AI will auto-detect the department…"
                value={description}
                onChange={e => { setDescription(e.target.value); setDescError(''); }}
              />
              {descError && <p style={{ marginTop: 4, fontSize: 12, color: 'var(--priority-critical)' }}>{descError}</p>}
            </div>

            {/* AI Panel */}
            <div style={{ minHeight: 60 }}>
              {isAiLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-link)' }}>
                  <Loader2 size={14} className="spin" /> AI is analysing…
                </div>
              )}
              {!isAiLoading && aiError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--priority-critical)' }}>
                  <AlertTriangle size={14} /> AI unavailable — please select the category manually.
                </div>
              )}
              {!isAiLoading && !aiError && similarTickets.length > 0 && (
                <div className="ai-panel">
                  <div className="ai-panel-header">
                    <Sparkles size={14} /> Similar issues found — does any of these solve your problem?
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {similarTickets.map(st => (
                      <div key={st.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13 }}>
                        <CheckCircle2 size={14} style={{ marginTop: 2, color: 'var(--status-resolved-text)', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--text-heading)' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-link)', marginRight: 6 }}>{st.id}</span>
                            {st.title}
                          </div>
                          {st.agentNotes && <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{st.agentNotes}</div>}
                          <StatusBadge status={st.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Category row */}
            <div>
              <label className="field-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Department
                {aiAutoCat && (
                  <span style={{ fontSize: 11, color: 'var(--text-link)', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500 }}>
                    <Sparkles size={10} /> AI selected
                  </span>
                )}
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => { setCategory(cat); setAiAutoCat(false); }}
                    style={{
                      padding: '5px 12px',
                      border: `1px solid ${category === cat ? 'var(--border-focus)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      background: category === cat ? 'rgba(87,157,255,0.12)' : 'var(--bg-input)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    <CategoryTag cat={cat} />
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4, borderTop: '1px solid var(--border)' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!title.trim() || !description.trim() || isAiLoading}
              >
                Create Issue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
