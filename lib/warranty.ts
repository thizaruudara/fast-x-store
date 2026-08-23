import { WarrantyType, Product } from './types';

export interface WarrantyOption {
  type: WarrantyType;
  label: string;
  shortBadge: string;
  description: string;
  badgeColor: string;
}

export const WARRANTY_OPTIONS: WarrantyOption[] = [
  {
    type: 'full_period',
    label: '🛡️ Full Subscription Period Guarantee',
    shortBadge: '🛡️ Full Period Warranty',
    description: '100% replacement warranty if any issues occur during the active duration of your subscription.',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  {
    type: '1_hour',
    label: '⏱️ 1 Hour Instant Warranty',
    shortBadge: '⏱️ 1-Hour Warranty',
    description: '1-hour replacement warranty upon delivery. Please check and log in immediately.',
    badgeColor: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  },
  {
    type: '3_hours',
    label: '⏱️ 3 Hours Warranty',
    shortBadge: '⏱️ 3-Hour Warranty',
    description: '3-hour replacement guarantee upon delivery. Please verify credentials within 3 hours.',
    badgeColor: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  },
  {
    type: '6_hours',
    label: '⏱️ 6 Hours Warranty',
    shortBadge: '⏱️ 6-Hour Warranty',
    description: '6-hour replacement guarantee upon delivery. Contact support if any issue occurs within 6 hours.',
    badgeColor: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
  },
  {
    type: '12_hours',
    label: '⏱️ 12 Hours Warranty',
    shortBadge: '⏱️ 12-Hour Warranty',
    description: '12-hour replacement guarantee from the time of order delivery.',
    badgeColor: 'bg-cyan-400/15 text-cyan-300 border-cyan-400/30',
  },
  {
    type: '24_hours',
    label: '⏱️ 24 Hours / 1 Day Warranty',
    shortBadge: '⏱️ 24-Hour Warranty',
    description: '24-hour full replacement warranty from delivery time.',
    badgeColor: 'bg-cyan-400/15 text-cyan-300 border-cyan-400/30',
  },
  {
    type: '3_days',
    label: '📅 3 Days Warranty',
    shortBadge: '📅 3-Day Warranty',
    description: '3-day replacement guarantee if credentials stop working.',
    badgeColor: 'bg-blue-400/15 text-blue-300 border-blue-400/30',
  },
  {
    type: '5_days',
    label: '📅 5 Days Warranty',
    shortBadge: '📅 5-Day Warranty',
    description: '5-day replacement guarantee from delivery date.',
    badgeColor: 'bg-blue-400/15 text-blue-300 border-blue-400/30',
  },
  {
    type: '7_days',
    label: '📅 7 Days / 1 Week Warranty',
    shortBadge: '📅 7-Day Warranty',
    description: '7-day replacement warranty if any issues occur.',
    badgeColor: 'bg-indigo-400/15 text-indigo-300 border-indigo-400/30',
  },
  {
    type: '30_days',
    label: '📅 30 Days / 1 Month Warranty',
    shortBadge: '📅 30-Day Warranty',
    description: '30-day replacement warranty coverage from purchase date.',
    badgeColor: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
  },
  {
    type: 'no_warranty',
    label: '🚫 No Warranty (Sold As-Is)',
    shortBadge: '🚫 No Warranty',
    description: 'Sold as-is with no post-delivery warranty. Credentials verified working prior to dispatch.',
    badgeColor: 'bg-zinc-800 text-zinc-400 border-white/10',
  },
  {
    type: 'custom',
    label: '✍️ Custom Warranty Term',
    shortBadge: '🛡️ Custom Warranty',
    description: 'Custom warranty coverage as described in the product details.',
    badgeColor: 'bg-purple-400/15 text-purple-300 border-purple-400/30',
  },
];

export function getProductWarranty(product: Product | { warrantyType?: string; warrantyCustomText?: string; warrantyText?: string }): WarrantyOption {
  if (!product) {
    return WARRANTY_OPTIONS[0]; // full_period default
  }

  if (product.warrantyType === 'custom' && product.warrantyCustomText) {
    return {
      type: 'custom',
      label: product.warrantyCustomText,
      shortBadge: product.warrantyCustomText,
      description: product.warrantyCustomText,
      badgeColor: 'bg-purple-400/15 text-purple-300 border-purple-400/30',
    };
  }

  const found = WARRANTY_OPTIONS.find((w) => w.type === product.warrantyType);
  if (found) return found;

  if (product.warrantyText) {
    return {
      type: 'custom',
      label: product.warrantyText,
      shortBadge: product.warrantyText,
      description: product.warrantyText,
      badgeColor: 'bg-purple-400/15 text-purple-300 border-purple-400/30',
    };
  }

  return WARRANTY_OPTIONS[0]; // fallback to full_period
}
