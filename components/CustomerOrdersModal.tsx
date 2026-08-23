'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  X, 
  ShoppingBag, 
  Key, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  Copy, 
  Check, 
  Mail, 
  Lock, 
  LogOut, 
  Zap,
  RefreshCw
} from 'lucide-react';
import { CustomerUser } from '@/lib/auth';
import { Order } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: CustomerUser | null;
  onLogout: () => void;
}

export default function CustomerOrdersModal({
  isOpen,
  onClose,
  user,
  onLogout,
}: CustomerOrdersModalProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch user orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user?.email) {
      fetchOrders();
    }
  }, [isOpen, user?.email]);

  if (!isOpen || !user) return null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl max-h-[88vh] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-11 h-11 rounded-full border border-amber-400/40 object-cover shadow-md"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-black font-extrabold flex items-center justify-center text-base">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">{user.name}</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Google Verified
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              title="Refresh Orders"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body: Orders List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Your Purchases & Subscriptions ({orders.length})</span>
            </h3>
            <span className="text-[11px] text-zinc-500">Auto-synced with {user.email}</span>
          </div>

          {loading ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-zinc-400">Loading your purchase history...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl bg-zinc-950/40 border border-white/5 space-y-3">
              <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto stroke-[1.5]" />
              <h4 className="text-sm font-bold text-white">No purchases found yet</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Orders made using <span className="text-amber-400 font-mono">{user.email}</span> will automatically appear here with your account credentials.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-yellow-400 transition-all shadow-lg shadow-amber-400/20"
              >
                Browse Subscription Plans
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-4 hover:border-amber-400/30 transition-all"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/5">
                    <div>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {order.id}
                      </span>
                      <span className="text-[11px] text-zinc-500 block">
                        {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        order.status === 'delivered'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : order.status === 'paid'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      }`}>
                        {order.status}
                      </span>

                      <Link
                        href={`/order/${order.id}`}
                        target="_blank"
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-amber-400 hover:text-black text-zinc-300 text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <span>Receipt</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Items in order */}
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-white font-medium">
                          {item.productName} <span className="text-amber-400 text-[11px]">({item.planName})</span> x{item.quantity || 1}
                        </span>
                        <span className="text-zinc-400 font-mono">
                          {formatCurrency((item.price || 0) * (item.quantity || 1))}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivered Credentials Preview */}
                  {order.deliveredKeys && order.deliveredKeys.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        <span>Delivered Credentials:</span>
                      </div>

                      <div className="space-y-2">
                        {order.deliveredKeys.map((keyString, kidx) => {
                          let clean = keyString;
                          let label = '';
                          if (keyString.startsWith('[') && keyString.includes(']: ')) {
                            const s = keyString.indexOf(']: ');
                            label = keyString.substring(1, s);
                            clean = keyString.substring(s + 3).trim();
                          }
                          const isLink = clean.startsWith('http://') || clean.startsWith('https://');
                          const parts = clean.split(':').map((p) => p.trim());
                          const isAcc = parts.length >= 2 && parts[0].includes('@');

                          return (
                            <div
                              key={kidx}
                              className="p-3.5 rounded-xl bg-zinc-900/90 border border-emerald-500/30 text-xs space-y-2"
                            >
                              {label && (
                                <span className="text-[11px] font-bold text-amber-300 block">{label}</span>
                              )}
                              
                              {isLink ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>Direct Personal Email Activation Link:</span>
                                  </div>
                                  <a
                                    href={clean}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-600 text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:scale-[1.01] transition-all shadow-md shadow-emerald-500/20"
                                  >
                                    <span>🔗 Click Here to Activate Plan on Your Own Email</span>
                                  </a>
                                  <div className="flex items-center justify-between p-2 bg-black/50 rounded-lg border border-white/5 font-mono text-[10px] text-zinc-400">
                                    <span className="truncate mr-2">{clean}</span>
                                    <button
                                      onClick={() => copyText(clean, `u-raw-${order.id}-${kidx}`)}
                                      className="text-amber-400 hover:text-white p-1 flex-shrink-0"
                                      title="Copy link"
                                    >
                                      {copiedField === `u-raw-${order.id}-${kidx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </div>
                              ) : isAcc ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                                  <div className="flex items-center justify-between p-1.5 bg-black/50 rounded-lg border border-white/5">
                                    <span className="text-zinc-300 truncate mr-2">{parts[0]}</span>
                                    <button
                                      onClick={() => copyText(parts[0], `u-email-${order.id}-${kidx}`)}
                                      className="text-amber-400 hover:text-white p-1"
                                      title="Copy email"
                                    >
                                      {copiedField === `u-email-${order.id}-${kidx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                  </div>
                                  <div className="flex items-center justify-between p-1.5 bg-black/50 rounded-lg border border-white/5">
                                    <span className="text-cyan-300 truncate mr-2">{parts[1]}</span>
                                    <button
                                      onClick={() => copyText(parts[1], `u-pass-${order.id}-${kidx}`)}
                                      className="text-amber-400 hover:text-white p-1"
                                      title="Copy password"
                                    >
                                      {copiedField === `u-pass-${order.id}-${kidx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                  </div>
                                  {parts.length >= 3 && (
                                    <div className="sm:col-span-2 flex items-center justify-between p-1.5 bg-black/50 rounded-lg border border-white/5">
                                      <span className="text-emerald-300 font-mono text-[10px] truncate mr-2">2FA: {parts[2]}</span>
                                      <button
                                        onClick={() => copyText(parts[2], `u-2fa-${order.id}-${kidx}`)}
                                        className="text-emerald-400 hover:text-white p-1"
                                        title="Copy 2FA key"
                                      >
                                        {copiedField === `u-2fa-${order.id}-${kidx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  <span className="text-[10px] text-zinc-400 block font-sans">Redeemable License / Coupon Code:</span>
                                  <div className="flex items-center justify-between p-2 bg-black/50 rounded-lg font-mono text-xs text-amber-300 border border-amber-400/20">
                                    <span className="truncate mr-2 font-bold">{clean}</span>
                                    <button
                                      onClick={() => copyText(clean, `u-raw-${order.id}-${kidx}`)}
                                      className="text-amber-400 hover:text-white p-1"
                                      title="Copy code"
                                    >
                                      {copiedField === `u-raw-${order.id}-${kidx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-zinc-950 flex items-center justify-between">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
