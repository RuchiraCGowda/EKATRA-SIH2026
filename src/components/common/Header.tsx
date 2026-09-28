import React, { useState, useEffect } from 'react';
import {
  Recycle,
  Globe2,
  Bell,
  Wifi,
  WifiOff,
  Database,
  CheckCircle,
  Clock,
  Sparkles,
  ExternalLink,
  LogOut,
  Volume2,
  User,
  Factory,
  ShieldCheck,
} from 'lucide-react';
import { UserRole, AppLanguage, NotificationItem } from '../../types/database';
import { getTranslation, SUPPORTED_LANGUAGES } from '../../lib/i18n';
import { speakText, stopSpeech } from '../../lib/speech';
import { offlineSyncEngine } from '../../lib/offlineQueue';
import { EkatraDB, subscribeToDB } from '../../lib/supabase';
import { SupabaseModal } from './SupabaseModal';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentLang: AppLanguage;
  onLangChange: (lang: AppLanguage) => void;
  onLogout?: () => void;
  onOpenWhatsAppDemo?: () => void;
  onOpenSMSDemo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  currentLang,
  onLangChange,
  onLogout,
  onOpenWhatsAppDemo,
  onOpenSMSDemo,
}) => {
  const t = getTranslation(currentLang);
  const [networkStatus, setNetworkStatus] = useState(offlineSyncEngine.getNetworkStatus());
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    const unsubQueue = offlineSyncEngine.subscribe((status) => {
      setNetworkStatus({
        isOnline: status.isOnline,
        isSyncing: status.isSyncing,
        pendingCount: status.queueLength,
      });
    });

    const refreshNotifs = () => {
      setNotifications(EkatraDB.getNotifications(currentRole));
    };
    refreshNotifs();
    const unsubDB = subscribeToDB(refreshNotifs);

    return () => {
      unsubQueue();
      unsubDB();
    };
  }, [currentRole]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleSpeechVoiceover = () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
      return;
    }
    const langMeta =
      SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];
    setIsPlayingAudio(true);
    speakText(langMeta.greetingVoice, currentLang, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  const handleLanguageChangeWithVoice = (lang: AppLanguage) => {
    onLangChange(lang);
    const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];
    speakText(langMeta.greetingVoice, lang, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
    });
  };

  // Compact role labels for all screen sizes so Gov Admin is never cut off
  const getRoleLabel = (role: UserRole) => {
    if (role === 'collector') {
      if (currentLang === 'mr') return 'कलेक्टर';
      if (currentLang === 'hi') return 'कलेक्टर';
      if (currentLang === 'gu') return 'કલેક્ટર';
      if (currentLang === 'ta') return 'சேகரிப்பாளர்';
      if (currentLang === 'te') return 'కలెక్టర్';
      if (currentLang === 'kn') return 'ಕಲೆಕ್ಟರ್';
      return 'Collector';
    }
    if (role === 'recycler') {
      if (currentLang === 'mr') return 'रिसायकलर';
      if (currentLang === 'hi') return 'रीसाइक्लर';
      if (currentLang === 'gu') return 'રિસાયકલર';
      if (currentLang === 'ta') return 'மறுசுழற்சியாளர்';
      if (currentLang === 'te') return 'రీసైక్లర్';
      if (currentLang === 'kn') return 'ಮರುಬಳಕೆದಾರ';
      return 'Recycler';
    }
    // Gov Admin
    if (currentLang === 'mr') return 'प्रशासक';
    if (currentLang === 'hi') return 'प्रशासक';
    if (currentLang === 'gu') return 'સરકાર';
    if (currentLang === 'ta') return 'அரசு';
    if (currentLang === 'te') return 'అడ్మిన్';
    if (currentLang === 'kn') return 'ಆಡಳಿತ';
    return 'Admin';
  };

  // Short localized Logout text so it fits comfortably on any mobile device
  const getLogoutLabel = () => {
    if (currentLang === 'mr') return 'लॉगआउट';
    if (currentLang === 'hi') return 'लॉगआउट';
    if (currentLang === 'gu') return 'લૉગઆઉટ';
    if (currentLang === 'ta') return 'வெளியேறு';
    if (currentLang === 'te') return 'లాగౌట్';
    if (currentLang === 'kn') return 'ಲಾಗ್‌ಔಟ್';
    return 'Sign Out';
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md w-full">
        {/* TOP ROW: Brand on left, Desktop Role Switcher in center, Utilities & SIGN OUT on right */}
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-13 sm:h-16 gap-1 sm:gap-2">
            {/* Left: Brand Logo & Title */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Recycle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                </div>
              </div>

              <div className="leading-tight flex items-center gap-1 sm:gap-1.5 min-w-0">
                <span className="font-black text-xs sm:text-base tracking-tight text-white truncate max-w-[105px] xs:max-w-[150px] sm:max-w-none">
                  {t.appName}
                </span>

                {/* Network connectivity status dot */}
                <button
                  onClick={() => offlineSyncEngine.setSimulatedOffline(networkStatus.isOnline)}
                  title={
                    networkStatus.isOnline
                      ? 'Network: Online (Click to simulate offline)'
                      : 'Network: Offline (Click to reconnect)'
                  }
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition-colors shrink-0"
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      networkStatus.isOnline
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-amber-400 animate-bounce'
                    }`}
                  />
                  <span className="text-[9px] font-mono text-slate-300 hidden md:inline">
                    {networkStatus.isOnline ? 'Live' : 'Offline'}
                  </span>
                </button>
              </div>
            </div>

            {/* Center on Desktop (screens >= 1024px / lg): Role Switcher */}
            <div className="hidden lg:flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800 text-xs font-semibold shadow-inner shrink-0">
              <button
                onClick={() => onRoleChange('collector')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  currentRole === 'collector'
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-900/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>{getRoleLabel('collector')}</span>
              </button>
              <button
                onClick={() => onRoleChange('recycler')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  currentRole === 'recycler'
                    ? 'bg-teal-600 text-white font-bold shadow-md shadow-teal-900/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Factory className="w-3.5 h-3.5 shrink-0" />
                <span>{getRoleLabel('recycler')}</span>
              </button>
              <button
                onClick={() => onRoleChange('admin')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  currentRole === 'admin'
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>{getRoleLabel('admin')}</span>
              </button>
            </div>

            {/* Right: Controls & Guaranteed Visible SIGN OUT */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto z-20">
              {/* Language Selector */}
              <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-800/90 border border-slate-700/80 rounded-xl px-1 sm:px-1.5 py-1 text-xs shrink-0">
                <Globe2 className="w-3 h-3 text-slate-400 shrink-0" />
                <select
                  value={currentLang}
                  onChange={(e) => handleLanguageChangeWithVoice(e.target.value as AppLanguage)}
                  className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-bold text-[10px] sm:text-[11px] max-w-[42px] xs:max-w-[55px] sm:max-w-[80px] truncate"
                  aria-label={t.language}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option
                      key={lang.code}
                      value={lang.code}
                      className="bg-slate-900 text-slate-100"
                    >
                      {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Speaker Audio Button */}
              <button
                onClick={handleSpeechVoiceover}
                className="hidden xs:flex p-1.5 text-amber-400 hover:text-amber-300 bg-slate-800/90 border border-slate-700/80 rounded-xl transition-all shrink-0 items-center justify-center"
                title="Audio instructions"
                aria-label="Listen audio"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
              </button>

              {/* Notifications Bell */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowNotifDrawer(!showNotifDrawer)}
                  className="relative p-1.5 text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 rounded-xl transition-all shrink-0"
                  aria-label="Notifications"
                >
                  <Bell className="w-3.5 h-3.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
              {/* Notifications Dropdown */}
              {showNotifDrawer && (
                <div className="absolute right-0 mt-2 w-72 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 overflow-hidden animate-in fade-in">
                  <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
                    <span className="font-bold text-xs sm:text-sm text-slate-200">
                      {t.notifications}
                    </span>
                    <button
                      onClick={() => EkatraDB.markAllNotificationsAsRead(currentRole)}
                      className="text-[11px] text-emerald-400 hover:underline font-medium"
                    >
                      {currentLang === 'mr'
                        ? 'सर्व वाचले'
                        : currentLang === 'hi'
                        ? 'सभी पढ़े'
                        : 'Mark read'}
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800 text-xs">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500">{t.emptyState}</div>
                    ) : (
                      notifications.map((n) => {
                        const title =
                          (currentLang === 'mr' && n.title_mr) ||
                          (currentLang === 'hi' && n.title_hi) ||
                          (currentLang === 'gu' && n.title_gu) ||
                          (currentLang === 'ta' && n.title_ta) ||
                          (currentLang === 'te' && n.title_te) ||
                          (currentLang === 'kn' && n.title_kn) ||
                          n.title_en;

                        const message =
                          (currentLang === 'mr' && n.message_mr) ||
                          (currentLang === 'hi' && n.message_hi) ||
                          (currentLang === 'gu' && n.message_gu) ||
                          (currentLang === 'ta' && n.message_ta) ||
                          (currentLang === 'te' && n.message_te) ||
                          (currentLang === 'kn' && n.message_kn) ||
                          n.message_en;

                        return (
                          <div
                            key={n.id}
                            className={`p-2.5 transition-colors relative ${
                              n.is_read
                                ? 'bg-slate-900/40 text-slate-400'
                                : 'bg-slate-800/50 text-slate-200'
                            }`}
                          >
                            <div className="font-bold text-slate-200 text-xs">{title}</div>
                            <p className="mt-0.5 text-[11px] text-slate-400 leading-relaxed">
                              {message}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* DB Schema Modal Button on large desktop */}
            <button
              onClick={() => setShowSupabaseModal(true)}
              className="hidden 2xl:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-emerald-400 shrink-0"
              title="View Database Architecture"
            >
              <Database className="w-3.5 h-3.5" />
              <span>DB</span>
            </button>

            {/* LOGOUT / SIGN OUT BUTTON - PROMINENT, SHRINK-0, GUARANTEED VISIBLE */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white border border-rose-400/40 text-xs font-bold transition-all shrink-0 shadow-md shadow-rose-950/50"
                title={t.logout}
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0 text-white" />
                <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">
                  {getLogoutLabel()}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE & TABLET ROLE SWITCHER ROW (Visible on screens < 1024px / lg) */}
      {/* Full-width 3-equal-column grid: Collector, Recycler, Gov Admin - NEVER CUT OFF */}
      <div className="lg:hidden w-full bg-slate-950/95 border-t border-slate-800/80 px-2 sm:px-4 py-1">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner w-full">
            {/* Collector Tab */}
            <button
              onClick={() => onRoleChange('collector')}
              className={`min-w-0 w-full py-1.5 sm:py-2 px-1 rounded-xl text-center font-bold transition-all flex items-center justify-center gap-1 ${
                currentRole === 'collector'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title="Collector"
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-[10px] xs:text-[11px] sm:text-xs font-bold">
                {getRoleLabel('collector')}
              </span>
            </button>

            {/* Recycler Tab */}
            <button
              onClick={() => onRoleChange('recycler')}
              className={`min-w-0 w-full py-1.5 sm:py-2 px-1 rounded-xl text-center font-bold transition-all flex items-center justify-center gap-1 ${
                currentRole === 'recycler'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-900/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title="Recycler"
            >
              <Factory className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-[10px] xs:text-[11px] sm:text-xs font-bold">
                {getRoleLabel('recycler')}
              </span>
            </button>

            {/* Gov Admin Tab - GUARANTEED NOT TO CUT OFF */}
            <button
              onClick={() => onRoleChange('admin')}
              className={`min-w-0 w-full py-1.5 sm:py-2 px-1 rounded-xl text-center font-bold transition-all flex items-center justify-center gap-1 ${
                currentRole === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              title="Government / CPCB Admin"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-[10px] xs:text-[11px] sm:text-xs font-bold">
                {getRoleLabel('admin')}
              </span>
            </button>
          </div>
        </div>
      </div>

        {/* THREE ACCESS CHANNELS BAR - ONLY SHOWN FOR COLLECTOR */}
        {currentRole === 'collector' && (
          <div className="bg-slate-950/95 border-t border-slate-800/80 px-2.5 sm:px-4 lg:px-6 py-1.5 sm:py-2 flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {t.channelsTitle}:
              </span>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1">
                  <span>📱</span>
                  <span>{t.channelApp}</span>
                  <span className="text-[9px] bg-emerald-500/30 text-emerald-200 px-1 rounded uppercase font-semibold">
                    Active
                  </span>
                </span>

                <button
                  onClick={onOpenWhatsAppDemo}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-emerald-950/70 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/50 text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                  title="Launch WhatsApp Chat Simulation"
                >
                  <span>💬</span>
                  <span>{t.channelWhatsApp}</span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-mono">
                    Demo
                  </span>
                </button>

                <button
                  onClick={onOpenSMSDemo}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-blue-950/70 text-slate-300 hover:text-blue-300 border border-slate-700 hover:border-blue-500/50 text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                  title="Launch SMS Command Simulation"
                >
                  <span>📩</span>
                  <span>{t.channelSMS}</span>
                  <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1 rounded font-mono">
                    Demo
                  </span>
                </button>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span className="text-amber-400/90 font-semibold">{t.demoSimulationBadge}:</span>
              <span>
                {currentLang === 'mr'
                  ? 'तिन्ही मार्ग थेट एकाच EKATRA डेटाबेसशी जोडलेले आहेत'
                  : currentLang === 'hi'
                  ? 'तीनों माध्यम सीधे एक ही EKATRA डेटाबेस से जुड़े हैं'
                  : currentLang === 'gu'
                  ? 'ત્રણેય ચેનલ એક જ EKATRA ડેટાબેઝ સાથે જોડાયેલી છે'
                  : currentLang === 'ta'
                  ? 'அனைத்து 3 சேனல்களும் ஒரே EKATRA தரவுத்தளத்தில் இணைகின்றன'
                  : currentLang === 'te'
                  ? 'అన్ని 3 ఛానెల్‌లు ఒకే EKATRA డేటాబేస్‌తో అనుసంధానించబడ్డాయి'
                  : currentLang === 'kn'
                  ? 'ಎಲ್ಲಾ 3 ಚಾನೆಲ್‌ಗಳು ಒಂದೇ EKATRA ಡೇಟಾಬೇಸ್‌ಗೆ ಲಿಂಕ್ ಆಗಿವೆ'
                  : 'All 3 channels write to the same EKATRA Database'}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Supabase Modal Dialog */}
      <SupabaseModal isOpen={showSupabaseModal} onClose={() => setShowSupabaseModal(false)} />
    </>
  );
};
