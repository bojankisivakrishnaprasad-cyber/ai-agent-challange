import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  FileText,
  Clock,
  Send,
  Award,
  Filter,
  DollarSign,
  Sun,
  Tractor,
} from 'lucide-react';
import { GovernmentScheme, LanguageCode, UserProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface SchemesViewProps {
  currentLanguage: LanguageCode;
  user: UserProfile | null;
  onOpenWhatsApp: (customText?: string) => void;
}

export const SchemesView: React.FC<SchemesViewProps> = ({
  currentLanguage,
  user,
  onOpenWhatsApp,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/schemes');
        const data = await res.json();
        setSchemes(data);
      } catch (err) {
        console.error('Schemes fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  const filteredSchemes = schemes.filter(
    (s) => selectedCategory === 'ALL' || s.category === selectedCategory
  );

  return (
    <div className="max-w-6xl mx-auto w-full p-4 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950 border border-blue-600/50 rounded-2xl p-4 sm:p-6 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Verified Government Welfare Schemes
            </span>
            <span className="text-xs text-slate-400">Direct Benefit Transfer (DBT) & Subsidies</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{t.schemesTitle}</h2>
          <p className="text-xs sm:text-sm text-blue-200/80">
            Check active central & state farmer support programs, solar irrigation grants, machinery subsidies, and crop insurance protections.
          </p>
        </div>

        <button
          onClick={() =>
            onOpenWhatsApp(
              `*Government Agricultural Schemes Guide:*\n- PM-KISAN: ₹6,000/yr direct income (Open)\n- PMFBY Crop Insurance: 2% premium protection against weather damage\n- PM-KUSUM: Up to 60% subsidy on Solar Water Pumps\n- SMAM: 40-50% subsidy on farm machinery & agri spray drones.\nApply via official national portals.`
            )
          }
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-bold shadow transition cursor-pointer self-start md:self-auto"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send Scheme List to WhatsApp</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'ALL', label: 'All Schemes' },
          { id: 'direct_income', label: 'Direct Cash Transfer (PM-KISAN)' },
          { id: 'insurance', label: 'Crop Insurance (PMFBY)' },
          { id: 'solar_irrigation', label: 'Solar Irrigation (PM-KUSUM)' },
          { id: 'machinery', label: 'Machinery & Drones (SMAM)' },
          { id: 'organic_farming', label: 'Protected Polyhouse (NHM)' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Schemes List */}
      <div className="space-y-4">
        {filteredSchemes.map((scheme) => (
          <div
            key={scheme.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-blue-500/60 transition shadow-xl space-y-4"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
                    {scheme.code}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Deadline: {scheme.applicationDeadline}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">{scheme.name}</h3>
                <p className="text-xs text-slate-300">{scheme.description}</p>
              </div>

              <div className="sm:text-right shrink-0">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Subsidy / Benefit</span>
                <span className="text-base font-extrabold text-lime-400">{scheme.benefitAmount}</span>
              </div>
            </div>

            {/* Eligibility & Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <div className="space-y-1.5">
                <span className="font-bold text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Eligibility Criteria:
                </span>
                <ul className="space-y-1 text-slate-300 pl-4 list-disc">
                  {scheme.eligibility.map((el, idx) => (
                    <li key={idx}>{el}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-blue-300 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  Mandatory Documents:
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {scheme.documentsNeeded.map((doc, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] border border-slate-700"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() =>
                  onOpenWhatsApp(
                    `*Government Scheme Details: ${scheme.name}*\n- Benefit: ${scheme.benefitAmount}\n- Status: ${scheme.status}\n- Portal: ${scheme.officialPortalUrl}\n- Eligibility: ${scheme.eligibility[0]}`
                  )
                }
                className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 font-semibold cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Share Details on WhatsApp</span>
              </button>

              <a
                href={scheme.officialPortalUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition cursor-pointer"
              >
                <span>Visit Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
