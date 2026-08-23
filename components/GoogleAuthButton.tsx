'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CustomerUser, decodeGoogleJwt, saveCustomer } from '@/lib/auth';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleAuthButtonProps {
  clientId?: string;
  onLoginSuccess: (user: CustomerUser) => void;
  compact?: boolean;
}

export default function GoogleAuthButton({
  clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '529319778044-1l8ae8n5pt5ur4m6cmdk718g5ej62j6b.apps.googleusercontent.com',
  onLoginSuccess,
  compact = false,
}: GoogleAuthButtonProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if Google script already exists
    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !buttonRef.current || !window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response?.credential) {
            const user = decodeGoogleJwt(response.credential);
            if (user) {
              saveCustomer(user);
              onLoginSuccess(user);
            }
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: compact ? 'medium' : 'large',
        text: 'signin_with',
        shape: 'pill',
        logo_alignment: 'left',
      });
    } catch (err) {
      console.error('Error rendering Google Sign-In button:', err);
    }
  }, [scriptLoaded, clientId, onLoginSuccess, compact]);

  return (
    <div className="inline-block">
      <div ref={buttonRef} className="min-h-[40px] flex items-center justify-center" />
    </div>
  );
}
