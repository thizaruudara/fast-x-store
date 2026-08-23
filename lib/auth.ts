'use client';

export interface CustomerUser {
  id: string; // Google sub
  email: string;
  name: string;
  picture?: string;
}

/**
 * Decodes Google Identity Services JWT credential token
 */
export function decodeGoogleJwt(token: string): CustomerUser | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name || payload.given_name || payload.email.split('@')[0],
      picture: payload.picture,
    };
  } catch (err) {
    console.error('Failed to decode Google JWT token:', err);
    return null;
  }
}

/**
 * Gets saved customer from localStorage
 */
export function getSavedCustomer(): CustomerUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem('fastx_customer_user');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Saves customer to localStorage
 */
export function saveCustomer(user: CustomerUser) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('fastx_customer_user', JSON.stringify(user));
}

/**
 * Clears customer session
 */
export function removeCustomer() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('fastx_customer_user');
}
