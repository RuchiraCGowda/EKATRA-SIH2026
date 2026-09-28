import React, { useState } from 'react';
import { AlertCircle, Send, CheckCircle2, Clock, X } from 'lucide-react';
import { Complaint, AppLanguage } from '../../types/database';
import { getTranslation } from '../../lib/i18n';
import { EkatraDB } from '../../lib/supabase';
import { offlineSyncEngine } from '../../lib/offlineQueue';

interface CollectorComplaintsProps {
  complaints: Complaint[];
  lang: AppLanguage;
  onRefresh: () => void;
}

export const CollectorComplaints: React.FC<CollectorComplaintsProps> = ({
  complaints,
  lang,
  onRefresh,
}) => {
  const t = getTranslation(lang);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('payment_delay');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categoryOptions = [
    {
      id: 'payment_delay',
      label:
        lang === 'mr'
          ? 'पेमेंट मिळण्यास विलंब'
          : lang === 'hi'
          ? 'भुगतान में देरी'
          : lang === 'gu'
          ? 'ચૂકવણીમાં વિલંબ'
          : lang === 'ta'
          ? 'பணம் செலுத்துவதில் தாமதம்'
          : lang === 'te'
          ? 'చెల్లింపులో ఆలస్యం'
          : lang === 'kn'
          ? 'ಪಾವತಿಯಲ್ಲಿ ವಿಳಂಬ'
          : 'Payment Delay Inquiry',
    },
    {
      id: 'weight_discrepancy',
      label:
        lang === 'mr'
          ? 'काट्यावरील वजनात तफावत'
          : lang === 'hi'
          ? 'वजन में अंतर / गड़बड़ी'
          : lang === 'gu'
          ? 'વજનમાં વિસંગતતા'
          : lang === 'ta'
          ? 'எடையில் முரண்பாடு'
          : lang === 'te'
          ? 'బరువులో వ్యత్యాసం'
          : lang === 'kn'
          ? 'ತೂಕದಲ್ಲಿ ವ್ಯತ್ಯಾಸ'
          : 'Weight Discrepancy at Handover',
    },
    {
      id: 'unsafe_handling',
      label:
        lang === 'mr'
          ? 'असुरक्षित हाताळणी किंवा वाहन समस्या'
          : lang === 'hi'
          ? 'असुरक्षित हैंडलिंग या वाहन समस्या'
          : lang === 'gu'
          ? 'અસુરક્ષિત સંભાળ અથવા વાહનની ખામી'
          : lang === 'ta'
          ? 'பாதுகாப்பற்ற கையாளுதல் / வாகனக் குறைபாடு'
          : lang === 'te'
          ? 'అసౌకర్య హ్యాండ్లింగ్ / వాహన లోపం'
          : lang === 'kn'
          ? 'ಅಸುರಕ್ಷಿತ ನಿರ್ವಹಣೆ / ವಾಹನ ಲೋಪ'
          : 'Unsafe Handling / Vehicle Default',
    },
    {
      id: 'recycler_inquiry',
      label:
        lang === 'mr'
          ? 'पुनर्चक्रणकाराची अधिकृतता चौकशी'
          : lang === 'hi'
          ? 'रीसाइक्लर सत्यापन पूछताछ'
          : lang === 'gu'
          ? 'રિસાયકલર ચકાસણી તપાસ'
          : lang === 'ta'
          ? 'மறுசுழற்சியாளர் சரிபார்ப்பு விசாரணை'
          : lang === 'te'
          ? 'రీసైక్లర్ ధృవీకరణ విచారణ'
          : lang === 'kn'
          ? 'ರಿಸೈಕ್ಲರ್ ಪರಿಶೀಲನಾ ವಿಚಾರಣೆ'
          : 'Recycler Verification Inquiry',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedOption = categoryOptions.find((o) => o.id === category);
      const categoryLabel = selectedOption ? selectedOption.label : category;

      const net = offlineSyncEngine.getNetworkStatus();
      if (!net.isOnline) {
        offlineSyncEngine.enqueue('file_complaint', { category: categoryLabel, description });
      } else {
        EkatraDB.fileComplaint(categoryLabel, description);
      }
      setDescription('');
      setShowForm(false);
      onRefresh();
      const successNotice =
        lang === 'mr'
          ? 'तक्रार यशस्वीरित्या नोंदवली गेली आहे. नियामक कक्ष लवकरच तपासणी करेल.'
          : lang === 'hi'
          ? 'शिकायत सफलतापूर्वक दर्ज हो गई। नियामक डेस्क इसकी जांच करेगा।'
          : lang === 'gu'
          ? 'ફરિયાદ સફળતાપૂર્વક નોંધાઈ ગઈ છે. નિયમનકારી ડેસ્ક તપાસ કરશે.'
          : lang === 'ta'
          ? 'புகார் வெற்றிகரமாகப் பதிவு செய்யப்பட்டது. ஒழுங்குமுறை மேசை விசாரிக்கும்.'
          : lang === 'te'
          ? 'ఫిర్యాదు విజయవంతంగా నమోదైంది. నియంత్రణ విభాగం విచారిస్తుంది.'
          : lang === 'kn'
          ? 'ದೂರು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ. ನಿಯಂತ್ರಕ ಡೆಸ್ಕ್ ತನಿಖೆ ಮಾಡುತ್ತದೆ.'
          : 'Grievance submitted successfully. Regulatory desk will investigate.';
      setToastMessage(successNotice);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white px-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">{t.complaints}</h2>
          <p className="text-xs text-slate-400">
            {lang === 'mr'
              ? 'नियामक तक्रार निवारण व सुरक्षित व्यवहार मध्यस्थता'
              : lang === 'hi'
              ? 'नियामक शिकायत निवारण और सुरक्षित लेनदेन मध्यस्थता'
              : lang === 'gu'
              ? 'નિયમનકારી ફરિયાદ નિવારણ અને મધ્યસ્થતા'
              : lang === 'ta'
              ? 'ஒழுங்குமுறை குறை தீர்ப்பு மற்றும் மத்தியஸ்தம்'
              : lang === 'te'
              ? 'నియంత్రణ ఫిర్యాదుల పరిష్కారం & లావాదేవీల మధ్యవర్తిత్వం'
              : lang === 'kn'
              ? 'ನಿಯಂತ್ರಕ ಕುಂದುಕೊರತೆ ಪರಿಹಾರ ಮತ್ತು ಮಧ್ಯಸ್ಥಿಕೆ'
              : 'Regulatory grievance redressal & transaction mediation'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md"
        >
          {showForm
            ? t.cancel
            : lang === 'mr'
            ? '+ नवीन तक्रार नोंदवा'
            : lang === 'hi'
            ? '+ नई शिकायत दर्ज करें'
            : lang === 'gu'
            ? '+ નવી ફરિયાદ નોંધો'
            : lang === 'ta'
            ? '+ புதிய புகார் பதிவு செய்க'
            : lang === 'te'
            ? '+ కొత్త ఫిర్యాదు చేయండి'
            : lang === 'kn'
            ? '+ ಹೊಸ ದೂರು ಸಲ್ಲಿಸಿ'
            : '+ Raise Grievance'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-5 rounded-3xl bg-slate-800/90 border border-amber-500/40 space-y-3.5 shadow-xl"
        >
          <h3 className="font-bold text-sm text-amber-300">
            {lang === 'mr'
              ? 'तक्रार अर्ज भरा'
              : lang === 'hi'
              ? 'शिकायत विवरण भरें'
              : lang === 'gu'
              ? 'ફરિયાદ ફોર્મ ભરો'
              : lang === 'ta'
              ? 'புகார் படிவத்தை நிரப்பவும்'
              : lang === 'te'
              ? 'ఫిర్యాదు ఫారమ్ పూరించండి'
              : lang === 'kn'
              ? 'ದೂರು ಫಾರ್ಮ್ ಭರ್ತಿ ಮಾಡಿ'
              : 'File a Grievance'}
          </h3>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              {lang === 'mr'
                ? 'समस्येचा प्रकार'
                : lang === 'hi'
                ? 'समस्या की श्रेणी'
                : lang === 'gu'
                ? 'સમસ્યાનો પ્રકાર'
                : lang === 'ta'
                ? 'பிரச்சினை வகை'
                : lang === 'te'
                ? 'సమస్య వర్గం'
                : lang === 'kn'
                ? 'ಸಮಸ್ಯೆಯ ವರ್ಗ'
                : 'Issue Category'}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              {lang === 'mr'
                ? 'तपशील व काय घडले ते लिहा'
                : lang === 'hi'
                ? 'विवरण व क्या हुआ वह लिखें'
                : lang === 'gu'
                ? 'વિગતો અને શું બન્યું તે લખો'
                : lang === 'ta'
                ? 'விவரங்கள் மற்றும் என்ன நடந்தது என்பதை எழுதவும்'
                : lang === 'te'
                ? 'వివరాలు & ఏమి జరిగిందో రాయండి'
                : lang === 'kn'
                ? 'ವಿವರಗಳು ಮತ್ತು ಏನು ಸಂಭವಿಸಿತು ಬರೆಯಿರಿ'
                : 'Details & Description'}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                lang === 'mr'
                  ? 'पिकअप किंवा पेमेंट दरम्यान काय अडचण आली ते स्पष्ट करा...'
                  : lang === 'hi'
                  ? 'पिकअप या भुगतान के दौरान क्या समस्या आई वह बताएं...'
                  : lang === 'gu'
                  ? 'પિકઅપ અથવા ચુકવણી દરમિયાન શું સમસ્યા આવી તે જણાવો...'
                  : lang === 'ta'
                  ? 'பிக்-அப் அல்லது பணம் செலுத்தும் போது என்ன சிக்கல் ஏற்பட்டது என்பதை விளக்குங்கள்...'
                  : lang === 'te'
                  ? 'పికప్ లేదా చెల్లింపు సమయంలో ఏమి జరిగిందో వివరించండి...'
                  : lang === 'kn'
                  ? 'ಪಿಕಪ್ ಅಥವಾ ಪಾವತಿ ಸಮಯದಲ್ಲಿ ಏನು ಸಮಸ್ಯೆ ಉಂಟಾಯಿತು ವಿವರಿಸಿ...'
                  : 'Describe what occurred during pickup or settlement...'
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {isSubmitting
              ? t.loading
              : lang === 'mr'
              ? 'नियामक कक्षाकडे तक्रार सादर करा'
              : lang === 'hi'
              ? 'नियामक डेस्क को शिकायत भेजें'
              : lang === 'gu'
              ? 'નિયમનકારી ડેસ્કને સબમિટ કરો'
              : lang === 'ta'
              ? 'ஒழுங்குமுறை மேசைக்கு சமர்ப்பிக்கவும்'
              : lang === 'te'
              ? 'నియంత్రణ డెస్క్‌కు సమర్పించండి'
              : lang === 'kn'
              ? 'ನಿಯಂತ್ರಕ ಡೆಸ್ಕ್‌ಗೆ ಸಲ್ಲಿಸಿ'
              : 'Submit to Regulatory Desk'}
          </button>
        </form>
      )}

      {/* Existing Grievances */}
      <div className="space-y-3">
        {complaints.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm bg-slate-800/40 rounded-2xl border border-slate-800">
            {lang === 'mr'
              ? 'सध्या कोणतीही नोंदवलेली तक्रार नाही'
              : lang === 'hi'
              ? 'वर्तमान में कोई शिकायत दर्ज नहीं है'
              : lang === 'gu'
              ? 'હાલમાં કોઈ ફરિયાદ નોંધાયેલ નથી'
              : lang === 'ta'
              ? 'தற்போது எந்தப் புகாரும் பதிவு செய்யப்படவில்லை'
              : lang === 'te'
              ? 'ప్రస్తుతం ఎలాంటి ఫిర్యాదులు నమోదు కాలేదు'
              : lang === 'kn'
              ? 'ಪ್ರಸ್ತುತ ಯಾವುದೇ ದೂರು ದಾಖಲಾಗಿಲ್ಲ'
              : 'No complaints currently recorded'}
          </div>
        ) : (
          complaints.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-400">
                  {c.complaint_code}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    c.status === 'resolved'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {c.status === 'resolved'
                    ? (lang === 'mr'
                        ? 'निवारण झाले'
                        : lang === 'hi'
                        ? 'समाधान हुआ'
                        : lang === 'gu'
                        ? 'નિવારણ થયું'
                        : lang === 'ta'
                        ? 'தீர்க்கப்பட்டது'
                        : lang === 'te'
                        ? 'పరిష్కరించబడింది'
                        : lang === 'kn'
                        ? 'ಪರಿಹರಿಸಲಾಗಿದೆ'
                        : 'Resolved')
                    : lang === 'mr'
                    ? 'तपास सुरू'
                    : lang === 'hi'
                    ? 'जांच प्रगति पर'
                    : lang === 'gu'
                    ? 'તપાસ ચાલુ છે'
                    : lang === 'ta'
                    ? 'விசாரணையில்'
                    : lang === 'te'
                    ? 'విచారణలో ఉంది'
                    : lang === 'kn'
                    ? 'ತನಿಖೆಯಲ್ಲಿದೆ'
                    : 'UNDER INVESTIGATION'}
                </span>
              </div>
              <div className="font-bold text-slate-200">{c.category}</div>
              <p className="text-slate-400 leading-relaxed">{c.description}</p>
              {c.admin_notes && (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/60 text-emerald-300 text-[11px]">
                  <span className="font-semibold text-slate-300 block">
                    {lang === 'mr'
                      ? 'नियामक निर्णय:'
                      : lang === 'hi'
                      ? 'नियामक कार्रवाई:'
                      : lang === 'gu'
                      ? 'નિયમનકારી પગલાં:'
                      : lang === 'ta'
                      ? 'ஒழுங்குமுறை நடவடிக்கை:'
                      : lang === 'te'
                      ? 'నియంత్రణ చర్య:'
                      : lang === 'kn'
                      ? 'ನಿಯಂತ್ರಕ ಕ್ರಮ:'
                      : 'Regulatory Action:'}
                  </span>
                  {c.admin_notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
