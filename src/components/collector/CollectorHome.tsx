import React, { useState } from 'react';
import {
  Camera,
  Coins,
  Package,
  Wallet,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  ArrowRight,
  MapPin,
  CheckCircle,
  FileQuestion,
  Radio,
  Truck,
  Compass,
  QrCode,
} from 'lucide-react';
import {
  MaterialCategory,
  PriceRecord,
  Lot,
  Payment,
  SafetyGuide,
  Complaint,
  AppLanguage,
  CollectorProfile,
} from '../../types/database';
import { getTranslation } from '../../lib/i18n';
import { AudioButton } from '../common/AudioButton';
import { AddEwasteModal } from './AddEwasteModal';
import { CollectorPrices } from './CollectorPrices';
import { CollectorLots } from './CollectorLots';
import { CollectorEarnings } from './CollectorEarnings';
import { CollectorSafety } from './CollectorSafety';
import { CollectorComplaints } from './CollectorComplaints';
import { CollectorGpsTracker } from './CollectorGpsTracker';
import { LotDetailModal } from './LotDetailModal';
import { LotQrCodeModal } from '../common/LotQrCodeModal';

interface CollectorHomeProps {
  collector: CollectorProfile;
  categories: MaterialCategory[];
  prices: PriceRecord[];
  lots: Lot[];
  payments: Payment[];
  safetyGuides: SafetyGuide[];
  complaints: Complaint[];
  lang: AppLanguage;
  onRefresh: () => void;
}

type CollectorTab = 'home' | 'prices' | 'lots' | 'gps' | 'earnings' | 'safety' | 'complaints';

export const CollectorHome: React.FC<CollectorHomeProps> = ({
  collector,
  categories,
  prices,
  lots,
  payments,
  safetyGuides,
  complaints,
  lang,
  onRefresh,
}) => {
  const t = getTranslation(lang);
  const [activeTab, setActiveTab] = useState<CollectorTab>('home');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [gpsTrackedLotId, setGpsTrackedLotId] = useState<string | undefined>(undefined);
  const [selectedLotForDetail, setSelectedLotForDetail] = useState<Lot | null>(null);
  const [selectedLotForQr, setSelectedLotForQr] = useState<Lot | null>(null);

  const totalEarnings = payments.reduce((acc, p) => acc + p.amount_inr, 0);
  const activeLotsCount = lots.filter(
    (l) => l.status !== 'payment_completed' && l.status !== 'cancelled'
  ).length;

  const audioGreeting =
    lang === 'mr'
      ? `नमस्ते! एकत्र ॲपमध्ये आपले स्वागत आहे. ई-कचरा विकण्यासाठी मोठा हिरवा कॅमेरा बटण दाबा. साहित्याचे थेट जीपीएस ट्रॅकिंग किंवा आजचे भाव पाहण्यासाठी खालील बटणे दाबा.`
      : lang === 'hi'
      ? `नमस्ते! एकत्र ऐप में आपका स्वागत है। ई-कचरा बेचने के लिए बड़ा हरा कैमरा बटन दबाएं। सामग्री की लाइव जीपीएस ट्रैकिंग या भाव देखने के लिए नीचे दिए गए बटन दबाएं।`
      : lang === 'gu'
      ? `નમસ્તે! એકત્ર એપમાં આપનું સ્વાગત છે. ઈ-કચરો વેચવા માટે મોટું લીલું કેમેરા બટન દબાવો. સામગ્રીનું લાઈવ જીપીએસ ટ્રેકિંગ અથવા આજના ભાવ જોવા માટે નીચેના બટન દબાવો.`
      : lang === 'ta'
      ? `வணக்கம்! எகத்ரா செயலிற்கு நல்வரவு. மின்னணுக் கழிவுகளை விற்க பெரிய பச்சை கேமரா பொத்தானை அழுத்தவும். நேரடி ஜிபிஎஸ் கண்காணிப்பு மற்றும் இன்றைய விலைகளைப் பார்க்க கீழே உள்ள பொத்தான்களை அழுத்தவும்.`
      : lang === 'te'
      ? `నమస్కారం! ఏకత్ర యాప్‌కు స్వాగతం. ఈ-వ్యర్థాలను విక్రయించడానికి పెద్ద ఆకుపచ్చ కెమెరా బటన్‌ను నొక్కండి. ప్రత్యక్ష జీపీఎస్ ట్రాకింగ్ లేదా నేటి ధరలను చూడటానికి క్రింది బటన్లను నొక్కండి.`
      : lang === 'kn'
      ? `ನಮಸ್ಕಾರ! ಏಕತ್ರಾ ಆ್ಯಪ್‌ಗೆ ಸುಸ್ವಾಗತ. ಇ-ತ್ಯಾಜ್ಯ ಮಾರಾಟ ಮಾಡಲು ದೊಡ್ಡ ಹಸಿರು ಕ್ಯಾಮೆರಾ ಬಟನ್ ಒತ್ತಿರಿ. ವಸ್ತುಗಳ ಲೈವ್ ಜಿಪಿಎಸ್ ಟ್ರ್ಯಾಕಿಂಗ್ ಅಥವಾ ಇಂದಿನ ದರಗಳನ್ನು ನೋಡಲು ಕೆಳಗಿನ ಬಟನ್‌ಗಳನ್ನು ಒತ್ತಿರಿ.`
      : `Welcome to EKATRA! Tap the large green camera button to sell scrap, or access live material GPS tracking and today's rates below.`;

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 space-y-5">
      {/* Top Banner: Greeting, Collector Code, Audio Prompt */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between shadow-lg">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
            {t.collectorCode}: {collector.collector_code}
          </span>
          <h1 className="text-base sm:text-xl font-black text-slate-100">
            {t.welcomeCollector}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>{collector.operating_hub}</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-mono text-[11px]">GPS Active</span>
          </p>
        </div>
        <AudioButton textToSpeak={audioGreeting} lang={lang} size="md" />
      </div>

      {/* Main Subview Navigation Back Button */}
      {activeTab !== 'home' && (
        <button
          onClick={() => setActiveTab('home')}
          className="w-full py-2.5 px-4 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-750 transition-colors shadow"
        >
          ← Return to Main Screen
        </button>
      )}

      {/* ================================================================ */}
      {/* SUBVIEWS */}
      {/* ================================================================ */}
      {activeTab === 'prices' && <CollectorPrices prices={prices} lang={lang} />}
      {activeTab === 'lots' && (
        <CollectorLots
          lots={lots}
          lang={lang}
          onRefresh={onRefresh}
          onTrackGps={(lot) => {
            setGpsTrackedLotId(lot.id);
            setActiveTab('gps');
          }}
        />
      )}
      {activeTab === 'gps' && (
        <CollectorGpsTracker
          lots={lots}
          lang={lang}
          initialLotId={gpsTrackedLotId}
          onOpenLotQr={(lot) => setSelectedLotForQr(lot)}
          onRefresh={onRefresh}
        />
      )}
      {activeTab === 'earnings' && (
        <CollectorEarnings payments={payments} lang={lang} />
      )}
      {activeTab === 'safety' && <CollectorSafety guides={safetyGuides} lang={lang} />}
      {activeTab === 'complaints' && (
        <CollectorComplaints
          complaints={complaints}
          lang={lang}
          onRefresh={onRefresh}
        />
      )}

      {/* ================================================================ */}
      {/* MAIN HOME VIEW - RESPONSIVE TACTILE DASHBOARD */}
      {/* ================================================================ */}
      {activeTab === 'home' && (
        <div className="space-y-4">
          {/* PRIMARY HERO ACTION: 📸 SELL / ADD E-WASTE */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full group relative p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-left shadow-2xl shadow-emerald-700/30 border-2 border-emerald-400/40 active:scale-[0.98] transition-all overflow-hidden"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Instant Valuation & QR Code
                </div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight">
                  {t.sellAddEwaste}
                </div>
                <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                  {t.quickActionPrompt}
                </p>
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                <Camera className="w-9 h-9 sm:w-11 sm:h-11" />
              </div>
            </div>
          </button>

          {/* DEDICATED GPS TRACKING HERO CARD */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-2 border-emerald-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-extrabold text-white">
                    Live Material GPS Radar
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Real-time Transit
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track scrap batches moving from {collector.operating_hub} to authorized smelters & recycling yards
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('gps')}
              className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 shrink-0 active:scale-95 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Open GPS Radar Map →</span>
            </button>
          </div>

          {/* SECONDARY LARGE ACTIONS GRID (Responsive 2 to 4 cols) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {/* 💰 Today's Prices */}
            <button
              onClick={() => setActiveTab('prices')}
              className="p-4 sm:p-5 rounded-3xl bg-slate-800 hover:bg-slate-750 border-2 border-amber-500/40 text-left space-y-3 shadow-lg active:scale-95 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Coins className="w-7 h-7 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <span className="text-sm sm:text-base font-extrabold text-slate-100 block">
                  {t.todaysPrices}
                </span>
                <span className="text-xs text-amber-300 font-semibold block mt-0.5">
                  Verified Buying Rates →
                </span>
              </div>
            </button>

            {/* 📦 My Lots */}
            <button
              onClick={() => setActiveTab('lots')}
              className="p-4 sm:p-5 rounded-3xl bg-slate-800 hover:bg-slate-750 border-2 border-teal-500/40 text-left space-y-3 shadow-lg active:scale-95 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                  <Package className="w-7 h-7 group-hover:scale-110 transition-transform" />
                </div>
                {activeLotsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {activeLotsCount} Active
                  </span>
                )}
              </div>
              <div>
                <span className="text-sm sm:text-base font-extrabold text-slate-100 block">
                  {t.myLots}
                </span>
                <span className="text-xs text-teal-300 font-semibold block mt-0.5">
                  QR Pass & Details →
                </span>
              </div>
            </button>

            {/* 💵 My Earnings */}
            <button
              onClick={() => setActiveTab('earnings')}
              className="p-4 sm:p-5 rounded-3xl bg-slate-800 hover:bg-slate-750 border-2 border-emerald-500/40 text-left space-y-3 shadow-lg active:scale-95 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Wallet className="w-7 h-7 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs font-extrabold text-emerald-400">
                  ₹{totalEarnings}
                </span>
              </div>
              <div>
                <span className="text-sm sm:text-base font-extrabold text-slate-100 block">
                  {t.myEarnings}
                </span>
                <span className="text-xs text-emerald-300 font-semibold block mt-0.5">
                  Cash & UPI Ledger →
                </span>
              </div>
            </button>

            {/* 🆘 Safety / Help */}
            <button
              onClick={() => setActiveTab('safety')}
              className="p-4 sm:p-5 rounded-3xl bg-slate-800 hover:bg-slate-750 border-2 border-rose-500/40 text-left space-y-3 shadow-lg active:scale-95 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                <ShieldAlert className="w-7 h-7 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <span className="text-sm sm:text-base font-extrabold text-slate-100 block">
                  {t.safetyHelp}
                </span>
                <span className="text-xs text-rose-300 font-semibold block mt-0.5">
                  Audio & Do's/Don'ts →
                </span>
              </div>
            </button>
          </div>

          {/* Grievance / Complaint Bar */}
          <button
            onClick={() => setActiveTab('complaints')}
            className="w-full p-4 rounded-2xl bg-slate-800/60 border border-slate-700 hover:border-slate-600 text-left flex items-center justify-between text-xs text-slate-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileQuestion className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">Need Help or Payment Issue? File a Grievance</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      )}

      {/* Add E-Waste Modal */}
      <AddEwasteModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          onRefresh();
        }}
        lang={lang}
        categories={categories}
        onOpenLot={(lot) => {
          setSelectedLotForDetail(lot);
        }}
        onTrackGps={(lot) => {
          setGpsTrackedLotId(lot.id);
          setActiveTab('gps');
        }}
      />

      {/* Direct Lot Details Modal */}
      <LotDetailModal
        isOpen={Boolean(selectedLotForDetail)}
        onClose={() => setSelectedLotForDetail(null)}
        lot={selectedLotForDetail}
        lang={lang}
        onOpenQr={(lot) => {
          setSelectedLotForDetail(null);
          setSelectedLotForQr(lot);
        }}
        onTrackGps={(lot) => {
          setSelectedLotForDetail(null);
          setGpsTrackedLotId(lot.id);
          setActiveTab('gps');
        }}
      />

      {/* Direct Lot QR Code Modal */}
      <LotQrCodeModal
        isOpen={Boolean(selectedLotForQr)}
        onClose={() => setSelectedLotForQr(null)}
        lot={selectedLotForQr}
        lang={lang}
        onTrackGps={(lot) => {
          setSelectedLotForQr(null);
          setGpsTrackedLotId(lot.id);
          setActiveTab('gps');
        }}
      />
    </div>
  );
};
