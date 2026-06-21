import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Ticket, TicketStatus, Comment } from '../types/ticket';

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  timestamp: string;
}

interface TicketState {
  tickets: Ticket[];
  notifications: Notification[];
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => void;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  updateAgentNotes: (id: string, notes: string) => void;
  setAiSuggestedResponse: (id: string, response: string) => void;
  assignTicket: (id: string, assignee: string) => void;
  addComment: (ticketId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  markNotificationsRead: () => void;
}

const AGENTS = ['Raj Kumar', 'Priya Singh', 'Dev Patel', 'Sneha Iyer'];

const initialTickets: Ticket[] = [
  {
    id: 'ITP-1',
    title: 'Monitor flickering and turns off randomly',
    description: 'My external monitor keeps flickering every 5 minutes and sometimes goes completely black. I have to unplug and replug the HDMI cable to get it back. This started after the Windows update last week.',
    category: 'IT',
    urgency: 'Medium',
    status: 'In Progress',
    createdBy: 'Alice Employee',
    assignee: 'Raj Kumar',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    aiSuggestedResponse: 'Hello Alice, it sounds like there might be an issue with either the HDMI cable or the monitor driver. Have you tried using a different HDMI port or cable? Also, please try rolling back the Windows display driver update. If the issue persists, I can come by to replace the cable or test the monitor with a different machine.',
    comments: [
      {
        id: 'c-1',
        author: 'Raj Kumar',
        text: 'I\'ve checked the driver logs remotely. Looks like the display driver is crashing. Attempting a driver rollback now.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isAgent: true,
      }
    ]
  },
  {
    id: 'ITP-2',
    title: 'Missing payslip for May',
    description: 'I haven\'t received my payslip for the month of May in my email. All previous months were fine. Can someone look into this urgently as I need it for a loan application.',
    category: 'Finance',
    urgency: 'High',
    status: 'Resolved',
    createdBy: 'Bob Employee',
    assignee: 'Priya Singh',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    agentNotes: 'Found the issue — email was bounced due to mailbox full. Re-sent manually to secondary email.',
    comments: [
      {
        id: 'c-2',
        author: 'Priya Singh',
        text: 'Found the issue. Your mailbox was full so the payslip bounced. I have re-sent it to your registered secondary email. Please confirm receipt.',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        isAgent: true,
      },
      {
        id: 'c-3',
        author: 'Bob Employee',
        text: 'Received it! Thank you so much for the quick turnaround.',
        timestamp: new Date(Date.now() - 82800000).toISOString(),
        isAgent: false,
      }
    ]
  },
  {
    id: 'ITP-3',
    title: 'VPN not connecting from home network',
    description: 'Since yesterday I cannot connect to the company VPN from my home network. It times out after 30 seconds. VPN works fine from my mobile hotspot so it seems network-specific.',
    category: 'IT',
    urgency: 'High',
    status: 'Open',
    createdBy: 'Carol Employee',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    comments: []
  },
  {
    id: 'ITP-4',
    title: 'Request for standing desk',
    description: 'I have been experiencing back pain and my physiotherapist has recommended a standing desk. Could Admin please arrange one for my workstation at Bay 3?',
    category: 'Admin',
    urgency: 'Low',
    status: 'Open',
    createdBy: 'Alice Employee',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    comments: []
  },
  {
    id: 'ITP-5',
    title: 'Leave encashment policy clarification',
    description: 'I have 18 carry-forward leaves. Can HR clarify the leave encashment policy? Specifically whether these can be encashed at year end or will they lapse.',
    category: 'HR',
    urgency: 'Medium',
    status: 'Closed',
    createdBy: 'Dave Employee',
    assignee: 'Sneha Iyer',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    agentNotes: 'Policy doc shared. Leaves up to 15 can be encashed, excess 3 will lapse.',
    comments: []
  }
];

const genId = () => crypto.randomUUID ? crypto.randomUUID().split('-')[0] : Math.random().toString(36).substring(2, 10);

export const useTicketStore = create<TicketState>()(
  persist(
    (set) => ({
      tickets: initialTickets,
      notifications: [],

      addTicket: (ticketData) => set((state) => {
        const seq = state.tickets.length + 1;
        const newTicket: Ticket = {
          ...ticketData,
          id: `ITP-${seq}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          comments: [],
        };
        return { tickets: [newTicket, ...state.tickets] };
      }),

      updateTicketStatus: (id, status) => set((state) => {
        const tickets = state.tickets.map(t => {
          if (t.id !== id) return t;
          const isValid =
            (t.status === 'Open' && status === 'In Progress') ||
            (t.status === 'In Progress' && status === 'Resolved') ||
            (t.status === 'Resolved' && status === 'Closed') ||
            (t.status === 'Resolved' && status === 'In Progress') ||
            (t.status === status);
          if (!isValid) {
            console.warn(`Invalid transition: ${t.status} → ${status}`);
            return t;
          }
          return { ...t, status, updatedAt: new Date().toISOString() };
        });

        const changedTicket = state.tickets.find((t, i) => t !== tickets[i]);
        const newNotifs = changedTicket
          ? [{
              id: genId(),
              message: `Ticket "${changedTicket.title}" moved to ${status}.`,
              read: false,
              timestamp: new Date().toISOString()
            }, ...state.notifications]
          : state.notifications;

        return { tickets, notifications: newNotifs };
      }),

      updateAgentNotes: (id, notes) => set((state) => ({
        tickets: state.tickets.map(t =>
          t.id === id ? { ...t, agentNotes: notes, updatedAt: new Date().toISOString() } : t
        )
      })),

      setAiSuggestedResponse: (id, response) => set((state) => ({
        tickets: state.tickets.map(t =>
          t.id === id ? { ...t, aiSuggestedResponse: response } : t
        )
      })),

      assignTicket: (id, assignee) => set((state) => ({
        tickets: state.tickets.map(t =>
          t.id === id ? { ...t, assignee, updatedAt: new Date().toISOString() } : t
        )
      })),

      addComment: (ticketId, commentData) => set((state) => ({
        tickets: state.tickets.map(t => {
          if (t.id !== ticketId) return t;
          const newComment: Comment = {
            ...commentData,
            id: `c-${genId()}`,
            timestamp: new Date().toISOString(),
          };
          return {
            ...t,
            comments: [...(t.comments || []), newComment],
            updatedAt: new Date().toISOString(),
          };
        })
      })),

      markNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),
    }),
    { name: 'itp-ticket-storage-v2' }
  )
);

export const AGENT_NAMES = AGENTS;
