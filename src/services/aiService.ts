import type { Ticket, TicketCategory } from '../types/ticket';

export const aiService = {
  // Auto-categorize based on simple keyword heuristics
  categorizeTicket: async (description: string): Promise<TicketCategory> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.match(/laptop|monitor|mouse|keyboard|screen|password|login|email|software|hardware|vpn/)) {
      return 'IT';
    }
    if (lowerDesc.match(/leave|holiday|payroll|salary|payslip|manager|harassment|onboarding|benefits/)) {
      return 'HR';
    }
    if (lowerDesc.match(/reimbursement|expense|invoice|budget|payment|tax/)) {
      return 'Finance';
    }
    if (lowerDesc.match(/desk|chair|cleaning|ac|air conditioning|water|food|pantry/)) {
      return 'Admin';
    }
    
    return 'Other';
  },

  // Surface similar tickets
  findSimilarTickets: async (description: string, allTickets: Ticket[]): Promise<Ticket[]> => {
    if (!description || description.length < 10) return [];
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const words = description.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    
    // Score tickets based on common words
    const scored = allTickets.map(ticket => {
      const ticketDescWords = ticket.description.toLowerCase().split(/\W+/);
      const ticketTitleWords = ticket.title.toLowerCase().split(/\W+/);
      const combined = [...ticketDescWords, ...ticketTitleWords];
      
      let score = 0;
      words.forEach(w => {
        if (combined.includes(w)) score++;
      });
      return { ticket, score };
    });
    
    return scored
      .filter(s => s.score > 0) // Only those with matching words
      .sort((a, b) => b.score - a.score)
      .map(s => s.ticket)
      .slice(0, 3); // Top 3
  },

  // Auto-draft suggested response
  draftResponse: async (ticket: Ticket): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const cat = ticket.category;
    
    if (cat === 'IT') {
      return `Hello ${ticket.createdBy.split(' ')[0]},\n\nI have received your IT request regarding "${ticket.title}". Have you tried restarting the application/device as a first step? If you're still experiencing issues, I can connect with you remotely to troubleshoot further.\n\nBest,\nIT Support Team`;
    }
    if (cat === 'HR') {
      return `Hi ${ticket.createdBy.split(' ')[0]},\n\nThank you for reaching out to HR. I am looking into your inquiry about "${ticket.title}". I will check our records and get back to you with an update shortly.\n\nRegards,\nHR Team`;
    }
    if (cat === 'Finance') {
      return `Hello ${ticket.createdBy.split(' ')[0]},\n\nI am reviewing your Finance request: "${ticket.title}". If this involves reimbursements, please ensure all receipts are attached. I will process this request within the next 2 business days.\n\nThanks,\nFinance Team`;
    }
    
    return `Hi ${ticket.createdBy.split(' ')[0]},\n\nWe have received your ticket and our team is currently reviewing it. We will get back to you as soon as possible with a resolution.\n\nThank you.`;
  }
};
