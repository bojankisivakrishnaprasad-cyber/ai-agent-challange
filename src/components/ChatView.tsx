import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Smartphone,
  Share2,
  Bot,
  User,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Wheat,
  TrendingUp,
  CloudRain,
  ShieldAlert,
  Droplets,
  DollarSign,
  Layers,
  Award,
} from 'lucide-react';
import { ChatMessage, LanguageCode, UserProfile } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface ChatViewProps {
  currentLanguage: LanguageCode;
  user: UserProfile | null;
  onOpenWhatsApp: (customText?: string) => void;
  onNavigateToTab: (tab: string) => void;
}

// Sample leaf images for quick disease testing
const SAMPLE_DISEASE_LEAVES = [
  {
    name: 'Cotton Bollworm Damage',
    crop: 'Bt Cotton',
    imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600&auto=format&fit=crop&q=80',
    prompt: 'My cotton crop is showing chewed bolls with bore holes and larval frass. What pest is this and what immediate chemical or bio-control should I spray?',
  },
  {
    name: 'Chilli Leaf Curl (Thrips)',
    crop: 'Teja Chilli',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d69106093?w=600&auto=format&fit=crop&q=80',
    prompt: 'My chilli crop leaves are curling upwards with stunted growth and flower drop. Diagnose the problem and recommend dosage.',
  },
  {
    name: 'Tomato Blight / Spot',
    crop: 'Tomato',
    imageUrl: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=600&auto=format&fit=crop&q=80',
    prompt: 'Tomato leaves show brown concentric rings and dark lesions. Is this early blight, and how do I prevent it from spreading to other plots?',
  },
];

export const ChatView: React.FC<ChatViewProps> = ({
  currentLanguage,
  user,
  onOpenWhatsApp,
  onNavigateToTab,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Initialize initial greeting message in user's language
  useEffect(() => {
    const greetingTexts: Record<LanguageCode, string> = {
      en: `Namaste ${user?.name || 'Kisan Mitra'}! I am **KisanAI**, your personal 24/7 agricultural intelligence agent.
I can analyze your soil, suggest optimal crops, scan leaf diseases from photos, check mandi market prices, forecast weather hazards, and guide you through government subsidies.

**How can I assist your farm today?** Choose any question below or type/speak your query!`,
      te: `నమస్కారం ${user?.name || 'రైతు మిత్రులారా'}! నేను మీ **కిసాన్ AI (KisanAI)** వ్యవసాయ సలహాదారుని.
నేను మీ నేల లక్షణాలను విశ్లేషించి, సరైన పంటలను సూచించగలను, పంట ఫోటోల ద్వారా తెగుళ్ళను గుర్తించగలను, మార్కెట్ ధరలు (మండి రేట్లు) పోల్చి చెప్పగలను, మరియు ప్రభుత్వ రాయితీ పథకాలను వివరించగలను.

**ఈ రోజు మీ వ్యవసాయానికి ఎలా సహాయపడగలను?** క్రింది ప్రధాన ప్రశ్నలను క్లిక్ చేయండి లేదా సందేశం పంపండి!`,
      hi: `नमस्ते ${user?.name || 'किसान साथी'}! मैं हूँ **किसान AI (KisanAI)**, आपका व्यक्तिगत कृषि सलाहकार।
मैं आपकी मिट्टी की जांच, सही फसल की सिफारिश, पत्तियों की फोटो से रोग पहचान, ताजा मंडी भाव, और सरकारी सब्सिडी योजनाओं की पूरी जानकारी दे सकता हूँ।

**आज मैं आपकी क्या सहायता कर सकता हूँ?** नीचे दिए गए प्रश्नों में से चुनें या बोलकर पूछें!`,
      ml: `നമസ്കാരം ${user?.name || 'കർഷക സുഹൃത്തേ'}! ഞാൻ നിങ്ങളുടെ **കിസാൻ AI (KisanAI)** കാർഷിക സഹായിയാണ്.
മണ്ണ് പരിശോധന, അനുയോജ്യമായ വിളകൾ, രോഗ നിർണയം, വിപണി വിലകൾ, സർക്കാർ സബ്‌സിഡികൾ എന്നിവയിൽ നിങ്ങളെ സഹായിക്കാൻ ഞാൻ സദാ സന്നദ്ധനാണ്.`,
      ta: `வணக்கம் ${user?.name || 'விவசாய தோழரே'}! நான் உங்கள் **கிசான் AI (KisanAI)** வேளாண் ஆலோசகர்.
மண் தரம், சிறந்த பயிர் தேர்வு, இலை நோய் கண்டறிதல், மண்டி சந்தை நிலவரம் மற்றும் அரசு மானியங்கள் குறித்த உடனடி வழிகாட்டலை வழங்குகிறேன்.`,
      kn: `ನಮಸ್ಕಾರ ${user?.name || 'ರೈತ ಮಿತ್ರರೆ'}! ನಾನು ನಿಮ್ಮ **ಕಿಸಾನ್ AI (KisanAI)** ಕೃಷಿ ಸಲಹೆಗಾರ.
ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ, ಸೂಕ್ತ ಬೆಳೆ ಶಿಫಾರಸು, ಎಲೆ ರೋಗ ಪತ್ತೆ, ಮಾರುಕಟ್ಟೆ ಧಾರಣೆ ಮತ್ತು ಸರ್ಕಾರದ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಸಂಪೂರ್ಣ ಮಾಹಿತಿ ನೀಡಬಲ್ಲೆ.`,
    };

    setMessages([
      {
        id: 'msg_welcome',
        role: 'assistant',
        content: greetingTexts[currentLanguage] || greetingTexts.en,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: currentLanguage,
        actionItems: [
          'Scan diseased crop photo for diagnosis',
          'Check highest market price in nearby mandis',
          'Review soil moisture & pump advisory',
        ],
      },
    ]);
  }, [currentLanguage, user?.name]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      const langMap: Record<LanguageCode, string> = {
        en: 'en-IN',
        te: 'te-IN',
        hi: 'hi-IN',
        ml: 'ml-IN',
        ta: 'ta-IN',
        kn: 'kn-IN',
      };
      recognition.lang = langMap[currentLanguage] || 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
    }
  }, [currentLanguage]);

  const toggleSpeechRecognition = () => {
    if (!speechRecognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }
    if (isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      speechRecognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Text to Speech
  const toggleTTS = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`\[\]]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const langMap: Record<LanguageCode, string> = {
      en: 'en-IN',
      te: 'te-IN',
      hi: 'hi-IN',
      ml: 'ml-IN',
      ta: 'ta-IN',
      kn: 'kn-IN',
    };
    utterance.lang = langMap[currentLanguage] || 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Send Message to backend
  const handleSendMessage = async (textToSend?: string, imagePayload?: string) => {
    const query = textToSend !== undefined ? textToSend : inputValue;
    const img = imagePayload !== undefined ? imagePayload : selectedImage;

    if (!query.trim() && !img) return;

    const userMsgId = `usr_${Date.now()}`;
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: query || 'Analyze attached crop leaf image for pests or diseases.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: currentLanguage,
      imageUrl: img || undefined,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setSelectedImage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: currentLanguage,
          userProfile: user,
          imageBase64: img || undefined,
          conversationHistory: messages.slice(-4),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get advisory');
      }

      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: currentLanguage,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `I encountered an error connecting to the agricultural reasoning model: ${err.message}. Please check your connection or try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: currentLanguage,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // 10 Challenge Questions List
  const challengeQuestions = [
    {
      id: 'q1',
      title: t.challenge1_crop,
      icon: Wheat,
      color: 'from-emerald-600 to-green-500',
    },
    {
      id: 'q2',
      title: t.challenge2_market,
      icon: DollarSign,
      color: 'from-amber-600 to-yellow-500',
    },
    {
      id: 'q3',
      title: t.challenge3_weather,
      icon: CloudRain,
      color: 'from-sky-600 to-blue-500',
    },
    {
      id: 'q4',
      title: t.challenge4_disease,
      icon: ShieldAlert,
      color: 'from-rose-600 to-pink-500',
    },
    {
      id: 'q5',
      title: t.challenge5_water_fert,
      icon: Droplets,
      color: 'from-cyan-600 to-teal-500',
    },
    {
      id: 'q6',
      title: t.challenge6_schemes,
      icon: Award,
      color: 'from-indigo-600 to-purple-500',
    },
    {
      id: 'q7',
      title: t.challenge7_high_demand,
      icon: TrendingUp,
      color: 'from-orange-600 to-amber-500',
    },
    {
      id: 'q8',
      title: t.challenge8_risk_areas,
      icon: AlertTriangle,
      color: 'from-red-600 to-rose-500',
    },
    {
      id: 'q9',
      title: t.challenge9_priorities,
      icon: Layers,
      color: 'from-emerald-700 to-teal-600',
    },
    {
      id: 'q10',
      title: t.challenge10_officer,
      icon: Bot,
      color: 'from-purple-700 to-indigo-600',
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4.25rem)] max-w-6xl mx-auto w-full p-2 sm:p-4 gap-3">
      {/* Top Model & Capabilities Info Bar */}
      <div className="bg-slate-900/90 border border-emerald-700/50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-md">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="font-semibold text-emerald-300">Model Engine:</span>
          <span className="bg-emerald-950/80 px-2 py-0.5 rounded text-white font-mono border border-emerald-600/40">
            gemini-3.8-flash
          </span>
          <span className="text-slate-400 hidden md:inline">• Grounded with Real-time IoT & APMC Mandis</span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => onNavigateToTab('market')}
            className="text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Mandi Arbitrage</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => onNavigateToTab('farm')}
            className="text-sky-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Cloud Farm IoT</span>
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-slate-900/80 border border-emerald-800/50 rounded-2xl p-3 sm:p-4 overflow-y-auto flex flex-col gap-4 shadow-xl backdrop-blur-sm">
        {/* Messages List */}
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[92%] sm:max-w-[85%] ${
                isAssistant ? 'self-start' : 'self-end flex-row-reverse'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold shadow-md ${
                  isAssistant
                    ? 'bg-gradient-to-tr from-emerald-600 to-lime-500 text-slate-950'
                    : 'bg-gradient-to-tr from-emerald-800 to-teal-700 text-white'
                }`}
              >
                {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl px-4 py-3 text-sm shadow-md space-y-2.5 ${
                  isAssistant
                    ? 'bg-slate-800/95 text-slate-100 border border-emerald-700/40'
                    : 'bg-emerald-700 text-white font-medium border border-emerald-500/50'
                }`}
              >
                {/* Uploaded image if any */}
                {msg.imageUrl && (
                  <div className="rounded-lg overflow-hidden border border-emerald-500/40 max-w-xs">
                    <img
                      src={msg.imageUrl}
                      alt="Crop Leaf Analysis"
                      className="w-full h-44 object-cover"
                    />
                    <div className="bg-slate-950/80 px-2 py-1 text-[11px] text-emerald-300 font-mono flex items-center gap-1">
                      <Camera className="w-3 h-3 text-lime-400" />
                      <span>Crop Leaf Specimen Uploaded</span>
                    </div>
                  </div>
                )}

                {/* Markdown formatted content */}
                <div className="whitespace-pre-wrap leading-relaxed space-y-1.5 font-normal">
                  {msg.content.split('\n').map((line, idx) => {
                    if (line.startsWith('### ')) {
                      return <h4 key={idx} className="text-base font-bold text-lime-300 pt-1">{line.replace('### ', '')}</h4>;
                    }
                    if (line.startsWith('## ')) {
                      return <h3 key={idx} className="text-lg font-bold text-lime-400 pt-1.5">{line.replace('## ', '')}</h3>;
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={idx} className="font-bold text-emerald-200">{line.replace(/\*\*/g, '')}</p>;
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <div key={idx} className="flex items-start gap-2 pl-1">
                          <span className="text-lime-400 font-bold">•</span>
                          <span>{line.replace('- ', '')}</span>
                        </div>
                      );
                    }
                    return <p key={idx}>{line}</p>;
                  })}
                </div>

                {/* Footer Controls for Assistant */}
                {isAssistant && (
                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400 gap-2">
                    <span className="text-[11px] text-slate-500">{msg.timestamp}</span>

                    <div className="flex items-center gap-2">
                      {/* Read Out Aloud (TTS) */}
                      <button
                        onClick={() => toggleTTS(msg.id, msg.content)}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-slate-700/70 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                        title="Read advice aloud in selected language"
                      >
                        {speakingMsgId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                            <span className="text-[11px] text-rose-300">Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-lime-400" />
                            <span className="text-[11px]">Listen</span>
                          </>
                        )}
                      </button>

                      {/* WhatsApp Share Button */}
                      <button
                        onClick={() => onOpenWhatsApp(msg.content)}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-green-900/60 hover:bg-green-800/80 text-green-300 border border-green-600/40 transition cursor-pointer font-medium"
                        title="Forward this advice to WhatsApp"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-[11px]">{t.shareWhatsApp}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex items-center gap-3 self-start bg-slate-800/90 border border-emerald-700/40 px-4 py-3 rounded-2xl text-xs text-emerald-300 animate-pulse">
            <Bot className="w-4 h-4 text-lime-400 animate-spin" />
            <span>KisanAI is cross-referencing soil telemetry, APMC mandi rates, and disease databases...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompt Challenge Chips (The 10 Mandatory Agent Capabilities) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-lime-400" />
            {t.quickQuestionsTitle}
          </span>
          <span className="text-[11px] text-slate-500">Click any challenge query to test</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {challengeQuestions.map((q) => {
            const Icon = q.icon;
            return (
              <button
                key={q.id}
                onClick={() => handleSendMessage(q.title)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/90 text-slate-200 border border-emerald-800/60 text-xs whitespace-nowrap transition cursor-pointer shrink-0 hover:border-emerald-500/50 shadow-sm"
              >
                <Icon className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                <span className="font-medium max-w-xs truncate">{q.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Disease Diagnosis Leaf Specimen Presets Bar */}
      <div className="bg-slate-900/60 border border-emerald-800/40 rounded-xl px-3 py-2 flex items-center justify-between gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Camera className="w-3.5 h-3.5 text-rose-400" />
          Test Crop Diagnosis Image:
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {SAMPLE_DISEASE_LEAVES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedImage(sample.imageUrl);
                handleSendMessage(sample.prompt, sample.imageUrl);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-rose-700/40 text-slate-200 text-xs transition cursor-pointer"
            >
              <img src={sample.imageUrl} alt={sample.name} className="w-4 h-4 rounded-full object-cover" />
              <span>{sample.crop}: {sample.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Image Preview if selected */}
      {selectedImage && (
        <div className="flex items-center gap-2 p-2 bg-slate-800/90 border border-emerald-600/50 rounded-xl">
          <img src={selectedImage} alt="Selected" className="w-12 h-12 rounded-lg object-cover" />
          <div className="flex-1 text-xs text-slate-200">
            <p className="font-semibold text-lime-300">Plant / Leaf Photo Ready for AI Diagnosis</p>
            <p className="text-[11px] text-slate-400">Click send or enter query to detect pests and diseases</p>
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-slate-700 cursor-pointer"
          >
            Remove
          </button>
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="flex items-center gap-2 bg-slate-900 border border-emerald-600/50 rounded-2xl p-2 shadow-2xl">
        {/* Hidden File Input for Camera/Gallery */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Attach Photo Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-700/40 transition cursor-pointer"
          title={t.attachPhoto}
        >
          <Camera className="w-5 h-5" />
        </button>

        {/* Voice Input Button */}
        <button
          type="button"
          onClick={toggleSpeechRecognition}
          className={`p-2.5 rounded-xl transition cursor-pointer border ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse border-rose-400'
              : 'bg-slate-800 hover:bg-slate-700 text-lime-300 border-emerald-700/40'
          }`}
          title={isListening ? t.stopListening : t.voiceInput}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={isListening ? t.listening : t.chatPlaceholder}
          disabled={loading}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={loading || (!inputValue.trim() && !selectedImage)}
          className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 hover:brightness-110 text-slate-950 font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
