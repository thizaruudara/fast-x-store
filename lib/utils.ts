import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type CurrencyCode = 'USDT' | 'LKR';

export function formatCurrency(amount: number, currency: CurrencyCode = 'USDT', lkrAmount?: number): string {
  if (currency === 'LKR') {
    const finalLkr = typeof lkrAmount === 'number' && lkrAmount > 0 ? lkrAmount : Math.round(amount * 310);
    return `Rs. ${new Intl.NumberFormat('en-LK').format(finalLkr)}`;
  }
  return `$${Number(amount).toFixed(2)}`;
}

export function formatUsdt(amount: number): string {
  return Number(amount).toFixed(4) + ' USDT';
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${timestamp}${random}`;
}

export function generateUniqueMicroFee(
  discountedSubtotal: number,
  existingPendingTotals: number[] | number = []
): { microFee: number; totalUsdt: number } {
  // If a fixed numeric micro fee was passed, use it directly
  if (typeof existingPendingTotals === 'number') {
    const microFee = Number(existingPendingTotals.toFixed(4));
    return {
      microFee,
      totalUsdt: Number((discountedSubtotal + microFee).toFixed(4)),
    };
  }

  const totalsList = Array.isArray(existingPendingTotals) ? existingPendingTotals : [];

  let attempts = 0;
  while (attempts < 200) {
    // Generate random 4-decimal offset between 0.0101 and 0.0999 USDT
    const randomOffset = Math.floor(101 + Math.random() * 898) / 10000;
    const microFee = Number(randomOffset.toFixed(4));
    const totalUsdt = Number((discountedSubtotal + microFee).toFixed(4));

    // Ensure this exact total amount is unique among all currently active pending orders
    const isColliding = totalsList.some(
      (existing) => typeof existing === 'number' && Math.abs(existing - totalUsdt) < 0.00005
    );

    if (!isColliding) {
      return { microFee, totalUsdt };
    }
    attempts++;
  }

  // Fallback timestamp-seeded unique offset
  const fallbackOffset = 0.0100 + ((Date.now() % 8990) / 100000);
  const microFee = Number(fallbackOffset.toFixed(4));
  return {
    microFee,
    totalUsdt: Number((discountedSubtotal + microFee).toFixed(4)),
  };
}

export function calculateOrderTotal(
  subtotal: number, 
  discount: number = 0, 
  existingPendingTotals: number[] | number = []
): {
  discountedSubtotal: number;
  microFee: number;
  totalUsdt: number;
} {
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const { microFee, totalUsdt } = generateUniqueMicroFee(discountedSubtotal, existingPendingTotals);
  return {
    discountedSubtotal: Number(discountedSubtotal.toFixed(2)),
    microFee,
    totalUsdt,
  };
}

export function truncateAddress(address: string, chars: number = 6): string {
  if (!address) return '';
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function getExpiryCountdown(expiresAt: string): {
  totalSeconds: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
} {
  const diff = new Date(expiresAt).getTime() - Date.now();
  const totalSeconds = Math.max(0, Math.floor(diff / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const isExpired = totalSeconds <= 0;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  return {
    totalSeconds,
    minutes,
    seconds,
    isExpired,
    formatted,
  };
}
