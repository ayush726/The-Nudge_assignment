import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Ticket, TicketStatus } from '../types/ticket';

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  timestamp: string;
}

interface TicketState {
  tickets: Ticket[];
  notifications: Notification[];
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  updateAgentNotes: (id: string, notes: string) => void;
  setAiSuggestedResponse: (id: string, response: string) => void;
  markNotificationsRead: () => void;
}

// Initial mock data to show functionality right away
const initialTickets: Ticket[] = [
  {
    id: 't-1',
    title: 'Monitor flickering and turns off',
    description: 'My external monitor keeps flickering every 5 minutes and sometimes goes completely black. I have to unplug and replug the HDMI cable.',
    category: 'IT',
    urgency: 'Medium',
    status: 'Open',
    createdBy: 'Alice Employee',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    aiSuggestedResponse: 'Hello Alice, it sounds like there might be an issue with either the HDMI cable or the monitor itself. Have you tried using a different HDMI port or cable? If the issue persists, I can come by to replace the cable or test the monitor.',
  },
  {
    id: 't-2',
    title: 'Missing payslip for last month',
    description: 'I haven\'t received my payslip for the month of May in my email. Can someone check?',
    category: 'Finance',
    urgency: 'High',
    status: 'Resolved',
    createdBy: 'Bob Employee',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    agentNotes: 'Found the issue, email was bounced. Re-sent manually.',
  }
];

export const useTicketStore = create<TicketState>()(
  persist(
    (set) => ({
      tickets: initialTickets,
      notifications: [],
      addTicket: (ticketData) => set((state) => {
        const newTicket: Ticket = {
          ...ticketData,
          id: `t-${crypto.randomUUID ? crypto.randomUUID().split('-')[0] : Math.random().toString(36).substring(2, 10)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return { tickets: [newTicket, ...state.tickets] };
      }),
      updateTicketStatus: (id, status) => set((state) => {
        const tickets = state.tickets.map(t => {
          if (t.id !== id) return t;
          
          // Enforce valid transitions:
          // Open -> In Progress
          // In Progress -> Resolved
          // Resolved -> Closed
          // Resolved -> In Progress
          const isValid = 
            (t.status === 'Open' && status === 'In Progress') ||
            (t.status === 'In Progress' && status === 'Resolved') ||
            (t.status === 'Resolved' && status === 'Closed') ||
            (t.status === 'Resolved' && status === 'In Progress') ||
            (t.status === status); // Allow same status (no-op)

          if (!isValid) {
            console.warn(`Invalid status transition from ${t.status} to ${status}`);
            return t;
          }

          const updatedTicket = { ...t, status, updatedAt: new Date().toISOString() };
          
          return updatedTicket;
        });

        // Add the new notification if any ticket was updated
        const updatedTicket = state.tickets.find((t, i) => t !== tickets[i]);
        const newNotifs = updatedTicket
          ? [
              {
                id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
                message: `Ticket "${updatedTicket.title}" is now ${status}.`,
                read: false,
                timestamp: new Date().toISOString()
              },
              ...state.notifications
            ] 
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
      markNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      }))
    }),
    {
      name: 'ticket-storage',
    }
  )
);
