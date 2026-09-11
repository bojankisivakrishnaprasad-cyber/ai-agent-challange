import React, { useState } from 'react';
import { X, Smartphone, Mail, Lock, ShieldCheck, CheckCircle2, User, MapPin, Layers, Wheat, ArrowRight, KeyRound, Sparkles } from 'lucide-react';
import { LanguageCode, UserProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile, token: string) => void;
  currentLanguage: LanguageCode;
  currentUser: UserProfile | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  currentLanguage,
  currentUser,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [mode, setMode] = useState<'login' | 'register' | 'otp_verify'>('login');
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpPreviewNotification, setOtpPreviewNotification] = useState<string | null>(null);

  // Register Fields
  const [name, setName] = useState('');
  const [role, setRole] = useState<'farmer' | 'officer'>('farmer');
  const [stateName, setStateName] = useState('Andhra Pradesh');
  const [district, setDistrict] = useState('Guntur');
  const [village, setVillage] = useState('Prathipadu');
  const [soilType, setSoilType] = useState('Black Cotton Clay Loam');
  const [farmSize, setFarmSize] = useState('4.5');
  const [primaryCrops, setPrimaryCrops] = useState('Cotton, Teja Chilli, Paddy');
  const [waterSource, setWaterSource] = useState('Borewell & Drip Line');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Trigger Send OTP
  const handleSendOtp = async (targetId?: string) => {
    const idToSend = targetId || identifier;
    if (!idToSend) {
      setError('Please provide a phone number or email first');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: idToSend, type: authMethod }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setOtpPreviewNotification(data.devOtpPreview);
      setSuccessMsg(`OTP sent to ${idToSend}. (Sandbox test OTP: ${data.devOtpPreview})`);
      setMode('otp_verify');
    } catch (err: any) {
      setError(err.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  // Login with Password or OTP
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError('Please enter your phone number or email');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          password: password || undefined,
          otp: otpCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  // Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !identifier || !password) {
      setError('Name, phone/email, and password are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          identifier,
          type: authMethod,
          password,
          role,
          state: stateName,
          district,
          village,
          soilType,
          farmSizeAcres: parseFloat(farmSize) || 2,
          primaryCrops: primaryCrops.split(',').map((c) => c.trim()),
          waterSource,
          otp: otpCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  // Demo Login Quick Action
  const handleDemoLogin = async (demoRole: 'farmer' | 'officer') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: demoRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Demo login failed');

      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-700/60 rounded-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 to-slate-900 border-b border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {currentUser ? 'Farmer Profile & Security' : mode === 'register' ? 'Register New Farm Account' : 'KisanAI Secure Sign In'}
              </h3>
              <p className="text-xs text-emerald-300/80">
                Salted Hashed Storage • OTP Verification • WhatsApp Connected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OTP Toast Notification Banner if simulated */}
        {otpPreviewNotification && (
          <div className="bg-amber-950/90 border-b border-amber-600/50 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Verification OTP Sent:</strong> Code is <span className="font-mono text-white text-sm bg-amber-900/80 px-2 py-0.5 rounded border border-amber-500 font-bold">{otpPreviewNotification}</span>
              </span>
            </div>
            <button
              onClick={() => setOtpCode(otpPreviewNotification)}
              className="text-[11px] bg-amber-600 text-white font-bold px-2 py-1 rounded hover:bg-amber-500 cursor-pointer"
            >
              Auto-Fill
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-600/50 text-rose-200 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-600/50 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Demo Login Options */}
          {!currentUser && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                  Instant Test (No typing needed):
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('farmer')}
                  disabled={loading}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-700/60 hover:bg-emerald-600/80 text-white text-xs font-semibold border border-emerald-500/40 transition cursor-pointer"
                >
                  <Wheat className="w-3.5 h-3.5 text-lime-300" />
                  <span>Demo Farmer (Ramesh)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('officer')}
                  disabled={loading}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-amber-500/40 transition cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Demo Officer (Dr. Sharma)</span>
                </button>
              </div>
            </div>
          )}

          {/* Existing User Profile Preview */}
          {currentUser ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-emerald-700/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-bold text-lg">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">{currentUser.name}</h4>
                      <p className="text-xs text-emerald-400">{currentUser.identifier} • {currentUser.role.toUpperCase()}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-700/60">
                  <div>
                    <span className="text-slate-400">Location:</span>
                    <p className="font-semibold text-white">{currentUser.village}, {currentUser.district}, {currentUser.state}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Soil Type:</span>
                    <p className="font-semibold text-white">{currentUser.soilType}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Land Holding:</span>
                    <p className="font-semibold text-white">{currentUser.farmSizeAcres} Acres</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Primary Crops:</span>
                    <p className="font-semibold text-white">{currentUser.primaryCrops.join(', ')}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-green-950/40 border border-green-700/50 flex items-center justify-between text-xs text-green-200">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-green-400" />
                  <span>WhatsApp Alerts connected to: <strong>{currentUser.whatsAppNumber || currentUser.identifier}</strong></span>
                </div>
                <span className="font-bold text-green-400">ACTIVE</span>
              </div>
            </div>
          ) : (
            <>
              {/* Tab Selector: Login vs Register */}
              <div className="flex rounded-lg bg-slate-800 p-1 border border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                    mode === 'login' || mode === 'otp_verify' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                    mode === 'register' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Register Farm
                </button>
              </div>

              {/* Form Content */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Phone Number or Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        {authMethod === 'phone' ? <Smartphone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                      </div>
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. 9876543210 or farmer@gmail.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-slate-300">Password</label>
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                      >
                        Login via OTP instead?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loading ? 'Authenticating...' : 'Sign In with Password'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={loading}
                      className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold text-xs border border-emerald-600/40 transition cursor-pointer flex items-center gap-1"
                      title="Send verification OTP to mobile/email"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Send OTP</span>
                    </button>
                  </div>
                </form>
              )}

              {/* OTP Verification Screen */}
              {mode === 'otp_verify' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-sm font-semibold text-white">Enter 6-Digit OTP Code</p>
                    <p className="text-xs text-slate-400">Sent to {identifier}</p>
                  </div>

                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="0 0 0 0 0 0"
                      className="w-full text-center tracking-widest text-xl font-bold py-3 bg-slate-800 border border-emerald-500/60 rounded-xl text-lime-400 placeholder-slate-600 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={loading || otpCode.length < 6}
                      className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Verifying...' : 'Verify OTP & Enter'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="px-3 py-2.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Register Mode */}
              {mode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Patel"
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Account Role</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                      >
                        <option value="farmer">Farmer / Landholder</option>
                        <option value="officer">Agriculture Officer / Extension</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Mobile / Email</label>
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="9876543210"
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Choose password"
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">State</label>
                      <input
                        type="text"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">District</label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Acres</label>
                      <input
                        type="number"
                        step="0.5"
                        value={farmSize}
                        onChange={(e) => setFarmSize(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Primary Crops & Soil</label>
                    <input
                      type="text"
                      value={primaryCrops}
                      onChange={(e) => setPrimaryCrops(e.target.value)}
                      placeholder="e.g. Cotton, Teja Chilli, Paddy"
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-500 hover:to-lime-500 text-white font-bold text-sm shadow-md transition cursor-pointer"
                  >
                    {loading ? 'Creating Salted Hashed Account...' : 'Register Farm & Connect Cloud'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
