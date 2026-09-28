import React, { useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  IndianRupee,
  ShieldCheck,
  QrCode,
  MapPin,
  ArrowRight,
  X,
  Radio,
  ExternalLink,
  Calendar,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { Lot, AppLanguage, LotStatus } from '../../types/database';
import { getTranslation } from '../../lib/i18n';
import { AudioButton } from '../common/AudioButton';
import { getMaterialCategoryName } from '../../lib/materialHelpers';
import { LotQrCodeModal } from '../common/LotQrCodeModal';

interface LotDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lot: Lot | null;
  lang: AppLanguage;
  onOpenQr?: (lot: Lot) => void;
  onTrackGps?: (lot: Lot) => void;
  onAcceptOffer?: (lotId: string, offerId: string) => void;
}

export const LotDetailModal: React.FC<LotDetailModalProps> = ({
  isOpen,
  onClose,
  lot,
  lang,
  onOpenQr,
  onTrackGps,
  onAcceptOffer,
}) => {
  const t = getTranslation(lang);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  if (!isOpen || !lot) return null;

  const catName = getMaterialCategoryName(lot.category, lang);
  const otpCode = lot.handover_otp || lot.lot_code.slice(-4);

  const getStatusStepIndex = (status: LotStatus): number => {
    switch (status) {
      case 'collected':
      case 'valued':
        return 1;
      case 'offer_received':
      case 'matched':
        return 2;
      case 'recycler_selected':
      case 'handover_scheduled':
        return 3;
      case 'handover_completed':
        return 4;
      case 'payment_completed':
      case 'disposed_recycled':
        return 5;
      default:
        return 1;
    }
  };

  const currentStep = getStatusStepIndex(lot.status);

  const steps = [
    { title: 'Lot Created', desc: 'Material catalogued' },
    { title: 'Market Bids', desc: 'Recycler offers' },
    { title: 'Recycler Match', desc: 'Handover scheduled' },
    { title: 'Weigh & Custody', desc: 'Verified receipt' },
    { title: 'Direct Payout', desc: 'Instant bank transfer' },
  ];

  const audioDetail =
    lang === 'mr'
      ? `लॉट क्रमांक ${lot.lot_code}. सामान: ${catName}, वजन ${lot.approx_weight_kg} किलो. सद्यस्थिती: ${lot.status}. क्यूआर कोड पाहण्यासाठी खालील बटण दाबा.`
      : lang === 'hi'
      ? `लॉट कोड ${lot.lot_code}. सामग्री: ${catName}, वजन ${lot.approx_weight_kg} किलो. स्थिति: ${lot.status}। क्यूआर कोड देखने के लिए नीचे दिए गए बटन पर टैप करें।`
      : lang === 'gu'
      ? `લૉટ કોડ ${lot.lot_code}. સામગ્રી: ${catName}, વજન ${lot.approx_weight_kg} કિગ્રા. સ્થિતિ: ${lot.status}. ક્યુઆર કોડ જોવા માટે નીચે બટન દબાવો.`
      : lang === 'ta'
      ? `லாட் குறியீடு ${lot.lot_code}. பொருள்: ${catName}, எடை ${lot.approx_weight_kg} கிலோ. நிலை: ${lot.status}. க்யூஆர் பாஸைப் பார்க்க கீழே உள்ள பொத்தானைத் தட்டவும்.`
      : lang === 'te'
      ? `లాట్ కోడ్ ${lot.lot_code}. సరుకు: ${catName}, బరువు ${lot.approx_weight_kg} కిలోలు. స్థితి: ${lot.status}. క్యూఆర్ కోడ్ చూడటానికి క్రింది బటన్‌ను నొక్కండి.`
      : lang === 'kn'
      ? `ಲಾಟ್ ಕೋಡ್ ${lot.lot_code}. ಸಾಮಗ್ರಿ: ${catName}, ತೂಕ ${lot.approx_weight_kg} ಕೆಜಿ. ಸ್ಥಿತಿ: ${lot.status}. ಕ್ಯೂಆರ್ ಪಾಸ್ ವೀಕ್ಷಿಸಲು ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿರಿ.`
      : `Lot ${lot.lot_code} for ${catName}, weight ${lot.approx_weight_kg} kg. Tap the QR button to display the digital handover pass.`;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
        <div className="bg-slate-900 border border-slate-700/90 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] animate-in zoom-in-95">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 p-0.5 border border-emerald-500/30 overflow-hidden shrink-0">
                <img
                  src={
                    lot.primary_image_url ||
                    lot.category?.image_url ||
                    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={catName}
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {lot.lot_code}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {lot.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-100 text-base sm:text-lg mt-0.5">
                  {catName}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <AudioButton textToSpeak={audioDetail} lang={lang} size="sm" />
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2.5 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Net Weight</span>
                <span className="font-black text-slate-100 text-sm sm:text-base">
                  {lot.approx_weight_kg} kg
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Est. Value</span>
                <span className="font-black text-emerald-400 text-sm sm:text-base">
                  ₹{lot.estimated_value_inr}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Final Payout</span>
                <span className="font-black text-teal-300 text-sm sm:text-base">
                  {lot.final_sale_value_inr ? `₹${lot.final_sale_value_inr}` : 'Pending'}
                </span>
              </div>
            </div>

            {/* Prominent QR Code Access Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                    Digital QR Manifest
                  </span>
                  <span className="text-[11px] font-mono text-amber-300 font-bold">
                    OTP: {otpCode}
                  </span>
                </div>
                <h4 className="font-bold text-slate-100 text-sm">
                  Official Form 6 Handover Pass
                </h4>
                <p className="text-[11px] text-slate-400">
                  Tap to display full scannable barcode for recycler check-in
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onOpenQr) onOpenQr(lot);
                  else setShowQrModal(true);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-900/40 flex items-center gap-2 shrink-0 active:scale-95 transition-all"
              >
                <QrCode className="w-4 h-4" />
                <span>Open QR</span>
              </button>
            </div>

            {/* GPS Location & Material Tracking Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>Material GPS Location</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Geotagged
                </span>
              </div>

              <div className="text-xs text-slate-300 flex items-center justify-between">
                <span className="truncate max-w-[240px]">
                  {lot.location_name || 'Mumbai Scrap Hub'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {lot.latitude?.toFixed(4)}, {lot.longitude?.toFixed(4)}
                </span>
              </div>

              {onTrackGps && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onTrackGps(lot);
                  }}
                  className="w-full mt-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Live GPS Radar & Transit Tracker</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}
            </div>

            {/* Assigned Recycler or Available Bids */}
            {lot.selected_recycler && (
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-400" />
                    Authorized Recycler:
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                    Verified CPCB
                  </span>
                </div>
                <div className="font-bold text-slate-100 text-sm">
                  {lot.selected_recycler.company_name}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {lot.selected_recycler.facility_address}
                </div>
              </div>
            )}

            {/* Chain of Custody Timeline */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Chain of Custody Tracking
              </span>

              <div className="space-y-3">
                {steps.map((st, i) => {
                  const stepNum = i + 1;
                  const isDone = currentStep > stepNum;
                  const isCurrent = currentStep === stepNum;

                  return (
                    <div key={st.title} className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isDone
                            ? 'bg-emerald-500 text-white'
                            : isCurrent
                            ? 'bg-amber-500 text-slate-950 animate-pulse'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {isDone ? '✓' : stepNum}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold ${
                              isDone || isCurrent ? 'text-slate-100' : 'text-slate-500'
                            }`}
                          >
                            {st.title}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                              Active State
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{st.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recycler Offers (if any) */}
            {lot.offers && lot.offers.length > 0 && lot.status === 'offer_received' && (
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                <span className="text-xs font-bold text-amber-400 block">
                  Received Recycler Offers ({lot.offers.length})
                </span>
                {lot.offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-100">
                        {offer.recycler?.company_name}
                      </div>
                      <div className="text-emerald-400 font-bold mt-0.5">
                        ₹{offer.offered_rate_per_kg}/kg (Total ₹{offer.total_offered_amount})
                      </div>
                    </div>
                    {onAcceptOffer && (
                      <button
                        onClick={() => {
                          onAcceptOffer(lot.id, offer.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow active:scale-95 transition-all"
                      >
                        {t.acceptOffer}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs transition-colors"
            >
              {t.close}
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenQr) onOpenQr(lot);
                else setShowQrModal(true);
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>View Working QR Code Pass</span>
            </button>
          </div>
        </div>
      </div>

      {/* Internal QR Code Modal fallback */}
      <LotQrCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        lot={lot}
        lang={lang}
        onTrackGps={onTrackGps}
      />
    </>
  );
};
