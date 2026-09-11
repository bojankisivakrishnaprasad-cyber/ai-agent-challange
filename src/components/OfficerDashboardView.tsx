import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Send,
  CheckCircle2,
  Users,
  MapPin,
  FileCheck,
  Activity,
  Megaphone,
  PhoneCall,
  Search,
  Filter,
} from 'lucide-react';
import { VillageRiskReport, LanguageCode, UserProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface OfficerDashboardViewProps {
  currentLanguage: LanguageCode;
  user: UserProfile | null;
  onOpenWhatsApp: (customText?: string) => void;
}

export const OfficerDashboardView: React.FC<OfficerDashboardViewProps> = ({
  currentLanguage,
  user,
  onOpenWhatsApp,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [reports, setReports] = useState<VillageRiskReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchVillage, setSearchVillage] = useState('');
  const [broadcastNotice, setBroadcastNotice] = useState<string | null>(null);

  useEffect(() => {
    const fetchTriage = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/officer-triage');
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error('Officer triage fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTriage();
  }, []);

  const handleBroadcastAlert = (village: VillageRiskReport) => {
    setBroadcastNotice(
      `Emergency WhatsApp Advisory broadcast dispatched to ${village.totalFarmers} registered farmers in ${village.villageName} (${village.district})!`
    );
    setTimeout(() => setBroadcastNotice(null), 5000);
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.villageName.toLowerCase().includes(searchVillage.toLowerCase()) ||
      r.district.toLowerCase().includes(searchVillage.toLowerCase()) ||
      r.primaryIssue.toLowerCase().includes(searchVillage.toLowerCase());
    const matchesLevel = filterLevel === 'ALL' || r.riskLevel === filterLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="max-w-6xl mx-auto w-full p-4 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-rose-950 border border-purple-600/50 rounded-2xl p-4 sm:p-6 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
              Agricultural Officer & Department Command Portal
            </span>
            <span className="text-xs text-slate-400">Village Vulnerability & Triage System</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{t.officerTriageTitle}</h2>
          <p className="text-xs sm:text-sm text-purple-200/80">
            Real-time geospatial hazard radar tracking pest outbreaks, drought stress hotspots, and rapid advisory dissemination across vulnerable mandals.
          </p>
        </div>

        <button
          onClick={() =>
            onOpenWhatsApp(
              `*Officer Command Priority Advisory:*\n- Warangal (Narsampet): CRITICAL Pink Bollworm in Bt Cotton. Deploy pheromone traps.\n- Anantapur (Kadiri): CRITICAL Soil Moisture Deficit (18%). Mobilize micro-sprinklers.\n- Guntur (Prathipadu): HIGH Thrips in Chilli. Blue sticky traps recommended.`
            )
          }
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-bold shadow transition cursor-pointer self-start md:self-auto"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Dispatch Officer Report to WhatsApp</span>
        </button>
      </div>

      {/* Broadcast Success Banner */}
      {broadcastNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-500/70 text-emerald-200 text-xs flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{broadcastNotice}</span>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <span className="text-xs text-slate-400 block font-medium">Monitored Villages</span>
          <span className="text-2xl font-extrabold text-white">48</span>
        </div>
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-700/40 text-center">
          <span className="text-xs text-rose-300 block font-medium">Critical Risk Areas</span>
          <span className="text-2xl font-extrabold text-rose-400">2 Villages</span>
        </div>
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-700/40 text-center">
          <span className="text-xs text-amber-300 block font-medium">High / Moderate Risk</span>
          <span className="text-2xl font-extrabold text-amber-400">3 Clusters</span>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-700/40 text-center">
          <span className="text-xs text-emerald-300 block font-medium">Registered Farmers</span>
          <span className="text-2xl font-extrabold text-lime-400">2,260</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchVillage}
            onChange={(e) => setSearchVillage(e.target.value)}
            placeholder="Search village, district, or pest threat (e.g. Warangal, Bollworm, Kadiri)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-purple-800/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto">
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                filterLevel === lvl
                  ? 'bg-purple-600 text-white border-purple-400 shadow'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Village Triage Cards */}
      <div className="space-y-4">
        {filteredReports.map((item) => {
          const isCrit = item.riskLevel === 'CRITICAL';
          const isHigh = item.riskLevel === 'HIGH';

          return (
            <div
              key={item.villageId}
              className={`p-5 rounded-2xl bg-slate-900/95 border transition shadow-xl space-y-4 ${
                isCrit
                  ? 'border-rose-600/70'
                  : isHigh
                  ? 'border-amber-600/60'
                  : 'border-slate-700/80'
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider ${
                        isCrit
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                          : isHigh
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {item.riskLevel} RISK
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-400" />
                      {item.villageName}, {item.district} ({item.state})
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1.5">{item.primaryIssue}</h3>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Impacted Scale</span>
                  <div className="text-sm font-bold text-slate-200">
                    {item.totalFarmers} Farmers • <span className="text-rose-400">{item.affectedAcres} Acres</span>
                  </div>
                </div>
              </div>

              {/* Action Prescription Box */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-lime-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-lime-400" />
                  Mandatory Immediate Field Action Required:
                </span>
                <p className="text-slate-200 leading-relaxed">{item.immediateActionRequired}</p>
              </div>

              {/* Footer Officer Details & Broadcast button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-xs">
                <div className="text-slate-400 flex items-center gap-2 text-[11px]">
                  <span>Field Officer: <strong>{item.assignedOfficer}</strong></span>
                  <span>•</span>
                  <span className="text-slate-300">{item.officerContact}</span>
                  <span>•</span>
                  <span>Inspected: {item.lastInspectionDate}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBroadcastAlert(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow transition cursor-pointer"
                  >
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>Broadcast SMS/WhatsApp Alert</span>
                  </button>

                  <button
                    onClick={() =>
                      onOpenWhatsApp(
                        `*URGENT ADVISORY for ${item.villageName} (${item.district}) Farmers:*\n- Threat: ${item.primaryIssue}\n- Required Action: ${item.immediateActionRequired}\n- Assigned Officer: ${item.assignedOfficer} (${item.officerContact})`
                      )
                    }
                    className="p-1.5 rounded-lg bg-green-700 hover:bg-green-600 text-white cursor-pointer"
                    title="Forward via WhatsApp"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
