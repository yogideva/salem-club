'use client';

import React, { useState } from 'react';
import { Copy, Check, ExternalLink, ShieldCheck, Smartphone, QrCode } from 'lucide-react';

interface UpiPaymentButtonsProps {
  upiId: string;
  payeeName: string;
  amount: number;
  transactionNote?: string;
  memberId?: string;
  showQrHint?: boolean;
}

export default function UpiPaymentButtons({
  upiId,
  payeeName,
  amount,
  transactionNote = 'Salem Entrepreneurs Club Membership',
  memberId,
  showQrHint = true,
}: UpiPaymentButtonsProps) {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [desktopModalOpen, setDesktopModalOpen] = useState(false);

  // Clean note to ensure valid UPI URI
  const cleanNote = `${transactionNote}${memberId ? ` - ${memberId}` : ''}`.slice(0, 40);

  // Base UPI URL specifications (NPCI Standard)
  const upiQuery = new URLSearchParams({
    pa: upiId.trim(),
    pn: payeeName.trim(),
    am: amount.toString(),
    cu: 'INR',
    tn: cleanNote,
  }).toString();

  const universalUpiUri = `upi://pay?${upiQuery}`;
  const gpayUri = `tez://upi/pay?${upiQuery}`;
  const phonepeUri = `phonepe://pay?${upiQuery}`;
  const paytmUri = `paytmmp://pay?${upiQuery}`;

  const handleLaunchApp = (targetUri: string, appName: string) => {
    // Detect mobile device
    const isMobile =
      typeof window !== 'undefined' &&
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');

    if (isMobile) {
      // Directly launch the UPI app on mobile
      window.location.href = targetUri;
      // Fallback to universal UPI if specialized intent does not open within 1.5s
      setTimeout(() => {
        window.location.href = universalUpiUri;
      }, 1500);
    } else {
      // On desktop, try launching protocol handler & show helpful guide
      window.location.href = universalUpiUri;
      setDesktopModalOpen(true);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId.trim());
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(amount.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2500);
  };

  return (
    <div className="w-full space-y-3.5 pt-2">
      <div className="text-center">
        <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5" /> Tap to Pay Directly via UPI App
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Opens your chosen UPI app on your mobile phone with recipient & amount pre-filled
        </p>
      </div>

      {/* Instant 1-Click UPI Payment App Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Google Pay */}
        <button
          type="button"
          onClick={() => handleLaunchApp(gpayUri, 'Google Pay')}
          className="group relative flex items-center justify-between p-3 rounded-2xl bg-[#0b1329] hover:bg-[#131f40] border border-blue-500/30 hover:border-blue-400 text-white transition shadow-md hover:shadow-blue-500/10 active:scale-[0.98]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-sm shrink-0">
              {/* Google Pay G Logo */}
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div className="text-left">
              <span className="text-xs font-bold block text-white">Google Pay</span>
              <span className="text-[10px] text-blue-300">Pay ₹{amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition" />
        </button>

        {/* PhonePe */}
        <button
          type="button"
          onClick={() => handleLaunchApp(phonepeUri, 'PhonePe')}
          className="group relative flex items-center justify-between p-3 rounded-2xl bg-[#160c2b] hover:bg-[#231345] border border-purple-500/30 hover:border-purple-400 text-white transition shadow-md hover:shadow-purple-500/10 active:scale-[0.98]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5f259f] flex items-center justify-center p-1.5 shadow-sm text-white font-black text-sm shrink-0">
              पे
            </div>
            <div className="text-left">
              <span className="text-xs font-bold block text-white">PhonePe</span>
              <span className="text-[10px] text-purple-300">Pay ₹{amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition" />
        </button>

        {/* Paytm */}
        <button
          type="button"
          onClick={() => handleLaunchApp(paytmUri, 'Paytm')}
          className="group relative flex items-center justify-between p-3 rounded-2xl bg-[#081829] hover:bg-[#0e2742] border border-cyan-500/30 hover:border-cyan-400 text-white transition shadow-md hover:shadow-cyan-500/10 active:scale-[0.98]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#002e6e] flex items-center justify-center p-1 shadow-sm shrink-0">
              <span className="text-[10px] font-black text-[#00b9f5] tracking-tight">Paytm</span>
            </div>
            <div className="text-left">
              <span className="text-xs font-bold block text-white">Paytm UPI</span>
              <span className="text-[10px] text-cyan-300">Pay ₹{amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition" />
        </button>

        {/* Any Other UPI App (CRED / BHIM / Navi) */}
        <button
          type="button"
          onClick={() => handleLaunchApp(universalUpiUri, 'Any UPI App')}
          className="group relative flex items-center justify-between p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 text-white transition shadow-md hover:shadow-amber-500/10 active:scale-[0.98]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center p-1.5 shadow-sm text-slate-950 font-black text-[11px] shrink-0">
              UPI
            </div>
            <div className="text-left">
              <span className="text-xs font-bold block text-white">Any UPI App</span>
              <span className="text-[10px] text-amber-300">BHIM / CRED / Navi / iMobile</span>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition" />
        </button>
      </div>

      {/* Manual UPI Details & One-Click Copy Section */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Admin UPI:</span>
          <span className="font-mono font-bold text-amber-400">{upiId}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyUpi}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 border border-slate-700 transition"
          >
            {copiedUpi ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied UPI</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy UPI ID</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyAmount}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 border border-slate-700 transition"
          >
            {copiedAmount ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied ₹</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>Copy ₹{amount}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Modal / Notice if clicked on computer */}
      {desktopModalOpen && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between font-bold text-amber-300">
            <span className="flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-amber-400" /> How to Pay via Phone:
            </span>
            <button
              type="button"
              onClick={() => setDesktopModalOpen(false)}
              className="text-[11px] text-slate-400 hover:text-white underline"
            >
              Dismiss
            </button>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            1. Open <strong>Google Pay</strong>, <strong>PhonePe</strong>, or <strong>Paytm</strong> on your mobile phone.<br />
            2. Tap <strong>&quot;Scan Any QR&quot;</strong> and point your camera at the QR code above.<br />
            3. The exact amount (<strong>₹{amount.toLocaleString('en-IN')}</strong>) and payee (<strong>{payeeName}</strong>) will automatically populate. Complete the transfer and copy your 12-digit UTR reference number below!
          </p>
        </div>
      )}

      {/* Security & Encryption Assurance Badge */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-0.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Official NPCI UPI Protocol • 256-Bit SSL Encrypted Direct Transfer to Club Account</span>
      </div>
    </div>
  );
}
