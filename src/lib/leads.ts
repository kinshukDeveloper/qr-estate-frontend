import api from './api';

export type LeadStatus = 'new' | 'contacted' | 'interested' | 'not_interested' | 'converted' | 'lost';
export type LeadSource = 'whatsapp' | 'call' | 'manual' | 'qr_scan' | 'website';

export interface Lead {
  id: string;
  agent_id: string;
  listing_id?: string;
  name?: string;
  phone: string;
  email?: string;
  message?: string;
  status: LeadStatus;
  source: LeadSource;
  notes?: string;
  follow_up_date?: string;
  budget?: number;
  listing_title?: string;
  listing_city?: string;
  listing_price?: number;
  property_type?: string;
  listing_type?: string;
  created_at: string;
  updated_at: string;
}

export const leadsAPI = {
  getAll: (params?: Record<string, any>) => api.get('/leads', { params }),
  getOne: (id: string) => api.get(`/leads/${id}`),
  create: (data: Partial<Lead>) => api.post('/leads', data),
  update: (id: string, data: Partial<Lead>) => api.patch(`/leads/${id}`, data),
  delete: (id: string) => api.delete(`/leads/${id}`),
  getStats: () => api.get('/leads/stats'),
};
