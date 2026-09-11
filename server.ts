import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { MANDI_PRICES, HIGH_EXPANSIVE_CROPS, GOVERNMENT_SCHEMES, VILLAGE_RISK_REPORTS, INITIAL_TELEMETRY } from './src/data/agriData';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// In-memory persistent state
interface StoredUser {
  id: string;
  name: string;
  identifier: string; // phone or email
  type: 'phone' | 'email';
  passwordHash: string;
  salt: string;
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
  createdAt: string;
}

const usersDb = new Map<string, StoredUser>();
const otpStore = new Map<string, { otp: string; expiresAt: number }>();
let currentTelemetry = { ...INITIAL_TELEMETRY };

// Helper function to hash password with salt
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const userSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, userSalt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt: userSalt };
}

// Seed demo users (Farmer & Officer)
const farmerSalt = 'salt_kisan_demo_farmer_2026';
const officerSalt = 'salt_kisan_demo_officer_2026';
usersDb.set('9876543210', {
  id: 'usr_farmer_demo',
  name: 'Ramesh Patel',
  identifier: '9876543210',
  type: 'phone',
  passwordHash: hashPassword('farmer123', farmerSalt).hash,
  salt: farmerSalt,
  role: 'farmer',
  state: 'Andhra Pradesh',
  district: 'Guntur',
  village: 'Prathipadu',
  soilType: 'Black Cotton Clay Loam',
  farmSizeAcres: 4.5,
  primaryCrops: ['Cotton (Bt)', 'Chilli (Teja)'],
  waterSource: 'Borewell & Drip Irrigation',
  whatsAppConnected: true,
  whatsAppNumber: '+91 98765 43210',
  verified: true,
  createdAt: new Date().toISOString(),
});

usersDb.set('officer@kisan.gov.in', {
  id: 'usr_officer_demo',
  name: 'Dr. Ananya Sharma',
  identifier: 'officer@kisan.gov.in',
  type: 'email',
  passwordHash: hashPassword('officer123', officerSalt).hash,
  salt: officerSalt,
  role: 'officer',
  state: 'Telangana',
  district: 'Warangal',
  village: 'District Agri HQ',
  soilType: 'Mixed Red & Black Loam',
  farmSizeAcres: 0,
  primaryCrops: ['District Triage / All Crops'],
  waterSource: 'Regional Water Authority',
  whatsAppConnected: true,
  whatsAppNumber: '+91 91234 56789',
  verified: true,
  createdAt: new Date().toISOString(),
});

// Gemini Client initialization (server-side only)
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// --- API ROUTES ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'KisanAI Agriculture Management Agent',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString(),
  });
});

// Auth: Send OTP
app.post('/api/auth/send-otp', (req, res) => {
  const { identifier, type } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'Identifier (phone or email) is required' });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins
  otpStore.set(identifier, { otp, expiresAt });

  console.log(`[OTP Sent] Identifier: ${identifier}, OTP: ${otp}`);

  res.json({
    success: true,
    message: `OTP sent successfully to ${identifier}`,
    // Included for smooth sandbox testing & instant verification
    devOtpPreview: otp,
    expiresInSeconds: 300,
  });
});

// Auth: Register
app.post('/api/auth/register', (req, res) => {
  const {
    name,
    identifier,
    type,
    password,
    role = 'farmer',
    state = 'Andhra Pradesh',
    district = 'Guntur',
    village = 'Local Village',
    soilType = 'Black Cotton Soil',
    farmSizeAcres = 3,
    primaryCrops = ['Cotton', 'Paddy'],
    waterSource = 'Borewell',
    otp,
  } = req.body;

  if (!identifier || !password || !name) {
    return res.status(400).json({ error: 'Name, phone/email, and password are required' });
  }

  // Optional OTP verification if provided
  if (otp) {
    const storedOtp = otpStore.get(identifier);
    if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired OTP code' });
    }
    otpStore.delete(identifier);
  }

  const { hash, salt } = hashPassword(password);
  const user: StoredUser = {
    id: `usr_${Date.now()}`,
    name,
    identifier,
    type: type || (identifier.includes('@') ? 'email' : 'phone'),
    passwordHash: hash,
    salt,
    role: role === 'officer' ? 'officer' : 'farmer',
    state,
    district,
    village,
    soilType,
    farmSizeAcres: Number(farmSizeAcres) || 2,
    primaryCrops: Array.isArray(primaryCrops) ? primaryCrops : [primaryCrops],
    waterSource,
    whatsAppConnected: true,
    whatsAppNumber: identifier.includes('@') ? undefined : identifier,
    verified: true,
    createdAt: new Date().toISOString(),
  };

  usersDb.set(identifier, user);

  // Return safe profile
  const { passwordHash: _, salt: __, ...safeUser } = user;
  res.json({ success: true, user: safeUser, token: `token_${user.id}` });
});

// Auth: Login with password or OTP
app.post('/api/auth/login', (req, res) => {
  const { identifier, password, otp } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'Phone or email is required' });
  }

  const user = usersDb.get(identifier);
  if (!user) {
    return res.status(404).json({ error: 'Account not found. Please register first or use Demo Login.' });
  }

  // If logging in via OTP
  if (otp) {
    const storedOtp = otpStore.get(identifier);
    if (!storedOtp || storedOtp.otp !== otp || Date.now() > storedOtp.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired OTP code' });
    }
    otpStore.delete(identifier);
  } else if (password) {
    // Password check
    const { hash } = hashPassword(password, user.salt);
    if (hash !== user.passwordHash) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
  } else {
    return res.status(400).json({ error: 'Either password or OTP must be provided' });
  }

  const { passwordHash: _, salt: __, ...safeUser } = user;
  res.json({ success: true, user: safeUser, token: `token_${user.id}` });
});

// Auth: Demo Login
app.post('/api/auth/demo-login', (req, res) => {
  const { role } = req.body;
  const identifier = role === 'officer' ? 'officer@kisan.gov.in' : '9876543210';
  const user = usersDb.get(identifier);
  if (!user) {
    return res.status(500).json({ error: 'Demo user not seeded' });
  }

  const { passwordHash: _, salt: __, ...safeUser } = user;
  res.json({ success: true, user: safeUser, token: `token_${user.id}` });
});

// Telemetry & Smart Irrigation
app.get('/api/farm-telemetry', (req, res) => {
  res.json(currentTelemetry);
});

app.post('/api/farm-telemetry/irrigate', (req, res) => {
  const { action } = req.body; // 'START' | 'STOP'
  if (action === 'START') {
    currentTelemetry.irrigationPumpStatus = 'ACTIVE';
    currentTelemetry.soilMoisture = Math.min(68, currentTelemetry.soilMoisture + 12);
  } else {
    currentTelemetry.irrigationPumpStatus = 'IDLE';
  }
  currentTelemetry.lastUpdated = 'Just now (Updated by Remote Valve Trigger)';
  res.json({ success: true, telemetry: currentTelemetry });
});

// Mandi Prices
app.get('/api/mandi-prices', (req, res) => {
  res.json(MANDI_PRICES);
});

// High Expansive & Profitable Crops
app.get('/api/high-value-crops', (req, res) => {
  res.json(HIGH_EXPANSIVE_CROPS);
});

// Government Schemes
app.get('/api/schemes', (req, res) => {
  res.json(GOVERNMENT_SCHEMES);
});

// Officer Village Triage
app.get('/api/officer-triage', (req, res) => {
  res.json(VILLAGE_RISK_REPORTS);
});

// WhatsApp Dispatch Simulator
app.post('/api/whatsapp/send-advisory', (req, res) => {
  const { phone, advisoryText, category } = req.body;
  res.json({
    success: true,
    message: `WhatsApp advisory successfully queued for ${phone || '+91-Verified-Farmer'}`,
    timestamp: new Date().toISOString(),
    status: 'DELIVERED',
    category: category || 'Advisory',
    advisoryPreview: advisoryText?.slice(0, 140) + '...',
  });
});

// Comprehensive AI Chat with Gemini 3.8 Flash
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language = 'en', userProfile, imageBase64, mimeType = 'image/jpeg', conversationHistory = [] } = req.body;

    if (!message && !imageBase64) {
      return res.status(400).json({ error: 'Message or image is required' });
    }

    const ai = getGeminiClient();

    // Multilingual instructions
    const languageNames: Record<string, string> = {
      en: 'English',
      te: 'Telugu (తెలుగు)',
      hi: 'Hindi (हिंदी)',
      ml: 'Malayalam (മലയാളം)',
      ta: 'Tamil (தமிழ்)',
      kn: 'Kannada (ಕನ್ನಡ)',
    };

    const targetLang = languageNames[language] || 'English';

    const systemInstruction = `
You are KisanAI, an elite, real-time multilingual Agricultural Management Agent designed for farmers, agricultural extension workers, and agriculture officers across India.
Your mission is to provide accurate, scientific, actionable, and compassionate farming advice grounded in real agronomic practices, weather conditions, soil biology, market economics, and government schemes.

IMPORTANT INSTRUCTIONS:
1. Target Language: Respond primarily in ${targetLang}. If the user asked in English or another language, still provide the main guidance in ${targetLang} with clear, easy-to-read vocabulary that a farmer can immediately understand. Use vernacular agricultural terms (like "ఖరీఫ్ / రబీ", "మండి", "యూరియా / డీఏపీ", "తేమ", "తెగులు" for Telugu, etc.) alongside scientific names when relevant.
2. Context:
   - Farmer Name: ${userProfile?.name || 'Kisan Mitra'}
   - Role: ${userProfile?.role || 'Farmer'}
   - Location: ${userProfile?.village || 'Local'}, ${userProfile?.district || 'Guntur/Warangal'}, ${userProfile?.state || 'Andhra Pradesh / Telangana'}
   - Soil: ${userProfile?.soilType || 'Black Cotton Clay Loam'}
   - Current Soil Moisture: ${currentTelemetry.soilMoisture}% (Threshold: <35% is dry, 45-65% optimal)
   - Current Weather: Temp ${currentTelemetry.ambientTemp}°C, Humidity ${currentTelemetry.ambientHumidity}%, Rain chance ${currentTelemetry.rainfallChanceToday}%
   - Primary Crops: ${userProfile?.primaryCrops?.join(', ') || 'Cotton, Red Chili, Paddy'}
3. Expertise Coverage:
   - Crop Selection & Soil Suitability: Recommend crops matching soil pH, climate, market demand, and water availability.
   - Live Mandi Arbitrage: Explain current rates (e.g. Red Chili Teja ₹22,800/Q, Cotton ₹7,920/Q, Basmati ₹4,680/Q) and which nearby market offers higher profits.
   - Pest & Disease Diagnosis: If an image is provided or symptoms are described, identify the disease/pest (e.g., Pink Bollworm, Thrips, Yellow Rust, Blast, Powdery Mildew, Leaf Curl Virus) and provide an immediate 3-step action plan (Organic/Cultural, Chemical Dosage with water ratio, Preventive measure).
   - Smart Irrigation & Fertigation: Provide exact schedule based on current growth stage and soil moisture.
   - Government Schemes: Guide on PM-KISAN, PMFBY crop insurance, PM-KUSUM solar pumps, and SMAM farm drone subsidies with application steps.
   - High-Expansive / High-Margin Crops: Suggest lucrative alternatives (Dragon fruit, polyhouse colored capsicum, Moringa, Chia seeds) showing cost vs return.
   - Agriculture Officer Triage: If user is an officer, provide structured village vulnerability assessments and emergency actions.
4. Output Formatting:
   - Use clear markdown headers, bold keywords, and bullet points.
   - Keep recommendations actionable, practical, and safe.
   - Include a final short "WhatsApp Action Summary" (1-2 sentences) that the farmer can save or forward to their farm group.
`;

    if (ai) {
      const parts: any[] = [];

      if (imageBase64) {
        // Strip data:image/...;base64, prefix if present
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        });
      }

      parts.push({
        text: message || 'Please analyze this crop leaf/plant image for any diseases, pest infestations, or nutrient deficiencies and suggest remedies.',
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts,
        },
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || 'Advisory generated based on current farm telemetry.';
      return res.json({
        reply: replyText,
        source: 'gemini-3.8-flash',
        timestamp: new Date().toISOString(),
      });
    } else {
      // Fallback domain response engine if API key is not provided
      const fallbackReplies: Record<string, Record<string, string>> = {
        te: {
          default: `**కిసాన్ AI వ్యవసాయ సలహా:**
- **ప్రస్తుత నేల తేమ:** ${currentTelemetry.soilMoisture}% (నీటి పారుదల అవసరం ఉంది)
- **వాతావరణ పరిస్థితి:** ఉష్ణోగ్రత ${currentTelemetry.ambientTemp}°C, వర్షం అవకాశం ${currentTelemetry.rainfallChanceToday}%.
- **సిఫార్సు:** ప్రస్తుత వాతావరణం మరియు మార్కెట్ ధరల (తేజ మిర్చి ₹22,800/క్వింటాల్) ప్రకారం డ్రిప్ ఇరిగేషన్ ద్వారా ఉదయం పూట నీరు అందించండి. తెగుళ్ళ నివారణకు బ్లూ స్టిక్కీ ట్రాప్స్ ఏర్పాటు చేయండి.
- **పథకం:** PM-KISAN 17వ విడత మరియు PM-KUSUM సోలార్ పంప్ సబ్సిడీ అందుబాటులో ఉంది.`,
        },
        hi: {
          default: `**किसान AI कृषि सलाह:**
- **मृदा नमी:** ${currentTelemetry.soilMoisture}% (सिंचाई की आवश्यकता है)
- **मौसम पूर्वानुमान:** तापमान ${currentTelemetry.ambientTemp}°C, वर्षा की संभावना ${currentTelemetry.rainfallChanceToday}%.
- **सिफारिश:** वर्तमान मंडी भाव (कपास ₹7,920/क्विंटल, मिर्च ₹22,800/क्विंटल) को ध्यान में रखते हुए संतुलित सिंचाई करें। 
- **सरकारी योजना:** PM-KISAN एवं PMFBY फसल बीमा का लाभ उठाएं।`,
        },
        en: {
          default: `**KisanAI Real-time Agro-Advisory:**
- **Soil Moisture:** ${currentTelemetry.soilMoisture}% (Low moisture - irrigation triggered)
- **Local Weather:** ${currentTelemetry.ambientTemp}°C with ${currentTelemetry.ambientHumidity}% humidity.
- **Top Crop Recommendation:** Given your black soil and high APMC demand, Teja Red Chilli & MCU-5 Cotton offer the highest net return.
- **Action Plan:** Irrigate for 45 minutes using drip lines. Spray preventive Neem oil (5ml/L) against early sucking pests.`,
        },
      };

      const langKey = (fallbackReplies[language] ? language : 'en') as 'te' | 'hi' | 'en';
      const fallbackText = fallbackReplies[langKey].default;

      return res.json({
        reply: fallbackText,
        source: 'agro-expert-engine',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({
      error: 'Failed to process agro advisory',
      details: err?.message || String(err),
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KisanAI Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
