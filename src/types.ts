export type LanguageCode = 'en' | 'te' | 'hi' | 'ml' | 'ta' | 'kn';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export interface UserProfile {
  id: string;
  name: string;
  identifier: string; // phone or email
  type: 'phone' | 'email';
  role: 'farmer' | 'officer';
  state: string;
  district: string;
  village: string;
  soilType: string;
  farmSizeAcres: number;
  primaryCrops: string[];
  waterSource: string;
  whatsAppConnected: boolean;
  whatsAppNumber?: string;
  verified: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language: LanguageCode;
  imageUrl?: string;
  category?: 'crop_selection' | 'disease' | 'weather' | 'market' | 'irrigation' | 'schemes' | 'officer_triage' | 'general';
  actionItems?: string[];
  metadata?: {
    recommendedCrop?: string;
    diseaseDetected?: string;
    confidence?: number;
    marketRecommendation?: string;
    urgentAlert?: boolean;
  };
}

export interface FarmTelemetry {
  fieldId: string;
  fieldName: string;
  crop: string;
  growthStage: string;
  soilMoisture: number; // % (ideal: 40-70%)
  soilTemperature: number; // °C
  nitrogen: number; // kg/ha (ideal: 120-280)
  phosphorus: number; // kg/ha (ideal: 30-60)
  potassium: number; // kg/ha (ideal: 150-300)
  soilPh: number; // (ideal: 6.0 - 7.5)
  ambientTemp: number; // °C
  ambientHumidity: number; // %
  rainfallChanceToday: number; // %
  leafWetness: number; // %
  irrigationPumpStatus: 'ACTIVE' | 'IDLE' | 'SCHEDULED';
  solarRadiation: number; // W/m²
  lastUpdated: string;
}

export interface MandiPrice {
  id: string;
  commodity: string;
  variety: string;
  mandi: string;
  district: string;
  state: string;
  minPrice: number; // Rs per Quintal
  maxPrice: number;
  modalPrice: number;
  priceTrend: 'UP' | 'DOWN' | 'STABLE';
  pctChange7d: number;
  demandLevel: 'VERY HIGH' | 'HIGH' | 'MODERATE' | 'LOW';
  bestNearbyMandi: string;
  distanceKm: number;
  extraProfitPerQuintal: number;
}

export interface HighExpansiveCrop {
  id: string;
  cropName: string;
  traditionalCropAlternative: string;
  investmentPerAcre: number; // Rs
  estimatedRevenuePerAcre: number; // Rs
  netProfitPerAcre: number; // Rs
  profitMultiplier: string; // e.g. "3.8x"
  harvestCycleMonths: number;
  suitabilityScore: number; // %
  climateRequirements: string;
  marketDemandReason: string;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  code: string;
  category: 'direct_income' | 'insurance' | 'solar_irrigation' | 'machinery' | 'soil_health' | 'organic_farming';
  benefitAmount: string;
  eligibility: string[];
  applicationDeadline: string;
  status: 'OPEN' | 'CLOSING_SOON' | 'ACTIVE';
  documentsNeeded: string[];
  officialPortalUrl: string;
  description: string;
}

export interface VillageRiskReport {
  villageId: string;
  villageName: string;
  district: string;
  state: string;
  totalFarmers: number;
  affectedAcres: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'NORMAL';
  primaryIssue: string; // e.g. "Pink Bollworm in Cotton", "Water Table Deficit", "Hailstorm Risk"
  immediateActionRequired: string;
  assignedOfficer: string;
  officerContact: string;
  lastInspectionDate: string;
}
