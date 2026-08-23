'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Key, 
  Lock, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { Order, Product, DigitalKey } from '@/lib/types';
import { formatCurrency, formatUsdt } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [keys, setKeys] = useState<DigitalKey[]>([]);
  const [loading, setLoading] = useState(true);

  // Check saved session
  useEffect(() => {
    const token = sessionStorage.getItem('nexus_admin_auth');
    if (token === 'true') {
      setIsAuthenticated(true);
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('nexus_admin_auth', 'true');
        setIsAuthenticated(true);
        fetchDashboardData();
      } else {
        setAuthError(data.error || 'Incorrect admin passcode');
      }
    } catch (err) {
      setAuthError('Authentication request failed');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('nexus_admin_auth');
    setIsAuthenticated(false);
    setPasscode('');
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersRes, prodsRes, keysRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/products'),
        fetch('/api/admin/keys')
      ]);

      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (prodsRes.ok) setProducts(await prodsRes.json());
      if (keysRes.ok) setKeys(await keysRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#07090e]">
        <div className="glass-panel p-8 rounded-3xl max-w-md w-full border border-white/10 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-black border border-white/20 overflow-hidden flex items-center justify-center mx-auto mb-4 font-bold shadow-xl shadow-black/90">
            <img
              src="/fastx-logo.jpg"
              alt="Fast X Solutions"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Fast X Admin Portal</h2>
          <p className="text-xs text-zinc-400 mt-1 mb-6">
            Enter your admin security passcode to manage products, pricing, stock keys, and crypto payments.
          </p>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                required
                placeholder="Default Passcode: admin1234"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-center font-mono text-lg tracking-widest text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-sm shadow-lg shadow-amber-400/20 hover:scale-[1.01] transition-all"
            >
              Unlock Dashboard
            </button>
          </form>
          <p className="text-[11px] text-zinc-500 mt-4">
            Default passcode is <code className="text-amber-400 font-mono">admin1234</code> (can be changed in settings).
          </p>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalRevenueUsdt = orders
    .filter((o) => o.status === 'paid' || o.status === 'delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const completedOrders = orders.filter((o) => o.status === 'delivered' || o.status === 'paid');
  const availableKeys = keys.filter((k) => !k.isUsed);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#07090e] text-zinc-100">
      <AdminSidebar onLogout={handleLogout} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 2xl:p-10 w-full min-w-0 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Store Dashboard Overview</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Live crypto sales, order fulfillment queue, and inventory health.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-amber-400/40 text-xs font-semibold text-zinc-300 hover:text-white"
            >
              Refresh Data
            </button>
            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold shadow-md shadow-amber-400/20"
            >
              Storefront ↗
            </Link>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="glass-card p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-400">Total Revenue (USDT)</span>
              <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold font-mono text-amber-300">
              {totalRevenueUsdt.toFixed(4)} <span className="text-xs font-sans text-zinc-400">USDT</span>
            </div>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>{completedOrders.length} Paid Transactions</span>
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-400">Pending Orders</span>
              <div className="p-2 rounded-xl bg-cyan-400/10 text-cyan-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white">
              {pendingOrders.length}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Awaiting Binance payment</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-400">Active Products</span>
              <div className="p-2 rounded-xl bg-purple-400/10 text-purple-400">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white">
              {products.filter((p) => p.isActive).length}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">{products.length} total catalog items</p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-400">Stock Keys In Vault</span>
              <div className="p-2 rounded-xl bg-emerald-400/10 text-emerald-400">
                <Key className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-400">
              {availableKeys.length}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">{keys.filter((k) => k.isUsed).length} keys claimed</p>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="glass-card rounded-3xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Recent Customer Orders</h3>
              <p className="text-xs text-zinc-400">Monitor Binance Pay deposits and fulfillment status</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-bold"
            >
              <span>View All Orders</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-400" />
              <p className="text-sm font-semibold">No orders recorded yet</p>
              <p className="text-xs text-zinc-500 mt-0.5">Test placing an order from the storefront!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-wider">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Items</th>
                    <th className="pb-3">Exact Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.slice(0, 6).map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-900/40">
                      <td className="py-3.5 font-mono font-bold text-amber-400">
                        {order.id}
                      </td>
                      <td className="py-3.5 text-zinc-300">
                        <div>{order.customerEmail}</div>
                        {order.telegramUsername && (
                          <div className="text-[10px] text-cyan-400">{order.telegramUsername}</div>
                        )}
                      </td>
                      <td className="py-3.5 text-zinc-300">
                        {order.items.map((i) => `${i.productName} (${i.planName})`).join(', ')}
                      </td>
                      <td className="py-3.5 font-mono font-extrabold text-white">
                        {order.totalAmount.toFixed(4)} USDT
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          order.status === 'delivered'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : order.status === 'paid'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          href={`/order/${order.id}`}
                          target="_blank"
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-amber-400 hover:text-black text-zinc-300 text-[11px] font-semibold transition-all inline-block whitespace-nowrap"
                        >
                          View Order
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
