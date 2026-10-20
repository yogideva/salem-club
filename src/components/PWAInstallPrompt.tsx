'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Register service worker if supported
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration skipped:', err);
      });
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50 bg-[#0F172A] border border-amber-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-xs shrink-0 shadow-md">
            SEC
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1">
              Install SEC App <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            </h4>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
              Add Salem Entrepreneurs Club to your home screen for quick offline access.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-500 hover:text-white p-1"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="flex-1 py-1.5 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow"
        >
          <Download className="w-3.5 h-3.5" /> Install App
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
        >
          Not Now
        </button>
      </div>
    </div>
  );
};
