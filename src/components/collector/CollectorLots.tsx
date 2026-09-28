import React, { useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  IndianRupee,
  ShieldCheck,
  ChevronRight,
  QrCode,
  MapPin,
  ArrowRight,
  Radio,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { Lot, AppLanguage, LotStatus } from '../../types/database';
import { getTranslation } from '../../lib/i18n';
import { AudioButton } from '../common/AudioButton';
import { EkatraDB } from '../../lib/supabase';
import { getMaterialCategoryName } from '../../lib/materialHelpers';
import { LotDetailModal } from './LotDetailModal';
import { LotQrCodeModal } from '../common/LotQrCodeModal';

interface CollectorLotsProps {
  lots: Lot[];
  lang: AppLanguage;
  onRefresh: () => void;
  onTrackGps?: (lot: Lot) => void;
}

export const CollectorLots: React.FC<CollectorLotsProps> = ({
  lots,
  lang,
  onRefresh,
  onTrackGps,
}) => {
  const t = getTranslation(lang);
  const [selectedLotForDetail, setSelectedLotForDetail] = useState<Lot | null>(null);
  const [selectedLotForQr, setSelectedLotForQr] = useState<Lot | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const getStatusBadge = (status: LotStatus) => {
    const labels: Record<LotStatus, Record<AppLanguage, string>> = {
      collected: {
        mr: 'नोंदवले',
        hi: 'दर्ज हुआ',
        gu: 'નોંધાયેલ',
        ta: 'பதிவு செய்யப்பட்டது',
        te: 'నమోదైంది',
        kn: 'ದಾಖಲಿಸಲಾಗಿದೆ',
        en: 'Collected',
      },
      offer_received: {
        mr: 'ऑफर आली',
        hi: 'बोली मिली',
        gu: 'ઑફર મળી',
        ta: 'சலுகை வந்தது',
        te: 'ఆఫర్ వచ్చింది',
        kn: 'ಆಫರ್ ಬಂದಿದೆ',
        en: 'Offer Received',
      },
      recycler_selected: {
        mr: 'खरेदीदार ठरला',
        hi: 'स्वीकृत',
        gu: 'ખરીદદાર નક્કી થયો',
        ta: 'மறுசுழற்சியாளர் தேர்வு',
        te: 'రీసైక్లర్ ఎంపికైంది',
        kn: 'ಮರುಬಳಕೆದಾರ ಆಯ್ಕೆ',
        en: 'Recycler Selected',
      },
      handover_scheduled: {
        mr: 'हस्तांतरण नियोजित',
        hi: 'हैंडओवर निर्धारित',
        gu: 'હસ્તાંતરણ નક્કી થયું',
        ta: 'ஒப்படைப்பு திட்டமிடப்பட்டது',
        te: 'హ్యాండోవర్ షెడ్యూల్ అయింది',
        kn: 'ಹಸ್ತಾಂತರ ನಿಗದಿಯಾಗಿದೆ',
        en: 'Handover Scheduled',
      },
      handover_completed: {
        mr: 'हस्तांतरण झाले',
        hi: 'हैंडओवर पूर्ण',
        gu: 'હસ્તાંતરણ પૂર્ણ',
        ta: 'ஒப்படைப்பு நிறைவுற்றது',
        te: 'హ్యాండోవర్ పూర్తయింది',
        kn: 'ಹಸ್ತಾಂತರ ಪೂರ್ಣಗೊಂಡಿದೆ',
        en: 'Handover Done',
      },
      payment_completed: {
        mr: 'पैसे मिळाले',
        hi: 'भुगतान पूर्ण',
        gu: 'ચૂકવણી પૂર્ણ',
        ta: 'பணம் செலுத்தப்பட்டது',
        te: 'చెల్లింపు పూర్తయింది',
        kn: 'ಪಾವತಿ ಪೂರ್ಣಗೊಂಡಿದೆ',
        en: 'Payment Completed',
      },
      valued: {
        mr: 'मूल्यांकन झाले',
        hi: 'मूल्यांकन पूर्ण',
        gu: 'મૂલ્યાંકન થયું',
        ta: 'மதிப்பிடப்பட்டது',
        te: 'విలువ నిర్ధారించబడింది',
        kn: 'ಮೌಲ್ಯಮಾಪನ ಮಾಡಲಾಗಿದೆ',
        en: 'Valued',
      },
      matched: {
        mr: 'खरेदीदार जुळला',
        hi: 'खरीदार मिला',
        gu: 'ખરીદનાર મળ્યો',
        ta: 'பொருந்தியது',
        te: 'సరిపోలింది',
        kn: 'ಹೊಂದಾಣಿಕೆಯಾಗಿದೆ',
        en: 'Matched',
      },
      disposed_recycled: {
        mr: 'पुनर्प्रक्रिया पूर्ण',
        hi: 'पुनर्चक्रण पूर्ण',
        gu: 'રિસાયકલિંગ પૂર્ણ',
        ta: 'மறுசுழற்சி செய்யப்பட்டது',
        te: 'రీసైకిల్ చేయబడింది',
        kn: 'ಮರುಬಳಕೆ ಪೂರ್ಣಗೊಂಡಿದೆ',
        en: 'Disposed & Recycled',
      },
      cancelled: {
        mr: 'रद्द केले',
        hi: 'रद्द हुआ',
        gu: 'રદ કરેલ',
        ta: 'ரத்து செய்யப்பட்டது',
        te: 'రద్దు చేయబడింది',
        kn: 'ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ',
        en: 'Cancelled',
      },
    };

    const colors: Record<LotStatus, string> = {
      collected: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      valued: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      matched: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      offer_received: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      recycler_selected: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      handover_scheduled: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      handover_completed: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      payment_completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      disposed_recycled: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30',
      cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    };

    const localizedLabel = labels[status]?.[lang] || labels[status]?.en || status;
    const badgeColor = colors[status] || 'bg-slate-700 text-slate-300';

    return { label: localizedLabel, color: badgeColor };
  };

  const handleAcceptOffer = (lotId: string, offerId: string) => {
    try {
      EkatraDB.acceptOffer(lotId, offerId);
      onRefresh();
      const successMsgs: Record<AppLanguage, string> = {
        mr: 'ऑफर स्वीकारली! अधिकृत रिसायकलरला पिकअपसाठी संदेश पाठवला आहे.',
        hi: 'ऑफर स्वीकार किया गया! अधिकृत रीसाइक्लर को पिकअप की सूचना भेज दी गई है।',
        gu: 'ઑફર સ્વીકારાઈ! અધિકૃત રિસાયકલરને પીકઅપ માટે સૂચના મોકલાઈ ગઈ છે.',
        ta: 'சலுகை ஏற்கப்பட்டது! அங்கீகரிக்கப்பட்ட மறுசுழற்சியாளருக்கு தகவல் அனுப்பப்பட்டது.',
        te: 'ఆఫర్ ఆమోదించబడింది! అధీకృత రీసైక్లర్‌కు సమాచారం పంపబడింది.',
        kn: 'ಆಫರ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ! ಅಧಿಕೃತ ಮರುಬಳಕೆದಾರರಿಗೆ ಮಾಹಿತಿ ಕಳುಹಿಸಲಾಗಿದೆ.',
        en: 'Offer accepted! The authorized recycler has been notified for pickup.',
      };
      setToastMessage(successMsgs[lang] || successMsgs.en);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Localized Toast Banner */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-xl animate-in fade-in">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-400 hover:text-white px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Title Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">{t.myLots}</h2>
          <p className="text-xs text-slate-400">
            Traceable digital lots, scannable QR passes, and GPS telemetry
          </p>
        </div>
        <AudioButton
          textToSpeak={
            lang === 'mr'
              ? 'येथे तुमची सर्व नोंदवलेली लॉट्स, क्यूआर कोड आणि जीपीएस ट्रॅकिंग दिसेल. कोणत्याही लॉटवर क्लिक करून त्याचे पूर्ण तपशील उघडा.'
              : lang === 'hi'
              ? 'यहाँ आपके सभी ई-कचरा लॉट्स, क्यूआर कोड और जीपीएस ट्रैकिंग उपलब्ध हैं। किसी भी लॉट पर क्लिक करके पूरा विवरण खोलें।'
              : lang === 'gu'
              ? 'અહીં તમારા બધા નોંધાયેલા લૉટ્સ, ક્યુઆર કોડ અને જીપીએસ ટ્રેકિંગ ઉપલબ્ધ છે. કોઈપણ લૉટ પર ક્લિક કરીને સંપૂર્ણ વિગતો જુઓ.'
              : lang === 'ta'
              ? 'இங்கு உங்கள் அனைத்துப் பதிவு செய்யப்பட்ட லாட்டுகள், க்யூஆர் குறியீடு மற்றும் ஜிபிஎஸ் கண்காணிப்பு உள்ளன. முழு விவரங்களை அறிய ஏதேனும் ஒரு லாட்டைத் தட்டவும்.'
              : lang === 'te'
              ? 'ఇక్కడ మీ నమోదిత లాట్లు, క్యూఆర్ కోడ్ మరియు జీపీఎస్ ట్రాకింగ్ ఉన్నాయి. పూర్తి వివరాల కోసం ఏదైనా లాట్ పై క్లిక్ చేయండి.'
              : lang === 'kn'
              ? 'ಇಲ್ಲಿ ನಿಮ್ಮ ಎಲ್ಲಾ ನೋಂದಾಯಿತ ಲಾಟ್‌ಗಳು, ಕ್ಯೂಆರ್ ಕೋಡ್ ಮತ್ತು ಜಿಪಿಎಸ್ ಟ್ರ್ಯಾಕಿಂಗ್ ಲಭ್ಯವಿದೆ. ಪೂರ್ಣ ವಿವರಗಳನ್ನು ನೋಡಲು ಯಾವುದೇ ಲಾಟ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ.'
              : 'Here are all your recorded scrap lots, digital QR passes, and GPS tracking. Tap any lot to open full details.'
          }
          lang={lang}
          size="md"
        />
      </div>

      {lots.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-800/40 border border-slate-700/60 text-slate-400 space-y-2">
          <Package className="w-10 h-10 mx-auto text-slate-500" />
          <p>{t.emptyState}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lots.map((lot) => {
            const statusInfo = getStatusBadge(lot.status);
            const offers = lot.offers || [];
            const catName = getMaterialCategoryName(lot.category, lang);
            const otpCode = lot.handover_otp || lot.lot_code.slice(-4);

            const audioText =
              lang === 'mr'
                ? `लॉट क्रमांक ${lot.lot_code}. ${catName}, वजन ${lot.approx_weight_kg} किलो. सद्यस्थिती ${statusInfo.label}.`
                : lang === 'hi'
                ? `लॉट कोड ${lot.lot_code}. सामान ${catName}, वजन ${lot.approx_weight_kg} किलो. स्थिति ${statusInfo.label}।`
                : lang === 'gu'
                ? `લૉટ કોડ ${lot.lot_code}. માલ ${catName}, વજન ${lot.approx_weight_kg} કિગ્રા. સ્થિતિ ${statusInfo.label}.`
                : lang === 'ta'
                ? `லாட் குறியீடு ${lot.lot_code}. பொருள் ${catName}, எடை ${lot.approx_weight_kg} கிலோ. நிலை ${statusInfo.label}.`
                : lang === 'te'
                ? `లాట్ కోడ్ ${lot.lot_code}. మెటీరియల్ ${catName}, బరువు ${lot.approx_weight_kg} కిలోలు. స్థితి ${statusInfo.label}.`
                : lang === 'kn'
                ? `ಲಾಟ್ ಕೋಡ್ ${lot.lot_code}. ಸಾಮಗ್ರಿ ${catName}, ತೂಕ ${lot.approx_weight_kg} ಕೆಜಿ. ಸ್ಥಿತಿ ${statusInfo.label}.`
                : `Lot code ${lot.lot_code} for ${catName}, weight ${lot.approx_weight_kg} kg. Status is ${statusInfo.label}.`;

            return (
              <div
                key={lot.id}
                className="p-4 rounded-3xl bg-slate-800/85 border border-slate-700/90 hover:border-emerald-500/50 transition-all shadow-md hover:shadow-xl space-y-3"
              >
                {/* Header row - Clickable to open full lot modal */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => setSelectedLotForDetail(lot)}
                    className="flex items-center gap-3 cursor-pointer group flex-1"
                  >
                    <div className="w-13 h-13 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-slate-700 group-hover:border-emerald-500/50 transition-all">
                      <img
                        src={
                          lot.primary_image_url ||
                          lot.category?.image_url ||
                          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80'
                        }
                        alt={catName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-emerald-400 group-hover:underline">
                          {lot.lot_code}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-100 text-sm sm:text-base mt-0.5 group-hover:text-emerald-300 transition-colors">
                        {catName}
                      </h3>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        <span className="truncate max-w-[200px]">
                          {lot.location_name || 'Mumbai Scrap Hub'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <AudioButton textToSpeak={audioText} lang={lang} size="sm" />
                    <button
                      onClick={() => setSelectedLotForDetail(lot)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="Open Lot Details"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metric Strip */}
                <div
                  onClick={() => setSelectedLotForDetail(lot)}
                  className="grid grid-cols-3 gap-2 bg-slate-900/70 p-2.5 rounded-2xl text-center text-xs cursor-pointer hover:bg-slate-900 transition-colors"
                >
                  <div>
                    <span className="text-[10px] text-slate-400 block">Weight</span>
                    <span className="font-black text-slate-200">{lot.approx_weight_kg} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Est. Value</span>
                    <span className="font-black text-emerald-400">₹{lot.estimated_value_inr}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Final Sale</span>
                    <span className="font-black text-teal-300">
                      {lot.final_sale_value_inr ? `₹${lot.final_sale_value_inr}` : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Working QR Code & Handover Card */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedLotForQr(lot)}
                      className="p-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl border border-emerald-500/40 shadow transition-all active:scale-95 flex items-center justify-center shrink-0"
                      title="Open Working QR Code Pass"
                    >
                      <QrCode className="w-5 h-5 text-emerald-400" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                          OTP: {otpCode}
                        </span>
                        <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700">
                          Form 6
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-200 block">
                        Digital Handover QR Pass
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View QR Code Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedLotForQr(lot)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                      <span>View QR</span>
                    </button>

                    {/* Open Lot Details Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedLotForDetail(lot)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/40 active:scale-95 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Open Lot</span>
                    </button>
                  </div>
                </div>

                {/* Recycler Offers Accordion/Action */}
                {offers.length > 0 && lot.status === 'offer_received' && (
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-2">
                    <span className="text-xs font-bold text-amber-400 block">
                      {t.viewOffers} ({offers.length})
                    </span>
                    {offers.map((offer) => (
                      <div
                        key={offer.id}
                        className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-100">
                            {offer.recycler?.company_name}
                          </div>
                          <div className="text-emerald-400 font-bold mt-0.5">
                            ₹{offer.offered_rate_per_kg}/kg • Total: ₹{offer.total_offered_amount}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Pickup in ~{offer.estimated_pickup_hours} hrs
                          </div>
                        </div>

                        <button
                          onClick={() => handleAcceptOffer(lot.id, offer.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md active:scale-95"
                        >
                          {t.acceptOffer}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom Actions: GPS Tracking link & Handover status */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                  {onTrackGps ? (
                    <button
                      type="button"
                      onClick={() => onTrackGps(lot)}
                      className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 transition-colors text-[11px]"
                    >
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      <span>Track Material GPS</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-mono">
                      GPS: {lot.latitude?.toFixed(3)}°, {lot.longitude?.toFixed(3)}°
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedLotForDetail(lot)}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    <span>Full Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lot Details Modal */}
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
          if (onTrackGps) onTrackGps(lot);
        }}
        onAcceptOffer={handleAcceptOffer}
      />

      {/* Working Lot QR Code Modal */}
      <LotQrCodeModal
        isOpen={Boolean(selectedLotForQr)}
        onClose={() => setSelectedLotForQr(null)}
        lot={selectedLotForQr}
        lang={lang}
        onTrackGps={(lot) => {
          setSelectedLotForQr(null);
          if (onTrackGps) onTrackGps(lot);
        }}
      />
    </div>
  );
};
