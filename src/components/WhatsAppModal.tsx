import React, { useState } from 'react';
import {
  X,
  Smartphone,
  CheckCircle2,
  Send,
  ExternalLink,
  MessageSquare,
  Bot,
  Bell,
  Sparkles,
  ArrowRight,
  Copy,
} from 'lucide-react';
import { LanguageCode, UserProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  initialText?: string;
  currentLanguage: LanguageCode;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  user,
  initialText,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [phone, setPhone] = useState(user?.whatsAppNumber || user?.identifier || '+91 98765 43210');
  const [advisoryText, setAdvisoryText] = useState(
    initialText ||
      `*KisanAI Daily Agro-Bulletin:*\n- *Current Weather:* 33.5°C, 64% Humidity (Low Rain 15%)\n- *Mandi Arbitrage:* Teja Chilli @ Guntur: ₹22,800/Q (+8.4%)\n- *Soil Advisory:* Soil moisture is 32.4% (Drip irrigation triggered)\n- *Pest Alert:* Pheromone traps recommended for Cotton plots.\n_Reply with 1 for Mandi Rates, 2 for Disease Diagnosis, 3 for Schemes._`
  );
  const [simulatedDelivered, setSimulatedDelivered] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSendSimulated = async () => {
    try {
      await fetch('/api/whatsapp/send-advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          advisoryText,
          category: 'Agro Advisory',
        }),
      });
      setSimulatedDelivered(true);
      setTimeout(() => setSimulatedDelivered(false), 4000);
    } catch (err) {
      console.error('WhatsApp send error:', err);
    }
  };

  const handleOpenNativeWhatsApp = () => {
    const encodedText = encodeURIComponent(advisoryText);
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
    window.open(url, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(advisoryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-green-700/60 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-green-950 to-slate-900 border-b border-green-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-400/30 flex items-center justify-center text-green-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">KisanAI WhatsApp Connect Center</h3>
              <p className="text-xs text-green-300/80">Real-time Farmer Messaging & Click-to-Chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Status badge */}
          <div className="p-3 rounded-xl bg-green-950/50 border border-green-600/50 flex items-center justify-between text-green-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></span>
              <span>
                WhatsApp Channel: <strong>KisanAI Agro Bot (+91-98765-KISAN)</strong>
              </span>
            </div>
            <span className="font-bold text-green-400">ONLINE</span>
          </div>

          {/* Recipient Phone Input */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Farmer / Officer WhatsApp Number:
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-slate-300">Message / Advisory Content:</label>
              <button
                onClick={handleCopy}
                className="text-[11px] text-green-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
            <textarea
              rows={6}
              value={advisoryText}
              onChange={(e) => setAdvisoryText(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-green-700/50 rounded-xl text-white font-mono text-xs focus:outline-none leading-relaxed"
            />
          </div>

          {/* Delivery Simulation Feedback */}
          {simulatedDelivered && (
            <div className="p-3 rounded-lg bg-emerald-950/90 border border-emerald-500 text-emerald-200 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Advisory dispatched to {phone} via WhatsApp Cloud API!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleOpenNativeWhatsApp}
              className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Launch WhatsApp Web / App (Click-to-Chat)</span>
            </button>

            <button
              onClick={handleSendSimulated}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-green-300 font-semibold text-xs border border-green-600/40 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Simulate Cloud WhatsApp Webhook Dispatch</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Supports WhatsApp Business API webhooks, automated morning bulletins, and pest photo reception.
          </p>
        </div>
      </div>
    </div>
  );
};
