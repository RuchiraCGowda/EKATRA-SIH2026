import React, { useState } from 'react';
import { X, CheckCircle, Scale, Camera, MapPin, IndianRupee, ShieldCheck, AlertCircle } from 'lucide-react';
import { Lot, RecyclerProfile, AppLanguage, PaymentMode } from '../../types/database';
import { getTranslation } from '../../lib/i18n';
import { EkatraDB } from '../../lib/supabase';
import { offlineSyncEngine } from '../../lib/offlineQueue';

interface ConfirmHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  lot: Lot | null;
  recycler: RecyclerProfile;
  lang: AppLanguage;
  onSuccess: () => void;
}

export const ConfirmHandoverModal: React.FC<ConfirmHandoverModalProps> = ({
  isOpen,
  onClose,
  lot,
  recycler,
  lang,
  onSuccess,
}) => {
  const t = getTranslation(lang);
  const [weightStr, setWeightStr] = useState<string>(String(lot?.approx_weight_kg || 15));
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [collectorOtp, setCollectorOtp] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !lot) return null;

  const parsedWeight = parseFloat(weightStr);
  const verifiedWeight = isNaN(parsedWeight) || parsedWeight <= 0 ? 1 : parsedWeight;
  const rate = lot.agreed_rate_per_kg || lot.category?.benchmark_price_per_kg || 150;
  const finalPayout = Math.round(verifiedWeight * rate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Verify OTP matches lot code last digits or handover OTP
    const expectedOtp = lot.handover_otp || lot.lot_code.slice(-4);
    const altOtp = lot.lot_code.slice(-4);
    if (collectorOtp.trim() !== expectedOtp && collectorOtp.trim() !== altOtp) {
      const otpErr =
        lang === 'mr'
          ? `अवैध ओटीपी! भंगार वेचकाच्या स्क्रीनवर ४ अंक दिसत आहेत: ${expectedOtp}`
          : lang === 'hi'
          ? `अमान्य ओटीपी! कलेक्टर की स्क्रीन पर ४-अंकीय कोड दिख रहा है: ${expectedOtp}`
          : lang === 'gu'
          ? `અમાન્ય ઓટીપી! કલેક્ટરની સ્ક્રીન પર ૪-અંકનો કોડ દર્શાવેલ છે: ${expectedOtp}`
          : lang === 'ta'
          ? `தவறான ஓடிபி! சேகரிப்பாளரின் திரையில் 4 இலக்க குறியீடு உள்ளது: ${expectedOtp}`
          : lang === 'te'
          ? `చెల్లని ఓటీపీ! కలెక్టర్ స్క్రీన్‌పై 4 అంకెల కోడ్ కనిపిస్తుంది: ${expectedOtp}`
          : lang === 'kn'
          ? 'ಅಮಾನ್ಯ ಒಟಿಪಿ! ಕಲೆಕ್ಟರ್ ಪರದೆಯ ಮೇಲೆ 4 ಅಂಕಿಯ ಕೋಡ್ ಕಾಣಿಸುತ್ತಿದೆ: ' + expectedOtp
          : `Invalid Handover OTP! The collector's screen displays the 4-digit code: ${expectedOtp}`;
      setErrorMsg(otpErr);
      return;
    }

    setIsSubmitting(true);
    try {
      const net = offlineSyncEngine.getNetworkStatus();
      if (!net.isOnline) {
        offlineSyncEngine.enqueue('confirm_handover', {
          lot_id: lot.id,
          recycler_id: recycler.id,
          verified_weight_kg: verifiedWeight,
          handover_photo_url: lot.primary_image_url,
          payment_mode: paymentMode,
          payment_reference:
            paymentReference ||
            (paymentMode === 'cash' ? `CASH-VOUCHER-${Date.now()}` : `UPI-REF-${Date.now()}`),
        });
      } else {
        EkatraDB.confirmHandover(
          lot.id,
          recycler.id,
          verifiedWeight,
          lot.primary_image_url,
          paymentMode,
          paymentReference
        );
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(t.networkErrorTitle);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/60">
          <div>
            <h3 className="text-base font-bold">{t.confirmHandover}</h3>
            <p className="text-xs text-slate-400">
              Lot: <span className="font-mono text-emerald-400">{lot.lot_code}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Calibrated Weight Entry */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {t.verifiedWeight} (kg)
            </label>
            <div className="relative">
              <Scale className="w-5 h-5 absolute left-3.5 top-2.5 text-emerald-400" />
              <input
                type="text"
                inputMode="decimal"
                value={weightStr}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*\.?\d*$/.test(val)) {
                    setWeightStr(val);
                  }
                }}
                placeholder="15"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-base font-bold text-white focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {lang === 'mr'
                ? `मान्य केलेला दर: ₹${rate}/किलो • तपासलेले वजन: ${verifiedWeight} किलो`
                : lang === 'hi'
                ? `सहमति दर: ₹${rate}/किग्रा • सत्यापित वजन: ${verifiedWeight} किग्रा`
                : lang === 'gu'
                ? `સંમત ભાવ: ₹${rate}/કિલો • ચકાસાયેલ વજન: ${verifiedWeight} કિલો`
                : lang === 'ta'
                ? `ஒப்புக்கொண்ட விலை: ₹${rate}/கிலோ • சரிபார்க்கப்பட்ட எடை: ${verifiedWeight} கிலோ`
                : lang === 'te'
                ? `అంగీకరించిన ధర: ₹${rate}/కిలో • ధృవీకరించిన బరువు: ${verifiedWeight} కిలో`
                : lang === 'kn'
                ? `ಒಪ್ಪಿದ ದರ: ₹${rate}/ಕೆಜಿ • ಪರಿಶೀಲಿಸಿದ ತೂಕ: ${verifiedWeight} ಕೆಜಿ`
                : `Agreed rate: ₹${rate}/kg • Verified: ${verifiedWeight} kg`}
            </span>
          </div>

          {/* Final Calculated Amount */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/40 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold">
              {lang === 'mr'
                ? 'एकूण सत्यापित अंतिम देय:'
                : lang === 'hi'
                ? 'कुल सत्यापित अंतिम भुगतान:'
                : lang === 'gu'
                ? 'કુલ ચકાસાયેલ અંતિમ ચૂકવણી:'
                : lang === 'ta'
                ? 'மொத்த சரிபார்க்கப்பட்ட கொடுப்பனவு:'
                : lang === 'te'
                ? 'మొత్తం ధృవీకరించిన చెల్లింపు:'
                : lang === 'kn'
                ? 'ಒಟ್ಟು ಪರಿಶೀಲಿಸಿದ ಅಂತಿಮ ಪಾವತಿ:'
                : 'Total Verified Payout:'}
            </span>
            <span className="text-2xl font-black text-emerald-400">
              ₹{finalPayout.toLocaleString()}
            </span>
          </div>

          {/* Handover OTP check from collector */}
          <div>
            <label className="text-xs font-bold text-amber-300 block mb-1">
              {lang === 'mr'
                ? 'वेचकाचा ४-अंकी हस्तांतरण ओटीपी कोड'
                : lang === 'hi'
                ? 'कलेक्टर का ४-अंकीय हैंडओवर कोड (OTP)'
                : lang === 'gu'
                ? 'કલેક્ટરનો ૪-અંકનો હેન્ડઓવર કોડ (OTP)'
                : lang === 'ta'
                ? 'சேகரிப்பாளரின் 4 இலக்க குறியீடு (OTP)'
                : lang === 'te'
                ? 'కలెక్టర్ 4-అంకెల హ్యాండ్‌ఓవర్ కోడ్ (OTP)'
                : lang === 'kn'
                ? 'ಕಲೆಕ್ಟರ್ 4-ಅಂಕಿಯ ಹಸ್ತಾಂತರ ಕೋಡ್ (OTP)'
                : 'Collector 4-Digit Handover Code (OTP)'}
            </label>
            <input
              type="text"
              maxLength={4}
              value={collectorOtp}
              onChange={(e) => setCollectorOtp(e.target.value)}
              placeholder="e.g. 0003"
              className="w-full bg-slate-800 border border-amber-500/50 rounded-xl px-4 py-2.5 text-center font-mono text-xl font-extrabold tracking-widest text-amber-300 focus:outline-none"
              required
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              {lang === 'mr'
                ? 'भंगार वेचकाच्या मोबाईल स्क्रीनवर दाखवलेला ४-अंकी कोड इथे प्रविष्ट करा.'
                : lang === 'hi'
                ? 'कलेक्टर के फोन पर प्रदर्शित ४-अंकीय कोड देखकर दर्ज करें।'
                : lang === 'gu'
                ? 'કલેક્ટરના ફોનમાં દેખાતો ૪-અંકનો કોડ અહીં દાખલ કરો.'
                : lang === 'ta'
                ? 'சேகரிப்பாளரின் திரையில் காட்டப்படும் 4 இலக்கக் குறியீட்டை உள்ளிடவும்.'
                : lang === 'te'
                ? 'కలెక్టర్ ఫోన్‌లో కనిపించే 4-అంకెల కోడ్‌ను నమోదు చేయండి.'
                : lang === 'kn'
                ? 'ಕಲೆಕ್ಟರ್ ಫೋನ್‌ನಲ್ಲಿ ಪ್ರದರ್ಶಿಸಲಾದ 4-ಅಂಕಿಯ ಕೋಡ್ ನಮೂದಿಸಿ.'
                : 'Ask the collector to show the 4-digit code displayed on their phone.'}
            </span>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              {t.paymentMode}
            </label>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMode('cash')}
                className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                  paymentMode === 'cash'
                    ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                💵 {t.cashPayment}
                <span className="text-[10px] text-slate-400 block font-normal mt-0.5">
                  Cash Receipt
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('upi')}
                className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                  paymentMode === 'upi'
                    ? 'bg-teal-950/50 border-teal-500 text-teal-300 ring-1 ring-teal-500'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                📱 {t.upiPayment}
                <span className="text-[10px] text-slate-400 block font-normal mt-0.5">
                  UPI / IMPS
                </span>
              </button>
            </div>
          </div>

          {/* Payment Reference Input */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              {lang === 'mr'
                ? 'पावती क्रमांक / यूपीआय संदर्भ (पर्यायी)'
                : lang === 'hi'
                ? 'रसीद संख्या / यूपीआई संदर्भ (वैकल्पिक)'
                : lang === 'gu'
                ? 'રસીદ નંબર / યુપીઆઈ સંદર્ભ (વૈકલ્પિક)'
                : lang === 'ta'
                ? 'ரசீது எண் / யுபிஐ குறிப்பு எண் (விருப்பத்தேர்வு)'
                : lang === 'te'
                ? 'రసీదు సంఖ్య / యూపీఐ రిఫరెన్స్ (ఐచ్ఛికం)'
                : lang === 'kn'
                ? 'ರಶೀದಿ ಸಂಖ್ಯೆ / ಯುಪಿಐ ಉಲ್ಲೇಖ (ಐಚ್ಛಿಕ)'
                : 'Payment Voucher / UPI Reference (Optional)'}
            </label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder={
                paymentMode === 'cash' ? 'Voucher / Receipt ID' : 'Bank UTR / UPI Ref ID'
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              GPS: {lot.location_name}
            </span>
            <span className="text-emerald-400 font-semibold">{t.verifiedBadge}</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 active:scale-95 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            {isSubmitting ? t.loading : t.confirmHandover}
          </button>
        </form>
      </div>
    </div>
  );
};
