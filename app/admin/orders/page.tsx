'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  ShoppingBag, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  ExternalLink,
  ShieldCheck,
  Send
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';
import { formatCurrency, formatUsdt } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [manualKeyInput, setManualKeyInput] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) setOrders(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleVerifyBinance = async (order: Order) => {
    setActionLoading(true);
    setFeedback('');
    try {
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Order ${order.id} verified & processed!`);
        fetchOrders();
        if (selectedOrder?.id === order.id) setSelectedOrder(data.order);
      } else {
        setFeedback(data.message || 'Verification failed');
      }
    } catch (err) {
      setFeedback('Error checking verification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setActionLoading(true);
    try {
      const payload: any = { status: newStatus };
      if (manualKeyInput.trim()) {
        payload.deliveredKeys = [manualKeyInput.trim()];
      }

      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setFeedback(`Order updated to status: ${newStatus.toUpperCase()}`);
        setManualKeyInput('');
        fetchOrders();
        setSelectedOrder(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.paymentDetails.txHash && o.paymentDetails.txHash.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#07090e] text-zinc-100">
      <AdminSidebar onLogout={() => {}} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 2xl:p-10 w-full min-w-0 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Orders & Crypto Transaction Verifier</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Match customer exact USDT transactions, trigger Binance verification, and dispatch credentials.
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-amber-400/40 text-xs font-semibold text-zinc-300"
          >
            Refresh Orders
          </button>
        </div>

        {feedback && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          {/* Status Buttons */}
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {['all', 'pending', 'paid', 'delivered', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                  statusFilter === st
                    ? 'bg-amber-400 text-black'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search Order ID, Email, TxHash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white"
            />
          </div>
        </div>

        {/* Orders Grid/Table Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Orders Table */}
          <div className="lg:col-span-8 glass-card rounded-3xl p-6 border border-white/10">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 text-xs">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-400" />
                <p>No orders found matching filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[550px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-wider text-[10px]">
                      <th className="pb-2.5">Order</th>
                      <th className="pb-2.5">Customer</th>
                      <th className="pb-2.5">Exact USDT (0.0123)</th>
                      <th className="pb-2.5">Status</th>
                      <th className="pb-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOrders.map((o) => (
                      <tr
                        key={o.id}
                        onClick={() => setSelectedOrder(o)}
                        className={`cursor-pointer transition-colors ${
                          selectedOrder?.id === o.id ? 'bg-amber-400/10' : 'hover:bg-zinc-900/40'
                        }`}
                      >
                        <td className="py-3.5 font-mono font-bold text-amber-400">
                          {o.id}
                        </td>
                        <td className="py-3.5 text-zinc-300">
                          <div>{o.customerEmail}</div>
                          <div className="text-[10px] text-zinc-500">{new Date(o.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="py-3.5 font-mono font-extrabold text-white">
                          {o.totalAmount.toFixed(4)} USDT
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            o.status === 'delivered'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : o.status === 'paid'
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'bg-amber-400/20 text-amber-300'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right space-x-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVerifyBinance(o);
                            }}
                            className="px-2 py-1 rounded bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-bold"
                            title="Verify with Binance"
                          >
                            Verify
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Selected Order Detail Sidebar */}
          <div className="lg:col-span-4 glass-card rounded-3xl p-6 border border-white/10 h-fit">
            {selectedOrder ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="font-bold text-white text-sm">Order Details</h3>
                  <Link
                    href={`/order/${selectedOrder.id}`}
                    target="_blank"
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Customer Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div>
                  <span className="text-[11px] text-zinc-400 block">Customer Email:</span>
                  <p className="text-xs font-bold text-white">{selectedOrder.customerEmail}</p>
                  {selectedOrder.telegramUsername && (
                    <p className="text-xs text-cyan-400">Telegram: {selectedOrder.telegramUsername}</p>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-zinc-400 block">Ordered Subscriptions:</span>
                  <div className="space-y-1 mt-1">
                    {selectedOrder.items.map((i, idx) => (
                      <div key={idx} className="text-xs text-zinc-300 bg-zinc-950 p-2 rounded-lg border border-white/5">
                        <strong className="text-white">{i.productName}</strong> ({i.planName}) x{i.quantity}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-zinc-950 rounded-xl border border-amber-400/20">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Expected USDT:</span>
                    <strong className="font-mono text-amber-300">{selectedOrder.totalAmount.toFixed(4)} USDT</strong>
                  </div>
                  {selectedOrder.paymentDetails.txHash && (
                    <div className="mt-1 pt-1 border-t border-white/5 text-[11px] text-zinc-400">
                      <span>TxHash: </span>
                      <code className="text-xs text-zinc-300 break-all">{selectedOrder.paymentDetails.txHash}</code>
                    </div>
                  )}
                </div>

                {/* Delivered Keys */}
                {selectedOrder.deliveredKeys && selectedOrder.deliveredKeys.length > 0 && (
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Delivered Credentials:</span>
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 font-mono text-xs text-emerald-300 break-all">
                      {selectedOrder.deliveredKeys.join('\n')}
                    </div>
                  </div>
                )}

                {/* Manual Key / Credentials Input */}
                {selectedOrder.status !== 'delivered' && (
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                      Manual Account / License Key Override:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. email:pass or CODE-12345"
                      value={manualKeyInput}
                      onChange={(e) => setManualKeyInput(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                )}

                {/* Status Update Action Buttons */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                    disabled={actionLoading}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Paid & Delivered</span>
                  </button>

                  <button
                    onClick={() => handleVerifyBinance(selectedOrder)}
                    disabled={actionLoading}
                    className="w-full py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold text-xs border border-amber-400/30 flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Auto-Verify via Binance API</span>
                  </button>

                  {selectedOrder.status !== 'cancelled' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                      className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-red-500/10 text-red-400 text-xs font-semibold"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500 text-xs">
                <p>Click on any order from the table to inspect details and verify payment.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
