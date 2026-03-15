import api from './api';

export interface QRCode {
  id: string;
  listing_id: string;
  agent_id: string;
  short_code: string;
  style: string;
  foreground_color: string;
  background_color: string;
  include_frame: boolean;
  frame_label: string;
  qr_url: string;
  target_url: string;
  scan_count: number;
  is_active: boolean;
  listing_title: string;
  listing_status: string;
  city: string;
  property_type: string;
  listing_type: string;
  price: number;
  created_at: string;
}

export interface GenerateQRPayload {
  listing_id: string;
  style?: 'standard' | 'branded' | 'minimal';
  foreground_color?: string;
  background_color?: string;
  include_frame?: boolean;
  frame_label?: string;
}

export const qrAPI = {
  generate: (data: GenerateQRPayload) =>
    api.post('/qr/generate', data),

  getAll: () =>
    api.get('/qr'),

  getOne: (id: string) =>
    api.get(`/qr/${id}`),

  getDownloadUrl: (id: string, format: 'png' | 'svg' = 'png') =>
    `${process.env.NEXT_PUBLIC_API_URL}/qr/${id}/download?format=${format}`,

  getAnalytics: (id: string, days = 30) =>
    api.get(`/qr/${id}/analytics?days=${days}`),

  toggle: (id: string) =>
    api.patch(`/qr/${id}/toggle`),
};
