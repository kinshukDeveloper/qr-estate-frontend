'use client';

import { useState, useEffect } from 'react';
import { Check, Zap, Building2, Crown, AlertTriangle, Clock } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <Zap size={20} />,
  pro: <Crown size={20} />,
  agency: <Building2 size={20} />,
};

const PLAN_COLORS: Record<string, string> = {
  free: '#7A95AE',
  pro: '#00D4C8',
  agency: '#FFB830',
};

function formatAmount(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

declare global {
  interface Window { Razorpay: any; }
}

export default function BillingPage() {
  const { user } = useAuthStore();
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [plans, setPlans] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [planRes, plansRes, histRes] = await Promise.all([
          api.get('/billing/me'),
          api.get('/billing/plans'),
          api.get('/billing/history'),
        ]);
        setCurrentPlan(planRes.data.data);
        setPlans(plansRes.data.data.plans);
        setPayments(histRes.data.data.payments);
      } catch { /* silent */ }
      finally { setIsLoading(false); }
    }
    load();

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  async function handleUpgrade(planKey: string) {
    setUpgrading(planKey);
    setError(null);
    try {
      const orderRes = await api.post('/billing/order', { plan: planKey });
      const { order_id, amount, currency, key_id, plan_name } = orderRes.data.data;

      const options = {
        key: key_id,
        amount,
        currency,
        name: 'QR Estate',
        description: `${plan_name} Plan — Annual`,
        order_id,
        handler: async (response: any) => {
          try {
            const verifyRes = await api.post('/billing/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planKey,
            });
            setCurrentPlan((prev: any) => ({ ...prev, plan: planKey }));
            setSuccessMsg(verifyRes.data.data.message);
            const histRes = await api.get('/billing/history');
            setPayments(histRes.data.data.payments);
          } catch {
            setError('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone ? `+91${user.phone}` : '',
        },
        theme: { color: '#00D4C8' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => setError('Payment failed. Please try again.'));
      rzp.open();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setUpgrading(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-[#111C28]" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-80 bg-[#111C28]" />)}
        </div>
      </div>
    );
  }

  const activePlan = currentPlan?.plan || 'free';

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-white">Billing & Plans</h1>
        <p className="text-[#7A95AE] text-sm mt-0.5">Manage your subscription</p>
      </div>

      {/* Current plan banner */}
      <div className="bg-[#111C28] border border-[#1A2D40] p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 flex items-center justify-center" style={{ background: `${PLAN_COLORS[activePlan]}15`, color: PLAN_COLORS[activePlan] }}>
            {PLAN_ICONS[activePlan]}
          </div>
          <div>
            <div className="text-sm font-bold text-white capitalize">
              {activePlan} Plan {activePlan !== 'free' && '✓ Active'}
            </div>
            {currentPlan?.plan_expires_at && (
              <div className="text-xs text-[#4A6580] flex items-center gap-1 mt-0.5">
                <Clock size={10} />
                Renews {formatDate(currentPlan.plan_expires_at)}
              </div>
            )}
            {currentPlan?.is_expired && (
              <div className="text-xs text-[#FF4D6A] flex items-center gap-1 mt-0.5">
                <AlertTriangle size={10} />
                Plan expired — downgraded to Free
              </div>
            )}
          </div>
        </div>
        {activePlan !== 'free' && (
          <button
            onClick={async () => {
              if (!confirm('Cancel subscription and downgrade to Free?')) return;
              await api.delete('/billing/cancel');
              setCurrentPlan((p: any) => ({ ...p, plan: 'free' }));
            }}
            className="text-xs text-[#FF4D6A] hover:underline"
          >
            Cancel subscription
          </button>
        )}
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="px-4 py-3 bg-[rgba(46,204,138,0.08)] border border-[rgba(46,204,138,0.2)] text-[#2ECC8A] text-sm">
          🎉 {successMsg}
        </div>
      )}
      {error && (
        <div className="px-4 py-3 bg-[rgba(255,77,106,0.08)] border border-[rgba(255,77,106,0.2)] text-[#FF4D6A] text-sm">
          ⚠ {error}
        </div>
      )}

      {/* Plan cards */}
      {plans && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(plans).map(([key, plan]: [string, any]) => {
            const isActive = activePlan === key;
            const color = PLAN_COLORS[key];

            return (
              <div
                key={key}
                className={`bg-[#111C28] border-2 p-6 relative transition-all ${
                  isActive ? 'border-[#00D4C8]' : 'border-[#1A2D40] hover:border-[#4A6580]'
                } ${key === 'pro' ? 'ring-1 ring-[#00D4C8] ring-offset-2 ring-offset-[#080F17]' : ''}`}
              >
                {key === 'pro' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00D4C8] text-[#080F17] text-[9px] font-black tracking-widest uppercase px-3 py-1">
                    Most Popular
                  </div>
                )}
                {isActive && (
                  <div className="absolute top-3 right-3 text-[9px] font-black tracking-widest text-[#00D4C8] uppercase">
                    Current
                  </div>
                )}

                {/* Icon + name */}
                <div className="flex items-center gap-2 mb-4" style={{ color }}>
                  {PLAN_ICONS[key]}
                  <span className="font-black text-sm uppercase tracking-wide">{plan.name}</span>
                </div>

                {/* Price */}
                <div className="mb-5">
                  {plan.price === 0 ? (
                    <div className="text-3xl font-black text-white">Free</div>
                  ) : (
                    <div>
                      <span className="text-3xl font-black text-white">{formatAmount(plan.price)}</span>
                      <span className="text-[#4A6580] text-sm">/year</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {plan.features?.map((f: string) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-[#7A95AE]">
                      <Check size={12} style={{ color }} className="flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {isActive ? (
                  <div className="py-2.5 text-center text-xs font-bold text-[#4A6580] border border-[#1A2D40]">
                    Current Plan
                  </div>
                ) : key === 'free' ? (
                  <div className="py-2.5 text-center text-xs text-[#4A6580]">
                    Cancel to downgrade
                  </div>
                ) : (
                  <Button
                    fullWidth
                    onClick={() => handleUpgrade(key)}
                    isLoading={upgrading === key}
                    style={{ background: color, color: '#080F17' }}
                  >
                    Upgrade to {plan.name}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Payment history */}
      {payments.length > 0 && (
        <div className="bg-[#111C28] border border-[#1A2D40] p-6">
          <h2 className="text-sm font-bold text-white mb-4">Payment History</h2>
          <div className="space-y-2">
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-[#1A2D40] last:border-0">
                <div>
                  <div className="text-xs font-semibold text-white capitalize">{p.plan} Plan</div>
                  <div className="text-[10px] text-[#4A6580] mt-0.5">{formatDate(p.created_at)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{formatAmount(p.amount)}</div>
                  <div className={`text-[10px] font-bold uppercase tracking-wide ${
                    p.status === 'success' ? 'text-[#2ECC8A]' : p.status === 'failed' ? 'text-[#FF4D6A]' : 'text-[#FFB830]'
                  }`}>{p.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
