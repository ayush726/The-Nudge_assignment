export type TicketCategory = 'IT' | 'HR' | 'Finance' | 'Admin' | 'Other';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type TicketUrgency = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  urgency: TicketUrgency;
  status: TicketStatus;
  createdBy: string;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  agentNotes?: string;
  aiSuggestedResponse?: string;
}

export interface User {
  id: string;
  name: string;
  role: 'Employee' | 'Agent' | 'Admin';
  department?: string;
}
