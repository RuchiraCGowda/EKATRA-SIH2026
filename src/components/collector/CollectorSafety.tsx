import React from 'react';
import { ShieldAlert, Flame, Ban, Check, X, AlertTriangle } from 'lucide-react';
import { SafetyGuide, AppLanguage } from '../../types/database';
import { getTranslation } from '../../lib/i18n';
import { AudioButton } from '../common/AudioButton';

interface CollectorSafetyProps {
  guides: SafetyGuide[];
  lang: AppLanguage;
}

export const CollectorSafety: React.FC<CollectorSafetyProps> = ({ guides, lang }) => {
  const t = getTranslation(lang);

  // Multilingual mapping for safety guides across all 7 supported languages
  const getGuideData = (g: SafetyGuide) => {
    // Battery Guide
    if (g.hazard_code === 'HAZ-BAT') {
      if (lang === 'mr') {
        return {
          title: g.title_mr,
          warning: g.short_warning_mr,
          dos: g.dos_mr,
          donts: g.donts_mr,
        };
      }
      if (lang === 'hi') {
        return {
          title: g.title_hi,
          warning: g.short_warning_hi,
          dos: g.dos_hi,
          donts: g.donts_hi,
        };
      }
      if (lang === 'gu') {
        return {
          title: 'બેટરી આગ અને એસિડથી સુરક્ષા',
          warning: 'લિથિયમ બેટરીમાં કાણું ન પાડવું કે એસિડ બેટરીને અગ્નિ પાસે ન રાખવી.',
          dos: ['સૂકા હવાદાર બોક્સમાં રાખો', 'બેટરીના છેડા પર ટેપ લગાવો', 'જાડા રબરના ગ્લોવ્સ પહેરો'],
          donts: ['પાણીમાં ન નાખો', 'હથોડીથી ન તોડો', 'એસિડનો ધુમાડો શ્વાસમાં ન લો'],
        };
      }
      if (lang === 'ta') {
        return {
          title: 'பேட்டரி தீ & அமிலப் பாதுகாப்பு',
          warning: 'லித்தியம் பேட்டரிகளைத் துளையிடவோ நெருப்பின் அருகில் வைக்கவோ கூடாது.',
          dos: ['உலர்ந்த பெட்டியில் வைக்கவும்', 'முனைகளில் டேப் ஒட்டவும்', 'ரப்பர் கையுறைகள் அணியவும்'],
          donts: ['தண்ணீரில் போடாதீர்கள்', 'சுத்தியலால் உடைக்காதீர்கள்', 'புகையை சுவாசிக்காதீர்கள்'],
        };
      }
      if (lang === 'te') {
        return {
          title: 'బ్యాటరీ అగ్ని మరియు యాసిడ్ రక్షణ',
          warning: 'లిథియం బ్యాటరీలను పగలగొట్టవద్దు లేదా మంటల దగ్గర ఉంచవద్దు.',
          dos: ['పొడి పెట్టెలో నిల్వ చేయండి', 'టెర్మినల్స్‌పై టేప్ వేయండి', 'రబ్బరు చేతి తొడుగులు ధరించండి'],
          donts: ['నీటిలో వేయవద్దు', 'సుత్తితో కొట్టవద్దు', 'యాసిడ్ పొగలను పీల్చవద్దు'],
        };
      }
      if (lang === 'kn') {
        return {
          title: 'ಬ್ಯಾಟರಿ ಬೆಂಕಿ ಮತ್ತು ಆಮ್ಲ ರಕ್ಷಣೆ',
          warning: 'ಲಿಥಿಯಂ ಬ್ಯಾಟರಿಗಳನ್ನು ಚುಚ್ಚಬೇಡಿ ಅಥವಾ ಬೆಂಕಿಯ ಬಳಿ ಇಡಬೇಡಿ.',
          dos: ['ಒಣ ಪೆಟ್ಟಿಗೆಯಲ್ಲಿ ಇರಿಸಿ', 'ತುದಿಗಳಿಗೆ ಟೇಪ್ ಅಂಟಿಸಿ', 'ದಪ್ಪ ರಬ್ಬರ್ ಕೈಗವಸುಗಳನ್ನು ಧರಿಸಿ'],
          donts: ['ನೀರಿಗೆ ಎಸೆಯಬೇಡಿ', 'ಸುತ್ತಿಗೆಯಿಂದ ಒಡೆಯಬೇಡಿ', 'ಆಮ್ಲದ ಹೊಗೆಯನ್ನು ಉಸಿರಾಡಬೇಡಿ'],
        };
      }
      return {
        title: g.title_en,
        warning: g.short_warning_en,
        dos: g.dos_en,
        donts: g.donts_en,
      };
    }

    // CRT Guide
    if (g.hazard_code === 'HAZ-CRT') {
      if (lang === 'mr') {
        return {
          title: g.title_mr,
          warning: g.short_warning_mr,
          dos: g.dos_mr,
          donts: g.donts_mr,
        };
      }
      if (lang === 'hi') {
        return {
          title: g.title_hi,
          warning: g.short_warning_hi,
          dos: g.dos_hi,
          donts: g.donts_hi,
        };
      }
      if (lang === 'gu') {
        return {
          title: 'સીઆરટી ટ્યુબ વિસ્ફોટ અને સીસાનો ભય',
          warning: 'જૂના ટીવીની પિક્ચર ટ્યુબમાં વેક્યુમ હોય છે. પછાડવાથી કાચ ઉડી શકે છે.',
          dos: ['આંખો પર સુરક્ષા ચશ્મા પહેરો', 'કોથળામાં લપેટીને લઈ જાઓ', 'શરીરથી દૂર રાખીને ઉઠાવો'],
          donts: ['હથોડીથી કાચ ન તોડો', 'ભારે ભંગાર નીચે ન દબાવો'],
        };
      }
      if (lang === 'ta') {
        return {
          title: 'சிஆர்டி டிவி வெடிப்பு & ஈய நச்சு எச்சரிக்கை',
          warning: 'பிக்சர் டியூப்களில் வெற்றிடம் உள்ளது. அடித்தால் கண்ணாடிச் சிதறல்கள் பாயும்.',
          dos: ['பாதுகாப்பு கண்ணாடி அணியுங்கள்', 'சாக்கில் போர்த்தி எடுத்துச் செல்லுங்கள்', 'உடலிலிருந்து தள்ளி வைக்கவும்'],
          donts: ['சுத்தியலால் உடைக்காதீர்கள்', 'கனமான இரும்பின் கீழ் வைக்காதீர்கள்'],
        };
      }
      if (lang === 'te') {
        return {
          title: 'సీఆర్‌టీ ట్యూబ్ పేలుడు మరియు సీసం ప్రమాదం',
          warning: 'పాత టీవీ ట్యూబ్‌లలో శూన్యత ఉంటుంది. కొడితే గాజు ముక్కలు వేగంగా ఎగురుతాయి.',
          dos: ['కంటి అద్దాలు ధరించండి', 'గోనెసంచిలో చుట్టి తరలించండి', 'శరీరానికి దూరంగా ఉంచండి'],
          donts: ['సుత్తితో మెడను పగలగొట్టవద్దు', 'భారీ స్క్రాప్ కింద నొక్కవద్దు'],
        };
      }
      if (lang === 'kn') {
        return {
          title: 'ಸಿಆರ್‌ಟಿ ಟ್ಯೂಬ್ ಸ್ಫೋಟ ಮತ್ತು ಸೀಸದ ಅಪಾಯ',
          warning: 'ಪಿಕ್ಚರ್ ಟ್ಯೂಬ್‌ಗಳಲ್ಲಿ ನಿರ್ವಾತವಿರುತ್ತದೆ. ಬಡಿದರೆ ಗಾಜಿನ ಚೂರುಗಳು ಸಿಡಿಯುತ್ತವೆ.',
          dos: ['ರಕ್ಷಣಾತ್ಮಕ ಕನ್ನಡಕ ಧರಿಸಿ', 'ಗೋಣಿಚೀಲದಲ್ಲಿ ಸುತ್ತಿ ಸಾಗಿಸಿ', 'ದೇಹದಿಂದ ದೂರವಿರಿಸಿ'],
          donts: ['ಸುತ್ತಿಗೆಯಿಂದ ಒಡೆಯಬೇಡಿ', 'ಭಾರವಾದ ಗುಜರಿಯ ಕೆಳಗೆ ಇಡಬೇಡಿ'],
        };
      }
      return {
        title: g.title_en,
        warning: g.short_warning_en,
        dos: g.dos_en,
        donts: g.donts_en,
      };
    }

    // Burning Wire Guide
    if (g.hazard_code === 'HAZ-BURNING') {
      if (lang === 'mr') {
        return {
          title: g.title_mr,
          warning: g.short_warning_mr,
          dos: g.dos_mr,
          donts: g.donts_mr,
        };
      }
      if (lang === 'hi') {
        return {
          title: g.title_hi,
          warning: g.short_warning_hi,
          dos: g.dos_hi,
          donts: g.donts_hi,
        };
      }
      if (lang === 'gu') {
        return {
          title: 'વાયરોને અગ્નિમાં સળગાવવાની સખત મનાઈ',
          warning: 'પીવીસી વાયરો બાળવાથી કેન્સરકારક ઝેરી ધુમાડો નીકળે છે અને ફેફસાંને નુકસાન થાય છે.',
          dos: ['વાયર સીધા અધિકૃત રિસાયકલરને વેચો', 'મશીનરી સ્ટ્રીપરનો ઉપયોગ કરો'],
          donts: ['ખુલ્લા મેદાનમાં ક્યારેય ન સળગાવો', 'કેબલ પર કેરોસીન કે ડીઝલ ન નાખો'],
        };
      }
      if (lang === 'ta') {
        return {
          title: 'கம்பிகளை எரிப்பதற்கு கடுமையான தடை',
          warning: 'பிவிசி ஒயர்களை எரிப்பதால் புற்றுநோய் உண்டாக்கும் நச்சுப் புகை வெளியாகி நுரையீரலைப் பாதிக்கும்.',
          dos: ['அங்கீகரிக்கப்பட்ட மறுசுழற்சியாளரிடம் விற்கவும்', 'இயந்திர ஸ்ட்ரிப்பரைப் பயன்படுத்தவும்'],
          donts: ['திறந்தவெளியில் எரிக்காதீர்கள்', 'மண்ணெண்ணெய் ஊற்றி எரிக்காதீர்கள்'],
        };
      }
      if (lang === 'te') {
        return {
          title: 'వైర్లను కాల్చడంపై కఠిన నిషేధం',
          warning: 'పీవీసీ వైర్లను కాల్చడం వల్ల క్యాన్సర్ కలిగించే విషపూరిత పొగలు ఊపిరితిత్తులను దెబ్బతీస్తాయి.',
          dos: ['వైర్లను నేరుగా అధీకృత రీసైక్లర్లకు అమ్మండి', 'మెకానికల్ స్ట్రిప్పర్ ఉపయోగించండి'],
          donts: ['బహిరంగ ప్రదేశాల్లో కాల్చవద్దు', 'వైర్లపై కిరోసిన్ పోయవద్దు'],
        };
      }
      if (lang === 'kn') {
        return {
          title: 'ತಂತಿಗಳನ್ನು ಸುಡುವುದಕ್ಕೆ ಕಟ್ಟುನಿಟ್ಟಾದ ನಿಷೇಧ',
          warning: 'ಪಿವಿಸಿ ವೈರ್ ಸುಡುವುದರಿಂದ ಕ್ಯಾನ್ಸರ್ ಕಾರಕ ವಿಷಕಾರಿ ಹೊಗೆ ಹೊರಹೊಮ್ಮಿ ಶ್ವಾಸಕೋಶವನ್ನು ಹಾಳುಮಾಡುತ್ತದೆ.',
          dos: ['ತಂತಿಗಳನ್ನು ನೇರವಾಗಿ ಅಧಿಕೃತ ರಿಸೈಕ್ಲರ್‌ಗೆ ಮಾರಿ', 'ಯಾಂತ್ರಿಕ ಸ್ಟ್ರಿಪ್ಪರ್ ಬಳಸಿ'],
          donts: ['ತೆರೆದ ಮೈದಾನದಲ್ಲಿ ಸುಡಬೇಡಿ', 'ಕೇಬಲ್‌ಗಳ ಮೇಲೆ ಸೀಮೆಎಣ್ಣೆ ಸುರಿಯಬೇಡಿ'],
        };
      }
      return {
        title: g.title_en,
        warning: g.short_warning_en,
        dos: g.dos_en,
        donts: g.donts_en,
      };
    }

    return {
      title: lang === 'mr' ? g.title_mr : lang === 'hi' ? g.title_hi : g.title_en,
      warning: lang === 'mr' ? g.short_warning_mr : lang === 'hi' ? g.short_warning_hi : g.short_warning_en,
      dos: lang === 'mr' ? g.dos_mr : lang === 'hi' ? g.dos_hi : g.dos_en,
      donts: lang === 'mr' ? g.donts_mr : lang === 'hi' ? g.donts_hi : g.donts_en,
    };
  };

  const getGuideAudio = (g: SafetyGuide) => {
    const data = getGuideData(g);
    const dosText = data.dos.join(', ');
    const dontsText = data.donts.join(', ');

    if (lang === 'mr') {
      return `${data.title}. सावधान: ${data.warning}. काय करावे: ${dosText}. काय करू नये: ${dontsText}.`;
    }
    if (lang === 'hi') {
      return `${data.title}। चेतावनी: ${data.warning}। क्या करें: ${dosText}। क्या न करें: ${dontsText}।`;
    }
    if (lang === 'gu') {
      return `${data.title}. ચેતવણી: ${data.warning}. શું કરવું: ${dosText}. શું ન કરવું: ${dontsText}.`;
    }
    if (lang === 'ta') {
      return `${data.title}. எச்சரிக்கை: ${data.warning}. செய்ய வேண்டியவை: ${dosText}. செய்யக்கூடாதவை: ${dontsText}.`;
    }
    if (lang === 'te') {
      return `${data.title}. హెచ్చరిక: ${data.warning}. చేయవలసినవి: ${dosText}. చేయకూడనివి: ${dontsText}.`;
    }
    if (lang === 'kn') {
      return `${data.title}. ಎಚ್ಚರಿಕೆ: ${data.warning}. ಮಾಡಬೇಕಾದ್ದು: ${dosText}. ಮಾಡಬಾರದ್ದು: ${dontsText}.`;
    }
    return `${data.title}. Warning: ${data.warning}. Dos: ${dosText}. Don'ts: ${dontsText}.`;
  };

  const getHeaderAudioText = () => {
    if (lang === 'mr') return 'येथे ई-कचरा सुरक्षितपणे गोळा करण्याचे नियम आहेत. बॅटरी, टीव्ही काच आणि वायर्स जाळण्याविरुद्ध मार्गदर्शन ऐका.';
    if (lang === 'hi') return 'ई-कचरे को सुरक्षित रूप से संभालने के नियम। बैटरी व तारों को आग से बचाने की जानकारी।';
    if (lang === 'gu') return 'અહીં ઈ-કચરો સુરક્ષિત રીતે સંભાળવાના નિયમો છે. બેટરી, ટીવી ગ્લાસ અને વાયરો ન બાળવા અંગે માર્ગદર્શન સાંભળો.';
    if (lang === 'ta') return 'மின்-கழிவுகளைப் பாதுகாப்பாகக் கையாள்வதற்கான விதிகள். பேட்டரி மற்றும் கம்பிகளை எரிக்காமல் இருக்க வழிகாட்டுதல்.';
    if (lang === 'te') return 'ఈ-వ్యర్థాలను సురಕ್ಷితంగా నిర్వహించే నియమాలు. బ్యాటరీ మరియు వైర్లను కాల్చకుండా ఉండే మార్గదర్శకాలు.';
    if (lang === 'kn') return 'ಇ-ತ್ಯಾಜ್ಯವನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ನಿರ್ವಹಿಸುವ ನಿಯಮಗಳು. ಬ್ಯಾಟರಿ ಮತ್ತು ವೈರ್ ಸುಡದಂತೆ ಮಾರ್ಗದರ್ಶನ.';
    return 'Safety guidelines for informal e-waste handlers. Never burn wires or break tubes.';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">{t.safetyTitle}</h2>
          <p className="text-xs text-slate-400">{t.hazardWarning}</p>
        </div>
        <AudioButton
          textToSpeak={getHeaderAudioText()}
          lang={lang}
          size="md"
        />
      </div>

      <div className="space-y-4">
        {guides.map((g) => {
          const data = getGuideData(g);

          return (
            <div
              key={g.id}
              className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-4 shadow-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shrink-0 ${
                      g.severity === 'critical'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    {g.icon_name === 'Flame' && <Flame className="w-6 h-6" />}
                    {g.icon_name === 'ShieldAlert' && <ShieldAlert className="w-6 h-6" />}
                    {g.icon_name === 'Ban' && <Ban className="w-6 h-6" />}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-amber-400 border border-slate-700">
                      {g.severity === 'critical'
                        ? (lang === 'mr' ? 'अत्यंत गंभीर धोका' : lang === 'hi' ? 'उच्च जोखिम' : lang === 'gu' ? 'ઉચ્ચ જોખમ' : lang === 'ta' ? 'அதிக ஆபத்து' : lang === 'te' ? 'అధిక ప్రమాదం' : lang === 'kn' ? 'ಹೆಚ್ಚಿನ ಅಪಾಯ' : 'Critical Hazard')
                        : (lang === 'mr' ? 'मध्यम धोका' : lang === 'hi' ? 'मध्यम जोखिम' : lang === 'gu' ? 'મધ્યમ જોખમ' : lang === 'ta' ? 'நடுத்தர ஆபத்து' : lang === 'te' ? 'మధ్యస్థ ప్రమాదం' : lang === 'kn' ? 'ಮಧ್ಯಮ ಅಪಾಯ' : 'Moderate Hazard')}
                    </span>
                    <h3 className="font-extrabold text-slate-100 text-base sm:text-lg mt-1">
                      {data.title}
                    </h3>
                  </div>
                </div>

                <AudioButton textToSpeak={getGuideAudio(g)} lang={lang} size="sm" />
              </div>

              {/* Short Warning Box */}
              <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300 font-medium flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <p className="leading-relaxed">{data.warning}</p>
              </div>

              {/* Two Column Dos and Don'ts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* DOs */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                    <Check className="w-4 h-4" />
                    {t.dos}
                  </span>
                  <ul className="space-y-1.5 text-slate-300">
                    {data.dos.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* DONTs */}
                <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                  <span className="font-bold text-rose-400 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                    <X className="w-4 h-4" />
                    {t.donts}
                  </span>
                  <ul className="space-y-1.5 text-slate-300">
                    {data.donts.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
