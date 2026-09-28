import React, { useState } from 'react';
import { IndianRupee, ShieldCheck, TrendingUp, BarChart2 } from 'lucide-react';
import { PriceRecord, AppLanguage } from '../../types/database';
import { getTranslation } from '../../lib/i18n';
import { AudioButton } from '../common/AudioButton';
import { PriceTrendChart } from './PriceTrendChart';
import { getMaterialCategoryName, getPriceSubCategoryName } from '../../lib/materialHelpers';

interface CollectorPricesProps {
  prices: PriceRecord[];
  lang: AppLanguage;
}

export const CollectorPrices: React.FC<CollectorPricesProps> = ({ prices, lang }) => {
  const t = getTranslation(lang);
  // Default to showing graphs for all materials so collector immediately sees the visual trend
  const [expandedGraphIds, setExpandedGraphIds] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    prices.forEach((p) => {
      map[p.id] = true;
    });
    return map;
  });

  const toggleGraph = (id: string) => {
    setExpandedGraphIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getAudioSummary = (p: PriceRecord) => {
    const catName = getMaterialCategoryName(p.category, lang);

    if (lang === 'mr') {
      return `${catName} चा आजचा अधिकृत खरेदी दर ₹${p.buying_price_per_kg} रुपये प्रति किलो आहे. बाजारातील श्रेणी ₹${p.market_min_price} ते ₹${p.market_max_price} आहे. खाली आलेखात भाववाढ दाखवली आहे.`;
    }
    if (lang === 'hi') {
      return `${catName} का आज का खरीद भाव ₹${p.buying_price_per_kg} रुपये प्रति किलो है। नीचे ग्राफ में दर का रुझान देखें।`;
    }
    if (lang === 'gu') {
      return `${catName} નો આજનો ભાવ ₹${p.buying_price_per_kg} પ્રતિ કિલો છે. નીચે ગ્રાફમાં ફેરફાર દર્શાવેલ છે.`;
    }
    if (lang === 'ta') {
      return `${catName} இன்றைய கொள்முதல் விலை கிலோவுக்கு ₹${p.buying_price_per_kg} ரூபாய் ஆகும். கீழே வரைபடத்தில் விலை மாற்றம் காட்டப்பட்டுள்ளது.`;
    }
    if (lang === 'te') {
      return `${catName} నేటి కొనుగోలు ధర కిలోకు ₹${p.buying_price_per_kg} రూపాయలు. క్రింద గ్రాఫ్ చూడండి.`;
    }
    if (lang === 'kn') {
      return `${catName} ಇಂದಿನ ಅಧಿಕೃತ ಖರೀದಿ ದರ ಕೆಜಿಗೆ ₹${p.buying_price_per_kg} ರೂಪಾಯಿ. ಕೆಳಗಿನ ಗ್ರಾಫ್ ಪರಿಶೀಲಿಸಿ.`;
    }
    return `Today's verified rate for ${catName} is ${p.buying_price_per_kg} Rupees per kilogram. Market range is ${p.market_min_price} to ${p.market_max_price} Rupees.`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">{t.priceRegistryTitle}</h2>
          <p className="text-xs text-slate-400">
            {lang === 'mr'
              ? 'प्रदूषण नियंत्रण मंडळ अधिकृत एकत्रित खरेदी दर निर्देशांक व ऐतिहासिक आलेखी कल'
              : lang === 'hi'
              ? 'प्रदूषण नियंत्रण बोर्ड अधिकृत सत्यापित मूल्य सूचकांक व ऐतिहासिक ग्राफ'
              : lang === 'gu'
              ? 'નિયમનકારી ચકાસાયેલ ભાવ સૂચકાંક અને ઐતિહાસિક આલેખ'
              : lang === 'ta'
              ? 'மாசு கட்டுப்பாட்டு வாரிய சரிபார்க்கப்பட்ட விலை குறியீடு & வரலாற்று வரைபடம்'
              : lang === 'te'
              ? 'కాలుష్య నియంత్రణ మండలి ధృవీకరించిన ధర సూచిక & చారిత్రక గ్రాఫ్'
              : lang === 'kn'
              ? 'ಮಾಲಿನ್ಯ ನಿಯಂತ್ರಣ ಮಂಡಳಿ ಪರಿಶೀಲಿಸಿದ ಬೆಲೆ ಸೂಚ್ಯಂಕ & ಐತಿಹಾಸಿಕ ಗ್ರಾಫ್'
              : 'CPCB / SPCB Authorized Aggregator Verified Price Index & Historical Trend Graphs'}
          </p>
        </div>
        <AudioButton
          textToSpeak={
            lang === 'mr'
              ? 'येथे आजचे अधिकृत शासकीय दर आणि भावाचा चढ-उतार आलेख दिलेला आहे. ऐकण्यासाठी स्पीकर बटण दाबा.'
              : lang === 'hi'
              ? 'यहाँ आज के सरकारी अधिकृत रेट और मूल्य परिवर्तन ग्राफ दिए गए हैं। सुनने के लिए स्पीकर दबाएं।'
              : lang === 'gu'
              ? 'અહીં આજનો સત્તાવાર ભાવ અને ભાવ વધઘટનો આલેખ આપેલો છે. સાંભળવા માટે સ્પીકર દબાવો.'
              : lang === 'ta'
              ? 'இங்கு இன்றைய அரசு அங்கீகரிக்கப்பட்ட விலை மற்றும் விலை வரைபடம் கொடுக்கப்பட்டுள்ளது. கேட்க ஸ்பீக்கரை அழுத்தவும்.'
              : lang === 'te'
              ? 'ఇక్కడ నేటి అధికారిక ధరలు మరియు మార్కెట్ గ్రాఫ్ ఇవ్వబడ్డాయి. వినడానికి స్పీకర్‌ను నొక్కండి.'
              : lang === 'kn'
              ? 'ಇಲ್ಲಿ ಇಂದಿನ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ದರಗಳು ಮತ್ತು ಬೆಲೆ ಏರಿಳಿತದ ಗ್ರಾಫ್ ನೀಡಲಾಗಿದೆ. ಕೇಳಲು ಸ್ಪೀಕರ್ ಒತ್ತಿರಿ.'
              : "Here are today's verified rates and historical price movement graphs. Tap speaker to listen."
          }
          lang={lang}
          size="md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prices.map((p) => {
          const catName = getMaterialCategoryName(p.category, lang);
          const subCatName = getPriceSubCategoryName(p, lang);
          const isGraphOpen = expandedGraphIds[p.id] ?? true;

          return (
            <div
              key={p.id}
              className="p-4 rounded-3xl bg-slate-800/85 border border-slate-700/80 hover:border-emerald-500/40 transition-all shadow-xl flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-slate-700">
                    <img
                      src={p.category?.image_url}
                      alt={catName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-base leading-snug">
                      {catName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{subCatName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleGraph(p.id)}
                    className={`p-1.5 rounded-xl border transition-all text-xs font-bold flex items-center gap-1 ${
                      isGraphOpen
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                    title="Toggle Price Graph"
                  >
                    <BarChart2 className="w-4 h-4" />
                    <span className="text-[10px] hidden sm:inline">Graph</span>
                  </button>

                  <AudioButton
                    textToSpeak={getAudioSummary(p)}
                    lang={lang}
                    size="sm"
                  />
                </div>
              </div>

              {/* Price Details */}
              <div className="mt-3.5 pt-3 border-t border-slate-700/60 flex items-end justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {t.todayRate}
                  </span>
                  <div className="flex items-baseline gap-1 text-emerald-400 font-extrabold text-2xl">
                    <span>₹{p.buying_price_per_kg}</span>
                    <span className="text-xs text-slate-400 font-normal">/ {p.unit}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    {t.marketRange}
                  </span>
                  <div className="text-xs text-slate-300 font-medium">
                    ₹{p.market_min_price} – ₹{p.market_max_price} / {p.unit}
                  </div>
                </div>
              </div>

              {/* PRICE TREND GRAPH (Always available for collector) */}
              {isGraphOpen && <PriceTrendChart price={p} lang={lang} />}

              {/* Provenance Footer */}
              <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/60 px-2.5 py-1.5 rounded-xl border border-slate-800">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t.verifiedSource}
                </span>
                <span className="text-slate-400 truncate max-w-[180px] font-mono text-[10px]">
                  {p.price_source}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
