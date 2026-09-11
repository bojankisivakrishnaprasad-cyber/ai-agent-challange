import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  Droplets,
  Sun,
  Thermometer,
  Wind,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Power,
  Layers,
  Sprout,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { FarmTelemetry, LanguageCode, UserProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface CloudFarmViewProps {
  currentLanguage: LanguageCode;
  user: UserProfile | null;
  onOpenWhatsApp: (customText?: string) => void;
}

export const CloudFarmView: React.FC<CloudFarmViewProps> = ({
  currentLanguage,
  user,
  onOpenWhatsApp,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [telemetry, setTelemetry] = useState<FarmTelemetry | null>(null);
  const [loading, setLoading] = useState(false);
  const [irrigationLoading, setIrrigationLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/farm-telemetry');
      const data = await res.json();
      setTelemetry(data);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Telemetry fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleIrrigation = async (action: 'START' | 'STOP') => {
    setIrrigationLoading(true);
    try {
      const res = await fetch('/api/farm-telemetry/irrigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        setTelemetry(data.telemetry);
      }
    } catch (err) {
      console.error('Irrigation toggle error:', err);
    } finally {
      setIrrigationLoading(false);
    }
  };

  if (!telemetry) {
    return (
      <div className="flex items-center justify-center h-96 text-emerald-300 gap-2">
        <Activity className="w-5 h-5 animate-spin" />
        <span>Loading Cloud Farm Telemetry...</span>
      </div>
    );
  }

  const isMoistureDry = telemetry.soilMoisture < 35;
  const isPumpActive = telemetry.irrigationPumpStatus === 'ACTIVE';

  return (
    <div className="max-w-6xl mx-auto w-full p-4 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 border border-emerald-700/60 rounded-2xl p-4 sm:p-6 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Cloud Farm IoT Live
            </span>
            <span className="text-xs text-slate-400">Node ID: {telemetry.fieldId}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            {user?.village ? `${user.village} Farm Cluster` : telemetry.fieldName}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/80">
            Active Crop: <strong>{user?.primaryCrops?.join(', ') || telemetry.crop}</strong> • Stage: {telemetry.growthStage}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTelemetry}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-emerald-700/40 text-xs font-semibold text-emerald-300 transition cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync ({lastRefreshed})</span>
          </button>

          <button
            onClick={() =>
              onOpenWhatsApp(
                `*Daily Cloud Farm Telemetry Report:*\n- Soil Moisture: ${telemetry.soilMoisture}%\n- Field Temp: ${telemetry.ambientTemp}°C\n- Irrigation Status: ${telemetry.irrigationPumpStatus}\n- N-P-K: ${telemetry.nitrogen}-${telemetry.phosphorus}-${telemetry.potassium} kg/ha`
              )
            }
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-bold shadow-md transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Telemetry to WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Critical Moisture Warning Alert if dry */}
      {isMoistureDry && (
        <div className="p-4 rounded-xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-between gap-4 text-amber-200 text-sm animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <h4 className="font-bold text-white">Soil Moisture Deficit Alert ({telemetry.soilMoisture}%)</h4>
              <p className="text-xs text-amber-300">
                Topsoil moisture is below the 35% safe threshold for flowering crops. Recommended action: Trigger drip irrigation for 45 minutes to prevent flower drop.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggleIrrigation('START')}
            disabled={irrigationLoading || isPumpActive}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow"
          >
            {isPumpActive ? 'Pump Running' : 'Trigger Drip Now'}
          </button>
        </div>
      )}

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Soil Moisture */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-700/50 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Soil Moisture</span>
            <Droplets className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{telemetry.soilMoisture}%</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isMoistureDry ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
              {isMoistureDry ? 'DRY / WATER STRESS' : 'OPTIMAL'}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${isMoistureDry ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{ width: `${Math.min(100, telemetry.soilMoisture)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400">Target Range: 45% - 70% for active growth</p>
        </div>

        {/* Field Temp & Humidity */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-700/50 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Microclimate & Heat</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{telemetry.ambientTemp}°C</span>
            <span className="text-xs text-slate-300">Humidity: {telemetry.ambientHumidity}%</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Soil Temp: {telemetry.soilTemperature}°C</span>
            <span>Solar: {telemetry.solarRadiation} W/m²</span>
          </div>
        </div>

        {/* Rain Chance & Leaf Wetness */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-700/50 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Precipitation Forecast</span>
            <CloudRain className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{telemetry.rainfallChanceToday}%</span>
            <span className="text-xs text-emerald-300 font-semibold">Low Rain Risk</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Leaf Wetness: {telemetry.leafWetness}% (Fungal infection risk is LOW)
          </p>
        </div>

        {/* Smart Irrigation Pump Status */}
        <div className={`p-4 rounded-2xl border shadow-lg space-y-3 transition ${isPumpActive ? 'bg-emerald-950/60 border-emerald-400' : 'bg-slate-900/90 border-emerald-700/50'}`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Remote Drip Pump</span>
            <Power className={`w-4 h-4 ${isPumpActive ? 'text-lime-400 animate-pulse' : 'text-slate-500'}`} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className={`text-xl font-bold ${isPumpActive ? 'text-lime-300' : 'text-slate-300'}`}>
                {telemetry.irrigationPumpStatus}
              </span>
              <p className="text-[10px] text-slate-400">Submersible 5HP Solar Linked</p>
            </div>

            {isPumpActive ? (
              <button
                onClick={() => handleToggleIrrigation('STOP')}
                disabled={irrigationLoading}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Stop Pump
              </button>
            ) : (
              <button
                onClick={() => handleToggleIrrigation('START')}
                disabled={irrigationLoading}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Start Pump
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Soil Nutrients (NPK) & Soil Health Card Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-emerald-700/50 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-lime-400" />
              <h3 className="text-base font-bold text-white">Soil Health & N-P-K Nutrient Analysis</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Soil pH: {telemetry.soilPh} (Neutral Optimal)
            </span>
          </div>

          <div className="space-y-4">
            {/* Nitrogen */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Nitrogen (N) - Vegetative Canopy Growth</span>
                <span className="font-bold text-white">{telemetry.nitrogen} kg/ha (Medium)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '58%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Deficient (&lt;120)</span>
                <span>Optimal (150-250)</span>
                <span>High (&gt;280)</span>
              </div>
            </div>

            {/* Phosphorus */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Phosphorus (P) - Root Mass & Early Flowering</span>
                <span className="font-bold text-white">{telemetry.phosphorus} kg/ha (Optimal)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Deficient (&lt;25)</span>
                <span>Optimal (35-60)</span>
                <span>High (&gt;75)</span>
              </div>
            </div>

            {/* Potassium */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">Potassium (K) - Boll Formation & Pest Immunity</span>
                <span className="font-bold text-white">{telemetry.potassium} kg/ha (Optimal)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Deficient (&lt;120)</span>
                <span>Optimal (180-280)</span>
                <span>High (&gt;320)</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-lime-300">Fertigation Prescription for Flowering Stage:</span>
            <p>
              Apply 19:19:19 (Water Soluble NPK) @ 3 kg/acre via drip fertigation tank. Add Zinc Sulphate (0.5%) foliar spray to prevent zinc chlorosis in black cotton soil.
            </p>
          </div>
        </div>

        {/* Satellite Multispectral & Field Radar */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-700/50 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-lime-400" />
              <h3 className="text-base font-bold text-white">Satellite NDVI Health</h3>
            </div>
            <span className="text-xs font-bold text-lime-400">NDVI: 0.74 (Vigorous)</span>
          </div>

          {/* Visual Field Grid Representation */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Plot 1 (North): 98% Healthy</span>
              <span>Plot 2 (South): 88% Healthy</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 h-28">
              <div className="bg-emerald-600/80 rounded flex items-center justify-center text-[10px] font-bold text-white">A1</div>
              <div className="bg-emerald-600/80 rounded flex items-center justify-center text-[10px] font-bold text-white">A2</div>
              <div className="bg-emerald-600/90 rounded flex items-center justify-center text-[10px] font-bold text-white">A3</div>
              <div className="bg-emerald-600/80 rounded flex items-center justify-center text-[10px] font-bold text-white">A4</div>
              <div className="bg-emerald-600/90 rounded flex items-center justify-center text-[10px] font-bold text-white">B1</div>
              <div className="bg-amber-600/80 rounded flex items-center justify-center text-[10px] font-bold text-slate-950" title="Mild moisture stress">B2</div>
              <div className="bg-emerald-600/80 rounded flex items-center justify-center text-[10px] font-bold text-white">B3</div>
              <div className="bg-emerald-600/90 rounded flex items-center justify-center text-[10px] font-bold text-white">B4</div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-emerald-500"></span> Healthy Canopy
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-amber-500"></span> Mild Stress (B2)
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Sentinel-2 Pass:</span>
              <span className="font-semibold text-white">Today 10:45 AM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Canopy Temperature:</span>
              <span className="font-semibold text-white">26.8°C (Normal)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Pest Infestation Risk:</span>
              <span className="font-semibold text-lime-400">Low (Pheromone traps cleared)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
