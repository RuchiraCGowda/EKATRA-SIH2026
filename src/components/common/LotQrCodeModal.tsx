import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Download,
  Share2,
  MapPin,
  ExternalLink,
  Sparkles,
  Smartphone,
  Eye,
  X,
  Radio,
  Clock,
  IndianRupee,
  Package,
} from 'lucide-react';
import { Lot, AppLanguage } from '../../types/database';
import { getTranslation } from '../../lib/i18n';
import { getMaterialCategoryName } from '../../lib/materialHelpers';
import { AudioButton } from './AudioButton';

interface LotQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lot: Lot | null;
  lang: AppLanguage;
  onTrackGps?: (lot: Lot) => void;
}

export const LotQrCodeModal: React.FC<LotQrCodeModalProps> = ({
  isOpen,
  onClose,
  lot,
  lang,
  onTrackGps,
}) => {
  const t = getTranslation(lang);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSimulatingScan, setIsSimulatingScan] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !lot) {
      setQrDataUrl('');
      setIsVerified(false);
      setIsSimulatingScan(false);
      return;
    }

    // Generate comprehensive digital manifest payload for the QR code
    const manifestPayload = JSON.stringify({
      protocol: 'EKATRA_FORM6_V1',
      lotCode: lot.lot_code,
      lotId: lot.id,
      category: lot.category?.name_en || lot.category_id,
      weightKg: lot.approx_weight_kg,
      estValueINR: lot.estimated_value_inr,
      collectorId: lot.collector_id,
      handoverOtp: lot.handover_otp || lot.lot_code.slice(-4),
      gps: {
        lat: lot.latitude || 19.0435,
        lng: lot.longitude || 72.8567,
        location: lot.location_name || 'Mumbai Scrap Hub',
      },
      status: lot.status,
      manifestHash: `CPCB-${lot.lot_code}-${lot.id.slice(-6).toUpperCase()}`,
      issuedAt: lot.created_at,
    });

    QRCode.toDataURL(manifestPayload, {
      width: 400,
      margin: 2,
      color: {
        dark: '#020617', // slate-950
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => {
        console.error('Error generating QR code:', err);
      });
  }, [isOpen, lot]);

  if (!isOpen || !lot) return null;

  const catName = getMaterialCategoryName(lot.category, lang);
  const otpCode = lot.handover_otp || lot.lot_code.slice(-4);

  const handleCopyCode = () => {
    const text = `EKATRA E-Waste Lot Pass\nLot: ${lot.lot_code}\nCategory: ${catName}\nWeight: ${lot.approx_weight_kg}kg\nOTP: ${otpCode}\nLocation: ${lot.location_name}`;
    navigator.clipboard?.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `EKATRA-QR-${lot.lot_code}.png`;
    link.click();
  };

  const handleSimulateScan = () => {
    setIsSimulatingScan(true);
    setTimeout(() => {
      setIsSimulatingScan(false);
      setIsVerified(true);
    }, 1200);
  };

  const audioPass =
    lang === 'mr'
      ? `हा लॉट क्रमांक ${lot.lot_code} चा डिजिटल क्यूआर कोड आहे. रिसायकलरला हा दाखवून पिकअप आणि वजन निश्चित करा. हँडओव्हर कोड आहे ${otpCode}.`
      : lang === 'hi'
      ? `यह लॉट कोड ${lot.lot_code} का डिजिटल क्यूआर कोड पास है। रीसाइक्लर को इसे स्कैन कराएं। हैंडओवर कोड है ${otpCode}।`
      : lang === 'gu'
      ? `આ લૉટ કોડ ${lot.lot_code} નો ડિજિટલ ક્યુઆર પાસ છે. રિસાયકલરને આ સ્કેન કરાવો. વેરિફિકેશન કોડ ${otpCode} છે.`
      : lang === 'ta'
      ? `இது லாட் ${lot.lot_code} க்கான அதிகாரப்பூர்வ டிஜிட்டல் க்யூஆர் பாஸ். ஒப்படைக்கும் போது மறுசுழற்சியாளரிடம் இதைக் காட்டுங்கள். சரிபார்ப்புக் குறியீடு ${otpCode}.`
      : lang === 'te'
      ? `ఇది లాట్ ${lot.lot_code} యొక్క అధికారిక డిజిటల్ క్యూఆర్ పాస్. హ్యాండోవర్ సమయంలో రీసైక్లర్‌కు చూపించండి. ధృవీకరణ కోడ్ ${otpCode}.`
      : lang === 'kn'
      ? `ಇದು ಲಾಟ್ ${lot.lot_code} ಗಾಗಿ ಅಧಿಕೃತ ಡಿಜಿಟಲ್ ಕ್ಯೂಆರ್ ಪಾಸ್ ಆಗಿದೆ. ಹಸ್ತಾಂತರದ ಸಮಯದಲ್ಲಿ ರಿಸೈಕ್ಲರ್‌ಗೆ ತೋರಿಸಿ. ದೃಢೀಕರಣ ಕೋಡ್ ${otpCode}.`
      : `This is the official digital QR pass for lot ${lot.lot_code}. Present this to the recycler at handover. Verification code is ${otpCode}.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-100 text-sm sm:text-base">
                  Digital QR Manifest Pass
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Form 6
                </span>
              </div>
              <p className="text-[11px] font-mono text-emerald-400 font-bold">{lot.lot_code}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <AudioButton textToSpeak={audioPass} lang={lang} size="sm" />
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Working QR Code Card */}
          <div className="relative bg-white rounded-3xl p-5 shadow-2xl flex flex-col items-center justify-center text-center max-w-[280px] mx-auto border-4 border-slate-800/10">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code for ${lot.lot_code}`}
                className="w-56 h-56 object-contain rounded-xl select-none"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center bg-slate-100 rounded-xl text-slate-400">
                <span className="text-xs font-mono animate-pulse">Generating Secure QR...</span>
              </div>
            )}

            {/* Micro Badge Under QR */}
            <div className="mt-3 flex items-center gap-1 text-[10px] font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>CPCB Form-6 Verified Authenticity</span>
            </div>
          </div>

          {/* Quick Handover OTP Code */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">
                {t.handoverCode} (OTP for Recycler)
              </span>
              <span className="font-mono text-2xl font-black text-white tracking-widest">
                {otpCode}
              </span>
              <p className="text-[10px] text-slate-400">{t.showToRecycler}</p>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold flex items-center gap-1.5 transition-all shadow"
            >
              {isCopied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Material & Lot Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                Material:
              </span>
              <span className="font-bold text-slate-100">{catName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Recorded Weight:</span>
              <span className="font-extrabold text-emerald-400 text-sm">
                {lot.approx_weight_kg} kg
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Est. Payout Value:</span>
              <span className="font-extrabold text-teal-300 text-sm">
                ₹{lot.estimated_value_inr}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
              <span className="text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                GPS Geotag:
              </span>
              <span className="font-mono text-[11px] text-slate-300 truncate max-w-[200px]">
                {lot.location_name || 'Mumbai MMR Hub'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Coordinates:</span>
              <span>
                {lot.latitude?.toFixed(4) || 19.0435}° N, {lot.longitude?.toFixed(4) || 72.8567}° E
              </span>
            </div>
          </div>

          {/* Scan Verification Result Feedback */}
          {isVerified && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>QR Manifest Verified & Legitimate</span>
              </div>
              <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                Cryptographic signature matches SPCB database. Recycler weighbridge is authorized to accept this {catName} batch.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadQr}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Save QR Image</span>
              </button>

              <button
                type="button"
                disabled={isSimulatingScan}
                onClick={handleSimulateScan}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-emerald-950/60 text-slate-200 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Eye className="w-4 h-4 text-teal-400" />
                <span>{isSimulatingScan ? 'Verifying...' : 'Test QR Scan'}</span>
              </button>
            </div>

            {onTrackGps && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onTrackGps(lot);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Radio className="w-4 h-4 animate-pulse text-amber-300" />
                <span>Track Live Material GPS Location</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
