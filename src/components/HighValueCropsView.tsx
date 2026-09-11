import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Wheat,
  Calculator,
  Send,
  HelpCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { HighExpansiveCrop, LanguageCode, UserProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface HighValueCropsViewProps {
  currentLanguage: LanguageCode;
  user: UserProfile | null;
  onOpenWhatsApp: (customText?: string) => void;
}

export const HighValueCropsView: React.FC<HighValueCropsViewProps> = ({
  currentLanguage,
  user,
  onOpenWhatsApp,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [crops, setCrops] = useState<HighExpansiveCrop[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAcres, setSelectedAcres] = useState<number>(user?.farmSizeAcres || 2);

  useEffect(() => {
    const fetchCrops = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/high-value-crops');
        const data = await res.json();
        setCrops(data);
      } catch (err) {
        console.error('High value crops fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCrops();
  }, []);

  return (
    <div className="max-w-6xl mx-auto w-full p-4 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-600/50 rounded-2xl p-4 sm:p-6 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-lime-400/20 text-lime-300 border border-lime-400/40 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-lime-400" />
              High Expansive & High Income Crops
            </span>
            <span className="text-xs text-slate-400">Crop Diversification Intelligence</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{t.highDemandCropsTitle}</h2>
          <p className="text-xs sm:text-sm text-emerald-200/80">
            Compare traditional low-margin monocultures with high-demand cash crops, protected polyhouse horticulture, and superfoods yielding up to 5x higher net income per acre.
          </p>
        </div>

        {/* Acreage Interactive Slider */}
        <div className="bg-slate-950/80 border border-emerald-600/40 p-3 rounded-xl flex items-center gap-3">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Your Land Size:</span>
            <span className="text-lg font-extrabold text-lime-400">{selectedAcres} Acres</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={0.5}
            value={selectedAcres}
            onChange={(e) => setSelectedAcres(parseFloat(e.target.value))}
            className="w-28 sm:w-36 accent-lime-400 cursor-pointer"
          />
        </div>
      </div>

      {/* High-Value Crop Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {crops.map((crop) => {
          const totalInvestment = crop.investmentPerAcre * selectedAcres;
          const totalRevenue = crop.estimatedRevenuePerAcre * selectedAcres;
          const totalNetProfit = crop.netProfitPerAcre * selectedAcres;

          return (
            <div
              key={crop.id}
              className="p-5 rounded-2xl bg-slate-900/95 border border-emerald-800/60 hover:border-lime-500/60 transition shadow-xl space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600/30 text-lime-300 border border-emerald-500/30">
                      {crop.profitMultiplier}
                    </span>
                    <span className="text-xs text-slate-400">
                      Harvest in {crop.harvestCycleMonths} months
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{crop.cropName}</h3>
                  <p className="text-xs text-slate-400">
                    Replaces low-yield: <strong className="text-amber-300">{crop.traditionalCropAlternative}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Soil Suitability</span>
                  <span className="text-base font-extrabold text-lime-400">{crop.suitabilityScore}%</span>
                </div>
              </div>

              {/* Financial Breakdown Table for Selected Acres */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Est. Setup Cost</span>
                  <p className="text-xs sm:text-sm font-bold text-slate-200">
                    ₹{totalInvestment.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[9px] text-slate-500 font-normal">({selectedAcres} Acres)</span>
                </div>

                <div className="space-y-0.5 border-x border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-medium">Gross Return</span>
                  <p className="text-xs sm:text-sm font-bold text-emerald-300">
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[9px] text-slate-500 font-normal">({selectedAcres} Acres)</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] text-lime-400 uppercase font-bold">Net Profit</span>
                  <p className="text-xs sm:text-sm font-extrabold text-lime-400">
                    +₹{totalNetProfit.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[9px] text-lime-500/80 font-semibold">(Est. Income)</span>
                </div>
              </div>

              {/* Climate & Market Reasons */}
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <Layers className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Climate & Soil:</strong> {crop.climateRequirements}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Demand Driver:</strong> {crop.marketDemandReason}
                  </span>
                </div>
              </div>

              {/* WhatsApp Advisory Share */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-medium">
                  Subsidies: Eligible for 50% NHM / MIDH assistance
                </span>

                <button
                  onClick={() =>
                    onOpenWhatsApp(
                      `*High-Income Crop Feasibility Report for ${crop.cropName}:*\n- Land Size: ${selectedAcres} Acres\n- Expected Net Profit: ₹${totalNetProfit.toLocaleString('en-IN')} (${crop.profitMultiplier})\n- Replaces: ${crop.traditionalCropAlternative}\n- Suitable Climate: ${crop.climateRequirements}`
                    )
                  }
                  className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 font-semibold cursor-pointer transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Feasibility to WhatsApp</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
