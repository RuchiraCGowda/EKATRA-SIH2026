import React from 'react';
import { IndianRupee, Wallet, Clock, CheckCircle2, ArrowDownLeft, ShieldCheck } from 'lucide-react';
import { Payment, AppLanguage } from '../../types/database';
import { getTranslation } from '../../lib/i18n';
import { AudioButton } from '../common/AudioButton';
import { getMaterialCategoryName } from '../../lib/materialHelpers';

interface CollectorEarningsProps {
  payments: Payment[];
  lang: AppLanguage;
}

export const CollectorEarnings: React.FC<CollectorEarningsProps> = ({ payments, lang }) => {
  const t = getTranslation(lang);

  const totalEarnings = payments.reduce((acc, p) => acc + p.amount_inr, 0);
  const cashPayments = payments.filter((p) => p.payment_mode === 'cash');
  const upiPayments = payments.filter((p) => p.payment_mode === 'upi');

  const cashTotal = cashPayments.reduce((acc, p) => acc + p.amount_inr, 0);
  const upiTotal = upiPayments.reduce((acc, p) => acc + p.amount_inr, 0);

  const audioText =
    lang === 'mr'
      ? `तुमची एकूण कमाई ₹${totalEarnings} रुपये आहे. यामध्ये रोख रक्कम ₹${cashTotal} आणि यूपीआय ₹${upiTotal} आहे.`
      : lang === 'hi'
      ? `आपकी कुल कमाई ₹${totalEarnings} रुपये है। नकद ₹${cashTotal} और ऑनलाइन ₹${upiTotal}।`
      : lang === 'gu'
      ? `તમારી કુલ કમાણી ₹${totalEarnings} છે. રોકડ ₹${cashTotal} અને યુપીઆઈ ₹${upiTotal}.`
      : lang === 'ta'
      ? `உங்கள் மொத்த வருமானம் ₹${totalEarnings} ரூபாய். ரொக்கம் ₹${cashTotal} மற்றும் யுபிஐ ₹${upiTotal}.`
      : lang === 'te'
      ? `మీ మొత్తం సంపాదన ₹${totalEarnings} రూపాయలు. నగదు ₹${cashTotal} మరియు యుపిఐ ₹${upiTotal}.`
      : lang === 'kn'
      ? `ನಿಮ್ಮ ಒಟ್ಟು ಗಳಿಕೆ ₹${totalEarnings} ರೂಪಾಯಿ. ನಗದು ₹${cashTotal} ಮತ್ತು ಯುಪಿಐ ₹${upiTotal}.`
      : `Your total verified earnings are ${totalEarnings} Rupees. Cash total is ${cashTotal} and UPI is ${upiTotal}.`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">{t.myEarnings}</h2>
          <p className="text-xs text-slate-400">
            {lang === 'mr'
              ? 'सत्यापित पारदर्शक व्यवहार आणि जमा झालेले पैसे'
              : lang === 'hi'
              ? 'सत्यापित पारदर्शी लेन-देन और प्राप्त भुगतान'
              : lang === 'gu'
              ? 'ચકાસાયેલ પારદર્શક વ્યવહારો અને જમા રકમ'
              : lang === 'ta'
              ? 'சரிபார்க்கப்பட்ட வெளிப்படையான பரிவர்த்தனை கொடுப்பனவுகள்'
              : lang === 'te'
              ? 'ధృవీకరించబడిన పారదర్శక లావాదేవీల చెల్లింపులు'
              : lang === 'kn'
              ? 'ಪರಿಶೀಲಿಸಿದ ಪಾರದರ್ಶಕ ವಹಿವಾಟು ಪಾವತಿಗಳು'
              : 'Verified transparent transaction payouts'}
          </p>
        </div>
        <AudioButton textToSpeak={audioText} lang={lang} size="md" />
      </div>

      {/* Main Total Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900/60 via-slate-800 to-teal-900/50 border border-emerald-500/40 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Wallet className="w-4 h-4" />
            {lang === 'mr'
              ? 'एकूण मिळालेली कमाई'
              : lang === 'hi'
              ? 'कुल अर्जित आय'
              : lang === 'gu'
              ? 'કુલ પ્રાપ્ત આવક'
              : lang === 'ta'
              ? 'மொத்த பெறப்பட்ட வருமானம்'
              : lang === 'te'
              ? 'మొత్తం పొందిన ఆదాయం'
              : lang === 'kn'
              ? 'ಒಟ್ಟು ಪಡೆದ ಆದಾಯ'
              : 'Total Realized Income'}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {lang === 'mr'
              ? '१००% खात्यात जमा'
              : lang === 'hi'
              ? '100% भुगतान संपन्न'
              : lang === 'gu'
              ? '100% ચૂકવણી સંપન્ન'
              : lang === 'ta'
              ? '100% தீர்க்கப்பட்டது'
              : lang === 'te'
              ? '100% పరిష్కరించబడింది'
              : lang === 'kn'
              ? '100% ಇತ್ಯರ್ಥವಾಗಿದೆ'
              : '100% Settled'}
          </span>
        </div>

        <div className="flex items-baseline gap-1 text-white">
          <span className="text-3xl font-bold text-emerald-400">₹</span>
          <span className="text-5xl font-black tracking-tight">{totalEarnings.toLocaleString()}</span>
        </div>

        {/* Split Pills */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-700/80">
            <span className="text-[11px] text-slate-400 block">{t.cashPayment}</span>
            <span className="text-lg font-bold text-emerald-300">₹{cashTotal.toLocaleString()}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-700/80">
            <span className="text-[11px] text-slate-400 block">{t.upiPayment}</span>
            <span className="text-lg font-bold text-teal-300">₹{upiTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payout Records */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-slate-200">
          {lang === 'mr'
            ? 'अलीकडील जमा पावत्या व नोंदी'
            : lang === 'hi'
            ? 'हालिया भुगतान रिकॉर्ड'
            : lang === 'gu'
            ? 'તાજેતરના ચુકવણી રેકોર્ડ્સ'
            : lang === 'ta'
            ? 'சமீபத்திய பணம் செலுத்திய பதிவுகள்'
            : lang === 'te'
            ? 'ఇటీవలి చెల్లింపు రికార్డులు'
            : lang === 'kn'
            ? 'ಇತ್ತೀಚಿನ ಪಾವತಿ ದಾಖಲೆಗಳು'
            : 'Recent Payout Records'}
        </h3>
        {payments.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm bg-slate-800/40 rounded-2xl border border-slate-800">
            {t.emptyState}
          </div>
        ) : (
          payments.map((p) => (
            <div
              key={p.id}
              className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-100 text-sm">
                    {p.recycler?.company_name ||
                      (lang === 'mr'
                        ? 'अधिकृत रीसायक्लर'
                        : lang === 'hi'
                        ? 'अधिकृत रीसाइक्लर'
                        : lang === 'gu'
                        ? 'અધિકૃત રિસાયકલર'
                        : lang === 'ta'
                        ? 'அங்கீகரிக்கப்பட்ட மறுசுழற்சியாளர்'
                        : lang === 'te'
                        ? 'అధీకృత రీసైక్లర్'
                        : lang === 'kn'
                        ? 'ಅಧಿಕೃತ ರಿಸೈಕ್ಲರ್'
                        : 'Authorized Recycler')}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {p.transaction_code} • {p.payment_reference}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {new Date(p.completed_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="font-black text-emerald-400 text-base block">
                  +₹{p.amount_inr}
                </span>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-900 text-slate-300 border border-slate-700">
                  {p.payment_mode === 'cash' ? t.cashPayment : t.upiPayment}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
