export type TicketCategory = 'IT' | 'HR' | 'Finance' | 'Admin' | 'Other';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type TicketUrgency = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  isAgent: boolean;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  urgency: TicketUrgency;
  status: TicketStatus;
  createdBy: string;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  agentNotes?: string;
  aiSuggestedResponse?: string;
  comments?: Comment[];
}

export interface User {
  id: string;
  name: string;
  role: 'Employee' | 'Agent' | 'Admin';
  department?: string;
}
