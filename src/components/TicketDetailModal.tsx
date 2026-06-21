import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTicketStore, AGENT_NAMES } from '../store/ticketStore';
import { aiService } from '../services/aiService';
import type { Ticket, TicketStatus } from '../types/ticket';
import {
  X, Sparkles, Loader2, Save, MessageSquare, ChevronDown, UserCircle, Copy, Check
} from 'lucide-react';
import { StatusBadge, PriorityIcon, CategoryTag, Avatar, timeAgo } from './JiraComponents';

interface Props {
  ticket: Ticket;
  onClose: () => void;
  isAgent: boolean;
}

const VALID_NEXT: Record<TicketStatus, TicketStatus[]> = {
  'Open':        ['In Progress'],
  'In Progress': ['Resolved'],
  'Resolved':    ['Closed', 'In Progress'],
  'Closed':      [],
};

export default function TicketDetailModal({ ticket, onClose, isAgent }: Props) {
  const { updateTicketStatus, updateAgentNotes, setAiSuggestedResponse, assignTicket, addComment, tickets } = useTicketStore();

  // Always grab the latest ticket from the store to avoid stale props
  const live = tickets.find(t => t.id === ticket.id) ?? ticket;

  const [status, setStatus]       = useState<TicketStatus>(live.status);
  const [notes, setNotes]         = useState(live.agentNotes ?? '');
  const [newComment, setNewComment] = useState('');
  const [copied, setCopied]       = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Generate AI response once when opened
  useEffect(() => {
    if (isAgent && !live.aiSuggestedResponse) {
      setIsAiLoading(true);
      aiService.draftResponse(live)
        .then(res => { setAiSuggestedResponse(live.id, res); })
        .catch(() => {})
        .finally(() => setIsAiLoading(false));
    }
  }, [live.id]);

  const handleSave = () => {
    if (status !== live.status) updateTicketStatus(live.id, status);
    if (notes !== live.agentNotes) updateAgentNotes(live.id, notes);
    onClose();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(live.aiSuggestedResponse ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleComment = () => {
    if (!newComment.trim()) return;
    addComment(live.id, {
      author: isAgent ? 'Support Agent' : 'Alice Employee',
      text: newComment.trim(),
      isAgent,
    });
    setNewComment('');
  };

  const allowedNext = VALID_NEXT[live.status];

  return createPortal(
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel animate-in" style={{ maxWidth: 860 }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: 'var(--text-link)' }}>{live.id}</span>
            <CategoryTag cat={live.category} />
            <StatusBadge status={live.status} />
          </div>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, lineHeight: 1.4 }}>{live.title}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 24 }}>
            {/* Left: Main content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Description */}
              <section>
                <div className="section-heading">Description</div>
                <div style={{ background: 'var(--bg-surface, #22272B)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 14px', fontSize: 13.5, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                  {live.description}
                </div>
              </section>

              {/* AI Suggested Response (Agent only) */}
              {isAgent && (
                <section>
                  <div className="ai-panel">
                    <div className="ai-panel-header">
                      <Sparkles size={15} />
                      AI Suggested First Response
                    </div>
                    {isAiLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
                        <Loader2 size={15} className="spin" /> Drafting response...
                      </div>
                    ) : (
                      <div style={{ position: 'relative' }}>
                        <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                          {live.aiSuggestedResponse ?? '—'}
                        </div>
                        <button
                          className="btn btn-secondary"
                          style={{ marginTop: 10, fontSize: 12, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}
                          onClick={handleCopy}
                        >
                          {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy response</>}
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Comments */}
              <section>
                <div className="section-heading" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MessageSquare size={13} /> Comments ({(live.comments ?? []).length})
                </div>

                <div style={{ marginBottom: 14 }}>
                  {(live.comments ?? []).length === 0 && (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }}>No comments yet.</p>
                  )}
                  {(live.comments ?? []).map(c => (
                    <div key={c.id} className="comment-item">
                      <Avatar name={c.author} size={28} />
                      <div className="comment-body">
                        <div className="comment-meta">
                          <span className="comment-author">{c.author}</span>
                          {c.isAgent && (
                            <span style={{ fontSize: 11, background: 'rgba(87,157,255,0.15)', color: 'var(--text-link)', padding: '1px 6px', borderRadius: 3, fontWeight: 600 }}>
                              Agent
                            </span>
                          )}
                          <span className="comment-time">{timeAgo(c.timestamp)}</span>
                        </div>
                        <p className="comment-text">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add comment box */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Avatar name={isAgent ? 'Support Agent' : 'Alice Employee'} size={28} />
                  <div style={{ flex: 1 }}>
                    <textarea
                      className="input-field"
                      rows={2}
                      placeholder="Add a comment…"
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleComment(); }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                      <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={handleComment} disabled={!newComment.trim()}>
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right: Details panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Status transition */}
              {isAgent && (
                <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 14 }}>
                  <div className="section-heading">Status</div>
                  <div style={{ marginBottom: 10 }}>
                    <StatusBadge status={live.status} />
                  </div>
                  {allowedNext.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {allowedNext.map(next => (
                        <button
                          key={next}
                          className="btn btn-secondary"
                          style={{ width: '100%', justifyContent: 'flex-start', fontSize: 12 }}
                          onClick={() => { updateTicketStatus(live.id, next); setStatus(next); }}
                        >
                          <ChevronDown size={13} />
                          Move to: {next}
                        </button>
                      ))}
                    </div>
                  )}
                  {allowedNext.length === 0 && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No further transitions available.</p>
                  )}
                </div>
              )}

              {/* Details */}
              <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="section-heading">Details</div>

                <div>
                  <div className="field-label">Priority</div>
                  <PriorityIcon urgency={live.urgency} />
                </div>

                <div>
                  <div className="field-label">Category</div>
                  <CategoryTag cat={live.category} />
                </div>

                <div>
                  <div className="field-label">Reporter</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 4 }}>
                    <Avatar name={live.createdBy} size={22} />
                    <span style={{ fontSize: 13 }}>{live.createdBy}</span>
                  </div>
                </div>

                <div>
                  <div className="field-label">Assignee</div>
                  {live.assignee ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 4 }}>
                      <Avatar name={live.assignee} size={22} />
                      <span style={{ fontSize: 13 }}>{live.assignee}</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                      <UserCircle size={16} /> Unassigned
                    </div>
                  )}
                  {isAgent && (
                    <select
                      className="input-field"
                      style={{ marginTop: 8, fontSize: 12 }}
                      value={live.assignee ?? ''}
                      onChange={e => assignTicket(live.id, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {AGENT_NAMES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  )}
                </div>

                <div>
                  <div className="field-label">Created</div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(live.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>

                <div>
                  <div className="field-label">Updated</div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(live.updatedAt)}</span>
                </div>
              </div>

              {/* Agent Notes */}
              {isAgent && (
                <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 14 }}>
                  <div className="section-heading">Internal Notes</div>
                  <textarea
                    className="input-field"
                    rows={3}
                    placeholder="Private notes visible to agents only…"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    style={{ fontSize: 12 }}
                  />
                  <button className="btn btn-primary" style={{ marginTop: 8, width: '100%', fontSize: 12 }} onClick={handleSave}>
                    <Save size={13} /> Save Notes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
