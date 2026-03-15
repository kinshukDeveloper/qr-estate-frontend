'use client';

import { useState, useEffect } from 'react';
import {
  Phone, MessageCircle, Mail, Calendar, Search,
  Plus, ChevronDown, Trash2, Check, Filter, X, Edit3,
} from 'lucide-react';
import { leadsAPI, type Lead, type LeadStatus } from '@/lib/leads';
import { Button } from '@/components/ui/Button';
import axios from 'axios';

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string; border: string }> = {
  new:            { label: 'New',           color: '#60A5FA', bg: 'rgba(96,165,250,0.08)',   border: 'rgba(96,165,250,0.2)' },
  contacted:      { label: 'Contacted',     color: '#FFB830', bg: 'rgba(255,184,48,0.08)',   border: 'rgba(255,184,48,0.2)' },
  interested:     { label: 'Interested',    color: '#00D4C8', bg: 'rgba(0,212,200,0.08)',    border: 'rgba(0,212,200,0.2)' },
  not_interested: { label: 'Not Interested',color: '#FF4D6A', bg: 'rgba(255,77,106,0.08)',   border: 'rgba(255,77,106,0.2)' },
  converted:      { label: 'Converted',     color: '#2ECC8A', bg: 'rgba(46,204,138,0.08)',   border: 'rgba(46,204,138,0.2)' },
  lost:           { label: 'Lost',          color: '#4A6580', bg: 'rgba(74,101,128,0.08)',   border: 'rgba(74,101,128,0.2)' },
};

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: '📱 WhatsApp',
  call: '📞 Call',
  manual: '✍️ Manual',
  qr_scan: '🔲 QR Scan',
  website: '🌐 Website',
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as LeadStatus[];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
}

function formatPrice(price?: number) {
  if (!price) return null;
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 border"
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
      {cfg.label}
    </span>
  );
}

interface LeadCardProps {
  lead: Lead;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (lead: Lead) => void;
}

function LeadCard({ lead, onStatusChange, onDelete, onEdit }: LeadCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isToday = lead.follow_up_date &&
    new Date(lead.follow_up_date).toDateString() === new Date().toDateString();

  return (
    <div className="bg-[#111C28] border border-[#1A2D40] p-4 hover:border-[#1A2D40] transition-all">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="font-bold text-white text-sm">{lead.name || 'Unknown'}</div>
          <div className="text-xs text-[#4A6580] mt-0.5">{lead.phone}</div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <StatusBadge status={lead.status} />
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 text-[#4A6580] hover:text-white transition-colors"
            >
              <ChevronDown size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-[#0D1821] border border-[#1A2D40] z-20 shadow-xl">
                <div className="py-1">
                  {ALL_STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => { onStatusChange(lead.id, s); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                      style={{ color: STATUS_CONFIG[s].color }}
                    >
                      {lead.status === s && <Check size={10} />}
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                  <div className="border-t border-[#1A2D40] mt-1 pt-1">
                    <button
                      onClick={() => { onEdit(lead); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#7A95AE] hover:text-white"
                    >
                      <Edit3 size={10} /> Edit notes
                    </button>
                    <button
                      onClick={() => { onDelete(lead.id); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#FF4D6A]"
                    >
                      <Trash2 size={10} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Listing */}
      {lead.listing_title && (
        <div className="text-[10px] text-[#4A6580] mb-2 truncate">
          🏠 {lead.listing_title}
          {lead.listing_city && ` · ${lead.listing_city}`}
          {lead.listing_price && ` · ${formatPrice(lead.listing_price)}`}
        </div>
      )}

      {/* Message */}
      {lead.message && (
        <p className="text-xs text-[#7A95AE] italic mb-3 line-clamp-2">"{lead.message}"</p>
      )}

      {/* Follow up */}
      {lead.follow_up_date && (
        <div className={`flex items-center gap-1.5 text-[10px] mb-3 font-medium ${
          isToday ? 'text-[#FFB830]' : 'text-[#4A6580]'
        }`}>
          <Calendar size={10} />
          {isToday ? '⚡ Follow up TODAY' : `Follow up: ${formatDate(lead.follow_up_date)}`}
        </div>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#1A2D40]">
        <div className="text-[10px] text-[#4A6580]">
          {SOURCE_LABELS[lead.source]} · {formatDate(lead.created_at)}
        </div>
        <div className="flex gap-1.5">
          <a
            href={`tel:+91${lead.phone}`}
            className="w-7 h-7 flex items-center justify-center border border-[#1A2D40] text-[#7A95AE] hover:border-[#00D4C8] hover:text-[#00D4C8] transition-colors"
            title="Call"
          >
            <Phone size={11} />
          </a>
          <a
            href={`https://wa.me/91${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${lead.name || ''}, regarding your property enquiry...`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 flex items-center justify-center border border-[#1A2D40] text-[#7A95AE] hover:border-[#25D366] hover:text-[#25D366] transition-colors"
            title="WhatsApp"
          >
            <MessageCircle size={11} />
          </a>
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="w-7 h-7 flex items-center justify-center border border-[#1A2D40] text-[#7A95AE] hover:border-[#FFB830] hover:text-[#FFB830] transition-colors"
              title="Email"
            >
              <Mail size={11} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── ADD / EDIT LEAD DRAWER ─────────────────────────────────────────────────────
function LeadDrawer({ lead, onClose, onSave }: {
  lead: Lead | null;
  onClose: () => void;
  onSave: (data: Partial<Lead>) => void;
}) {
  const [form, setForm] = useState<Partial<Lead>>(lead || { status: 'new', source: 'manual' });
  const [saving, setSaving] = useState(false);

  function set(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.phone) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#111C28] border border-[#1A2D40] w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-white">{lead ? 'Edit Lead' : 'Add Lead'}</h2>
          <button onClick={onClose} className="text-[#4A6580] hover:text-white"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <Field label="Phone *">
            <input className="input" placeholder="9876543210" value={form.phone || ''} onChange={e => set('phone', e.target.value)} />
          </Field>
          <Field label="Name">
            <input className="input" placeholder="Amit Verma" value={form.name || ''} onChange={e => set('name', e.target.value)} />
          </Field>
          <Field label="Email">
            <input className="input" type="email" placeholder="amit@email.com" value={form.email || ''} onChange={e => set('email', e.target.value)} />
          </Field>
          <Field label="Message / Enquiry">
            <textarea className="input resize-none" rows={3} value={form.message || ''} onChange={e => set('message', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
              </select>
            </Field>
            <Field label="Source">
              <select className="input" value={form.source} onChange={e => set('source', e.target.value)}>
                {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Notes">
            <textarea className="input resize-none" rows={2} placeholder="Internal notes..." value={form.notes || ''} onChange={e => set('notes', e.target.value)} />
          </Field>
          <Field label="Follow-up Date">
            <input className="input" type="date" value={form.follow_up_date ? form.follow_up_date.split('T')[0] : ''} onChange={e => set('follow_up_date', e.target.value || null)} />
          </Field>
          <Field label="Budget (₹)">
            <input className="input" type="number" placeholder="5000000" value={form.budget || ''} onChange={e => set('budget', e.target.value)} />
          </Field>
        </div>

        <div className="flex gap-3 mt-6">
          <Button fullWidth onClick={handleSave} isLoading={saving}>Save Lead</Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [drawerLead, setDrawerLead] = useState<Lead | null | 'new'>('new' as any);
  const [showDrawer, setShowDrawer] = useState(false);

  async function fetchLeads(params?: Record<string, any>) {
    setIsLoading(true);
    try {
      const [leadsRes, statsRes] = await Promise.all([
        leadsAPI.getAll({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: search || undefined,
          ...params,
        }),
        leadsAPI.getStats(),
      ]);
      setLeads(leadsRes.data.data.leads);
      setPagination(leadsRes.data.data.pagination);
      setStats(statsRes.data.data.stats);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchLeads(); }, [statusFilter]);

  async function handleStatusChange(id: string, status: LeadStatus) {
    await leadsAPI.update(id, { status });
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    const statsRes = await leadsAPI.getStats();
    setStats(statsRes.data.data.stats);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this lead?')) return;
    await leadsAPI.delete(id);
    setLeads(prev => prev.filter(l => l.id !== id));
  }

  async function handleSave(data: Partial<Lead>) {
    try {
      if (drawerLead && drawerLead !== 'new' && (drawerLead as Lead).id) {
        const res = await leadsAPI.update((drawerLead as Lead).id, data);
        setLeads(prev => prev.map(l => l.id === (drawerLead as Lead).id ? res.data.data.lead : l));
      } else {
        const res = await leadsAPI.create(data);
        setLeads(prev => [res.data.data.lead, ...prev]);
      }
      setShowDrawer(false);
    } catch (err) {
      if (axios.isAxiosError(err)) alert(err.response?.data?.message || 'Failed to save');
    }
  }

  const todayFollowUps = leads.filter(l =>
    l.follow_up_date && new Date(l.follow_up_date).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Leads</h1>
          <p className="text-[#7A95AE] text-sm mt-0.5">
            {pagination?.total || 0} total leads
            {todayFollowUps > 0 && ` · ⚡ ${todayFollowUps} follow-up${todayFollowUps > 1 ? 's' : ''} today`}
          </p>
        </div>
        <Button size="sm" onClick={() => { setDrawerLead(null); setShowDrawer(true); }} className="flex items-center gap-2 whitespace-nowrap">
          <Plus size={14} /> Add Lead
        </Button>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { label: 'New', value: stats.new_leads, color: '#60A5FA' },
            { label: 'Interested', value: stats.interested, color: '#00D4C8' },
            { label: 'Converted', value: stats.converted, color: '#2ECC8A' },
            { label: 'Lost', value: stats.lost, color: '#FF4D6A' },
            { label: 'This Week', value: stats.this_week, color: '#FFB830' },
            { label: 'Follow Up', value: stats.follow_up_today, color: '#A78BFA' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#111C28] border border-[#1A2D40] p-3 text-center">
              <div className="text-xl font-black" style={{ color }}>{value}</div>
              <div className="text-[10px] text-[#4A6580] uppercase tracking-wide mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A6580]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchLeads()}
            placeholder="Search name, phone..."
            className="input pl-9 py-2 text-sm"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {['all', ...ALL_STATUSES].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors ${
                statusFilter === s
                  ? 'bg-[#00D4C8] text-[#080F17]'
                  : 'bg-[#111C28] border border-[#1A2D40] text-[#7A95AE] hover:text-white'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_CONFIG[s as LeadStatus].label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="bg-[#111C28] border border-[#1A2D40] h-44 animate-pulse" />)}
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">📭</div>
          <div className="font-bold text-white mb-1">No leads yet</div>
          <div className="text-sm text-[#4A6580]">Add your first lead or wait for enquiries from property pages</div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onEdit={lead => { setDrawerLead(lead); setShowDrawer(true); }}
            />
          ))}
        </div>
      )}

      {/* Drawer */}
      {showDrawer && (
        <LeadDrawer
          lead={drawerLead as Lead | null}
          onClose={() => setShowDrawer(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
