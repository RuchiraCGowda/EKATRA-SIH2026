import React, { useState } from 'react';
import { X, Send, IndianRupee, Clock, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Lot, RecyclerProfile, AppLanguage } from '../../types/database';
import { getTranslation } from '../../lib/i18n';
import { EkatraDB } from '../../lib/supabase';
import { getMaterialCategoryName } from '../../lib/materialHelpers';

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  lot: Lot | null;
  recycler: RecyclerProfile;
  lang: AppLanguage;
  onSuccess: () => void;
}

export const MakeOfferModal: React.FC<MakeOfferModalProps> = ({
  isOpen,
  onClose,
  lot,
  recycler,
  lang,
  onSuccess,
}) => {
  const t = getTranslation(lang);
  const [offeredRate, setOfferedRate] = useState<number>(
    lot?.category?.benchmark_price_per_kg || 180
  );
  const [pickupHours, setPickupHours] = useState<number>(4);
  const [pickupOffered, setPickupOffered] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>(
    lang === 'mr'
      ? 'प्रमाणित वजन काट्यासह वाहन तयार आहे.'
      : lang === 'hi'
      ? 'प्रमाणित वजन कांटे के साथ वाहन तैयार है।'
      : lang === 'gu'
      ? 'ચકાસાયેલ વજન કાંટા સાથે વાહન તૈયાર છે.'
      : lang === 'ta'
      ? 'சான்றளிக்கப்பட்ட எடை அளவீட்டுடன் வாகனம் தயார்.'
      : lang === 'te'
      ? 'సర్టిఫైడ్ ఎలక్ట్రానిక్ బరువు స్కేల్ వాహనం సిద్ధంగా ఉంది.'
      : lang === 'kn'
      ? 'ದೃಢೀಕೃತ ಎಲೆಕ್ಟ್ರಾನಿಕ್ ತೂಕದ ಮಾಪಕ ವಾಹನ ಸಿದ್ಧವಾಗಿದೆ.'
      : 'Certified electronic weighing scale vehicle ready.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !lot) return null;

  const totalOffer = Math.round(lot.approx_weight_kg * offeredRate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      EkatraDB.submitRecyclerOffer(
        lot.id,
        recycler.id,
        offeredRate,
        pickupOffered,
        pickupHours,
        notes
      );
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
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/60">
          <div>
            <h3 className="text-base font-bold">{t.makeOffer}</h3>
            <p className="text-xs text-slate-400">
              Lot: <span className="font-mono text-emerald-400 font-semibold">{lot.lot_code}</span>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 text-xs flex justify-between items-center">
            <div>
              <span className="text-slate-400 block">{t.step1Title}:</span>
              <span className="font-bold text-slate-100 text-sm">
                {getMaterialCategoryName(lot.category, lang)} ({lot.approx_weight_kg} kg)
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block">{t.todayRate}:</span>
              <span className="font-bold text-emerald-400 text-sm">
                ₹{lot.category?.benchmark_price_per_kg}/kg
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {t.offeredRatePerKg}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                min="10"
                max="5000"
                value={offeredRate}
                onChange={(e) => setOfferedRate(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">
              {lang === 'mr'
                ? 'एकूण देय रक्कम:'
                : lang === 'hi'
                ? 'कुल भुगतान राशि:'
                : lang === 'gu'
                ? 'કુલ ચૂકવણી રકમ:'
                : lang === 'ta'
                ? 'மொத்தக் கொடுப்பனவுத் தொகை:'
                : lang === 'te'
                ? 'మొత్తం చెల్లింపు మొత్తం:'
                : lang === 'kn'
                ? 'ಒಟ್ಟು ಪಾವತಿ ಮೊತ್ತ:'
                : 'Total Payout Amount:'}
            </span>
            <span className="text-xl font-extrabold text-emerald-400">
              ₹{totalOffer.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">
                {lang === 'mr'
                  ? 'पिकअप वाहन'
                  : lang === 'hi'
                  ? 'पिकअप वाहन'
                  : lang === 'gu'
                  ? 'પિકઅપ વાહન'
                  : lang === 'ta'
                  ? 'பிக்-அப் வாகனம்'
                  : lang === 'te'
                  ? 'పికప్ వాహనం'
                  : lang === 'kn'
                  ? 'ಪಿಕಪ್ ವಾಹನ'
                  : 'Pickup Vehicle'}
              </label>
              <select
                value={pickupOffered ? 'yes' : 'no'}
                onChange={(e) => setPickupOffered(e.target.value === 'yes')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="yes">
                  {lang === 'mr'
                    ? 'जागेवर जाऊन पिकअप'
                    : lang === 'hi'
                    ? 'स्थान पर पिकअप'
                    : lang === 'gu'
                    ? 'સ્થળ પર પિકઅપ'
                    : lang === 'ta'
                    ? 'வீட்டு வாசலில் பிக்-அப்'
                    : lang === 'te'
                    ? 'డోర్‌స్టెప్ పికప్'
                    : lang === 'kn'
                    ? 'ಸ್ಥಳದಲ್ಲೇ ಪಿಕಪ್'
                    : 'Doorstep Pickup Included'}
                </option>
                <option value="no">
                  {lang === 'mr'
                    ? 'केंद्रावर जमा'
                    : lang === 'hi'
                    ? 'हब पर जमा'
                    : lang === 'gu'
                    ? 'હબ પર જમા'
                    : lang === 'ta'
                    ? 'மையத்தில் ஒப்படைப்பு'
                    : lang === 'te'
                    ? 'హబ్‌లో అప్పగింత'
                    : lang === 'kn'
                    ? 'ಕೇಂದ್ರದಲ್ಲಿ ಡ್ರಾಪ್-ಆಫ್'
                    : 'Hub Drop-off'}
                </option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">
                {lang === 'mr'
                  ? 'अंदाजे वेळ'
                  : lang === 'hi'
                  ? 'अनुमानित समय'
                  : lang === 'gu'
                  ? 'અંદાજિત સમય'
                  : lang === 'ta'
                  ? 'பிக்-அப் நேரம்'
                  : lang === 'te'
                  ? 'పికప్ సమయం'
                  : lang === 'kn'
                  ? 'ಪಿಕಪ್ ಸಮಯ'
                  : 'Pickup ETA'}
              </label>
              <select
                value={pickupHours}
                onChange={(e) => setPickupHours(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
              >
                <option value="2">
                  {lang === 'mr'
                    ? '२ तासांच्या आत'
                    : lang === 'hi'
                    ? '2 घंटे के भीतर'
                    : lang === 'gu'
                    ? '૨ કલાકમાં'
                    : lang === 'ta'
                    ? '2 மணி நேரத்திற்குள்'
                    : lang === 'te'
                    ? '2 గంటల్లో'
                    : lang === 'kn'
                    ? '2 ಗಂಟೆಗಳಲ್ಲಿ'
                    : 'Within 2 Hours'}
                </option>
                <option value="4">
                  {lang === 'mr'
                    ? '४ तासांच्या आत'
                    : lang === 'hi'
                    ? '4 घंटे के भीतर'
                    : lang === 'gu'
                    ? '૪ કલાકમાં'
                    : lang === 'ta'
                    ? '4 மணி நேரத்திற்குள்'
                    : lang === 'te'
                    ? '4 గంటల్లో'
                    : lang === 'kn'
                    ? '4 ಗಂಟೆಗಳಲ್ಲಿ'
                    : 'Within 4 Hours'}
                </option>
                <option value="8">
                  {lang === 'mr'
                    ? '८ तासांच्या आत'
                    : lang === 'hi'
                    ? '8 घंटे के भीतर'
                    : lang === 'gu'
                    ? '૮ કલાકમાં'
                    : lang === 'ta'
                    ? '8 மணி நேரத்திற்குள்'
                    : lang === 'te'
                    ? '8 గంటల్లో'
                    : lang === 'kn'
                    ? '8 ಗಂಟೆಗಳಲ್ಲಿ'
                    : 'Within 8 Hours'}
                </option>
                <option value="24">
                  {lang === 'mr'
                    ? 'दुसऱ्या दिवशी'
                    : lang === 'hi'
                    ? 'अगले दिन'
                    : lang === 'gu'
                    ? 'બીજા દિવસે'
                    : lang === 'ta'
                    ? 'அடுத்த நாள்'
                    : lang === 'te'
                    ? 'మరుసటి రోజు'
                    : lang === 'kn'
                    ? 'ಮಾರನೆಯ ದಿನ'
                    : 'Next Day'}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">
              {lang === 'mr'
                ? 'पिकअप सूचना / नोंद'
                : lang === 'hi'
                ? 'पिकअप निर्देश / नोट'
                : lang === 'gu'
                ? 'પિકઅપ સૂચના / નોંધ'
                : lang === 'ta'
                ? 'பிக்-அப் வழிமுறைகள்'
                : lang === 'te'
                ? 'పికప్ సూచనలు / నోట్'
                : lang === 'kn'
                ? 'ಪಿಕಪ್ ಸೂಚನೆಗಳು / ಟಿಪ್ಪಣಿ'
                : 'Pickup Notes / Instructions'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 active:scale-95 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? t.loading : t.submitOffer}
          </button>
        </form>
      </div>
    </div>
  );
};
