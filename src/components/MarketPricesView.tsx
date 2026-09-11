import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  DollarSign,
  MapPin,
  Truck,
  ArrowRight,
  Send,
  Sparkles,
  Calculator,
  RotateCw,
} from 'lucide-react';
import { MandiPrice, LanguageCode, UserProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface MarketPricesViewProps {
  currentLanguage: LanguageCode;
  user: UserProfile | null;
  onOpenWhatsApp: (customText?: string) => void;
}

export const MarketPricesView: React.FC<MarketPricesViewProps> = ({
  currentLanguage,
  user,
  onOpenWhatsApp,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [calcQuintals, setCalcQuintals] = useState<number>(25);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/mandi-prices');
      const data = await res.json();
      setPrices(data);
    } catch (err) {
      console.error('Mandi prices fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const filteredPrices = prices.filter((p) => {
    const matchesSearch =
      p.commodity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mandi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState === 'ALL' || p.state === selectedState;
    return matchesSearch && matchesState;
  });

  const states = Array.from(new Set(prices.map((p) => p.state)));

  return (
    <div className="max-w-6xl mx-auto w-full p-4 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 border border-amber-600/50 rounded-2xl p-4 sm:p-6 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Live Mandi Price Arbitrage
            </span>
            <span className="text-xs text-slate-400">APMC & Agmarknet Synced</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{t.marketPricesTitle}</h2>
          <p className="text-xs sm:text-sm text-amber-200/80">
            Real-time modal prices, 7-day rate momentum, and best nearby market profit arbitrage recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPrices}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-600/40 text-xs font-semibold text-amber-300 transition cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() =>
              onOpenWhatsApp(
                `*Daily APMC Mandi Rate Bulletin:*\n- Guntur Teja Chilli: ₹22,800/Q (+8.4%)\n- Warangal Cotton: ₹7,920/Q (+4.2%)\n- Nizamabad Turmeric: ₹16,800/Q (+14.8%)\n- Madanapalle Tomato: ₹3,500/Q\n*Tip:* Selling at nearby hub can fetch up to +₹1,400/Q extra profit!`
              )
            }
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-bold shadow transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast to WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Arbitrage Calculator Widget */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-700/40 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Nearby Market Arbitrage Profit Calculator</h4>
            <p className="text-slate-400 text-xs">
              Enter your harvest quantity to see how much extra net profit you earn by transporting to nearby high-paying mandis:
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl">
            <label className="text-slate-400 font-medium">Quantity:</label>
            <input
              type="number"
              min={1}
              value={calcQuintals}
              onChange={(e) => setCalcQuintals(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 bg-transparent text-white font-bold text-right focus:outline-none"
            />
            <span className="text-slate-300 font-semibold">Quintals</span>
          </div>

          <div className="bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-right">
            <span className="text-[10px] text-emerald-400 block font-semibold uppercase">Est. Added Profit</span>
            <span className="text-sm font-extrabold text-lime-400">
              +₹{(calcQuintals * 1400).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop, mandi (e.g. Red Chili, Cotton, Guntur, Warangal)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-emerald-800/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-emerald-800/60 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="ALL">All States / Regions</option>
          {states.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      </div>

      {/* Mandi Price Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrices.map((item) => {
          const isUp = item.priceTrend === 'UP';
          const isDown = item.priceTrend === 'DOWN';

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-800/50 hover:border-amber-500/50 transition-all shadow-xl space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-amber-300 border border-slate-700">
                      {item.variety}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {item.mandi} ({item.state})
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{item.commodity}</h3>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {isUp && <TrendingUp className="w-4 h-4 text-lime-400" />}
                    {isDown && <TrendingDown className="w-4 h-4 text-rose-400" />}
                    {!isUp && !isDown && <Minus className="w-4 h-4 text-slate-400" />}
                    <span
                      className={`text-xs font-bold ${
                        isUp ? 'text-lime-400' : isDown ? 'text-rose-400' : 'text-slate-400'
                      }`}
                    >
                      {item.pctChange7d > 0 ? `+${item.pctChange7d}%` : `${item.pctChange7d}%`}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">7-Day Trend</span>
                </div>
              </div>

              {/* Modal Price Showcase */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Current Modal Price</span>
                  <div className="text-2xl font-extrabold text-lime-300">
                    ₹{item.modalPrice.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-400">/ Quintal</span>
                  </div>
                </div>

                <div className="text-right text-xs space-y-0.5">
                  <div className="text-slate-400">
                    Min: <span className="font-semibold text-slate-200">₹{item.minPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-slate-400">
                    Max: <span className="font-semibold text-slate-200">₹{item.maxPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Best Nearby Mandi Arbitrage Alert */}
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-lime-400" />
                    Best Nearby Market Arbitrage:
                  </span>
                  <span className="font-extrabold text-lime-400">
                    +₹{item.extraProfitPerQuintal}/Q Extra
                  </span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  <strong>{item.bestNearbyMandi}</strong> is currently buying at higher rates ({item.distanceKm} km away).
                  For {calcQuintals} Quintals, net additional gain is <strong>+₹{(calcQuintals * item.extraProfitPerQuintal).toLocaleString('en-IN')}</strong>.
                </p>
              </div>

              {/* Footer action */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[11px] text-slate-400">
                  Demand: <strong className="text-amber-300">{item.demandLevel}</strong>
                </span>

                <button
                  onClick={() =>
                    onOpenWhatsApp(
                      `*APMC Mandi Arbitrage Alert for ${item.commodity}:*\n- Local Rate at ${item.mandi}: ₹${item.modalPrice}/Quintal\n- Best Nearby Rate at ${item.bestNearbyMandi} (${item.distanceKm} km): +₹${item.extraProfitPerQuintal}/Q higher!\n- On ${calcQuintals} Quintals, extra revenue is: +₹${(calcQuintals * item.extraProfitPerQuintal).toLocaleString('en-IN')}`
                    )
                  }
                  className="flex items-center gap-1 text-emerald-300 hover:text-white transition cursor-pointer font-semibold"
                >
                  <span>Share Arbitrage on WhatsApp</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
