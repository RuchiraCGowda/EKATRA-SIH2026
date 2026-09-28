import React, { useState } from 'react';
import {
  Recycle,
  User,
  Factory,
  ShieldCheck,
  Volume2,
  Sparkles,
  ArrowRight,
  Phone,
  KeyRound,
  Check,
  Building,
} from 'lucide-react';
import { UserRole, AppLanguage } from '../../types/database';
import { getTranslation, SUPPORTED_LANGUAGES, LanguageMeta } from '../../lib/i18n';
import { speakText, stopSpeech } from '../../lib/speech';

interface LoginScreenProps {
  currentLang: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  onLogin: (role: UserRole) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  currentLang,
  onLanguageChange,
  onLogin,
}) => {
  const t = getTranslation(currentLang);
  const [selectedRole, setSelectedRole] = useState<UserRole>('collector');
  const [collectorPhone, setCollectorPhone] = useState('9820198201');
  const [recyclerEmail, setRecyclerEmail] = useState('contact@ecorounds-recycle.in');
  const [adminId, setAdminId] = useState('mpcb-officer-409');
  const [password, setPassword] = useState('••••••••');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const currentLanguageMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const getRoleAudioText = (role: UserRole) => {
    if (role === 'collector') {
      switch (currentLang) {
        case 'mr': return 'कचरा वेचक पोर्टल. येथे स्पर्श करून थेट लॉगिन करा.';
        case 'hi': return 'कचरा बीनने वाले का पोर्टल। यहाँ दबाकर सीधे लॉगिन करें।';
        case 'gu': return 'કચરો એકઠો કરનાર પોર્ટલ. અહીં સ્પર્શ કરીને લોગિન કરો.';
        case 'ta': return 'குப்பை சேகரிப்பாளர் போர்டல். உள்நுழைய இங்கே தொடவும்.';
        case 'te': return 'చెత్త సేకరించే వారి పోర్టల్. లాగిన్ చేయడానికి ఇక్కడ నొక్కండి.';
        case 'kn': return 'ಕಸ ಸಂಗ್ರಾಹಕರ ಪೋರ್ಟಲ್. ಲಾಗಿನ್ ಮಾಡಲು ಇಲ್ಲಿ ಸ್ಪರ್ಶಿಸಿ.';
        default: return 'Informal collector portal. Tap here to login.';
      }
    }
    if (role === 'recycler') {
      switch (currentLang) {
        case 'mr': return 'अधिकृत रिसायकलर पोर्टल. परवानाधारक फॅक्टरी व्यवस्थापन.';
        case 'hi': return 'अधिकृत रीसाइक्लर पोर्टल। लाइसेंस प्राप्त फैक्ट्री लॉगिन।';
        case 'gu': return 'અધિકૃત રિસાયકલર પોર્ટલ. લાઇસન્સ પ્રાપ્ત સુવિધા વ્યવસ્થાપન.';
        case 'ta': return 'அங்கீகரிக்கப்பட்ட மறுசுழற்சி போர்டல். உரிமம் பெற்ற ஆலை மேலாண்மை.';
        case 'te': return 'అధీకృత రీసైక్లర్ పోర్టల్. లైసెన్స్ పొందిన ప్రాసెసింగ్ ప్లాంట్.';
        case 'kn': return 'ಅಧಿಕೃತ ಮರುಬಳಕೆದಾರರ ಪೋರ್ಟಲ್. ಪರವಾನಗಿ ಪಡೆದ ಸೌಲಭ್ಯ ನಿರ್ವಹಣೆ.';
        default: return 'Authorized recycler portal for licensed facilities.';
      }
    }
    switch (currentLang) {
      case 'mr': return 'शासकीय प्रशासक व प्रदूषण नियंत्रण मंडळ डॅशबोर्ड.';
      case 'hi': return 'सरकारी प्रशासक व प्रदूषण नियंत्रण बोर्ड डैशबोर्ड।';
      case 'gu': return 'સરકારી વહીવટકર્તા અને પ્રદૂષણ નિયંત્રણ બોર્ડ ડેશબોર્ડ.';
      case 'ta': return 'அரசு நிர்வாகம் மற்றும் மாசு கட்டுப்பாட்டு வாரிய கட்டுப்பாட்டு மையம்.';
      case 'te': return 'ప్రభుత్వ నియంత్రణ మరియు కాలుష్య నియంత్రణ బోర్డు డాష్‌బోర్డ్.';
      case 'kn': return 'ಸರ್ಕಾರಿ ಆಡಳಿತ ಮತ್ತು ಮಾಲಿನ್ಯ ನಿಯಂತ್ರಣ ಮಂಡಳಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್.';
      default: return 'Government regulatory oversight console.';
    }
  };

  const handlePlayVoiceover = (text?: string, langCode?: AppLanguage) => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
      return;
    }
    const textToSpeak = text || currentLanguageMeta.greetingVoice;
    const lang = langCode || currentLang;
    setIsPlayingAudio(true);
    speakText(textToSpeak, lang, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  const handleLanguageSelect = (lang: LanguageMeta) => {
    onLanguageChange(lang.code);
    stopSpeech();
    setIsPlayingAudio(true);
    speakText(lang.greetingVoice, lang.code, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  const handlePerformLogin = (role: UserRole) => {
    stopSpeech();
    onLogin(role);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold uppercase tracking-wider backdrop-blur-sm">
            <Recycle className="w-4 h-4 animate-spin" style={{ animationDuration: '12s' }} />
            {t.appName} • FORMAL DIGITAL BRIDGE
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t.loginTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            {t.loginSubtitle}
          </p>
        </div>

        {/* ================================================================ */}
        {/* SECTION 1: LANGUAGE SELECTION & PROMINENT VOICEOVER */}
        {/* ================================================================ */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                1. {t.selectLanguageFirst}
              </span>
            </div>

            {/* Main Audio Voiceover Button */}
            <button
              onClick={() => handlePlayVoiceover()}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              title="Listen to Instructions"
            >
              <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
              <span>{t.voiceAssistance}</span>
            </button>
          </div>

          {/* Languages Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageSelect(lang)}
                  className={`p-2.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500/50'
                      : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-extrabold text-sm">{lang.nativeName}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5">{lang.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================================================================ */}
        {/* SECTION 2: ROLE-BASED LOGIN TILES */}
        {/* ================================================================ */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              2. Choose Portal & Enter
            </span>
            <span className="text-[11px] text-slate-400">Instant Demo Credentials Included</span>
          </div>

          <div className="space-y-3">
            {/* Tile 1: Informal Collector */}
            <div
              onClick={() => setSelectedRole('collector')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedRole === 'collector'
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-lg ring-1 ring-emerald-500/40'
                  : 'bg-slate-800/50 border-slate-700/80 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 border border-emerald-500/30">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm sm:text-base">
                      {t.loginAsCollector}
                    </h3>
                    <p className="text-xs text-emerald-400/90 font-medium">
                      {t.loginAsCollectorSub} • Code: EK-COL-7089
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayVoiceover(getRoleAudioText('collector'));
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 shrink-0"
                  title="Audio Explanation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {selectedRole === 'collector' && (
                <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Registered Phone</span>
                      <span className="font-mono text-slate-200 font-bold">{collectorPhone}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Operating Hub</span>
                      <span className="text-slate-200 font-bold">Dharavi Yard 4</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePerformLogin('collector')}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                  >
                    <span>Enter as Babu Bhai (Collector)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Tile 2: Authorized Recycler */}
            <div
              onClick={() => setSelectedRole('recycler')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedRole === 'recycler'
                  ? 'bg-teal-950/40 border-teal-500 shadow-lg ring-1 ring-teal-500/40'
                  : 'bg-slate-800/50 border-slate-700/80 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold shrink-0 border border-teal-500/30">
                    <Factory className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm sm:text-base">
                      {t.loginAsRecycler}
                    </h3>
                    <p className="text-xs text-teal-400/90 font-medium">
                      {t.loginAsRecyclerSub}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayVoiceover(getRoleAudioText('recycler'));
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 shrink-0"
                  title="Audio Explanation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {selectedRole === 'recycler' && (
                <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">SPCB License</span>
                      <span className="font-mono text-slate-200 font-bold">
                        MPCB/RO-NM/EW/2024
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Processing Cap</span>
                      <span className="text-teal-300 font-bold">300 MT / Month</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePerformLogin('recycler')}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 active:scale-95 transition-all"
                  >
                    <span>Enter as EcoRounds Recycler</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Tile 3: Government / Admin */}
            <div
              onClick={() => setSelectedRole('admin')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-lg ring-1 ring-indigo-500/40'
                  : 'bg-slate-800/50 border-slate-700/80 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0 border border-indigo-500/30">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm sm:text-base">
                      {t.loginAsAdmin}
                    </h3>
                    <p className="text-xs text-indigo-400/90 font-medium">{t.loginAsAdminSub}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayVoiceover(getRoleAudioText('admin'));
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 shrink-0"
                  title="Audio Explanation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {selectedRole === 'admin' && (
                <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Officer Badge</span>
                      <span className="font-mono text-slate-200 font-bold">{adminId}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Jurisdiction</span>
                      <span className="text-indigo-300 font-bold">Maharashtra MMR</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePerformLogin('admin')}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
                  >
                    <span>Enter Regulatory Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Safety & Privacy Assurance */}
        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Government CPCB Form 6 Digital Manifest & SPCB E-Waste Compliance</span>
        </div>
      </div>
    </div>
  );
};
