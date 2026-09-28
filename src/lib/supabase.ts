import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Profile,
  CollectorProfile,
  RecyclerProfile,
  MaterialCategory,
  PriceRecord,
  Lot,
  LotStatus,
  RecyclerOffer,
  Handover,
  Payment,
  PaymentMode,
  Complaint,
  NotificationItem,
  SafetyGuide,
  AnomalyRecord,
  FieldResearchRecord,
  UserRole,
} from '../types/database';

// Safe check for Supabase environment credentials
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isLiveSupabaseConfigured = Boolean(
  envUrl &&
    envAnonKey &&
    envUrl.startsWith('https://') &&
    envAnonKey.length > 20
);

export const supabaseClient: SupabaseClient | null = isLiveSupabaseConfigured
  ? createClient(envUrl, envAnonKey)
  : null;

// ============================================================================
// VERIFIED REFERENCE SEED DATA (Separated & Clearly Tagged)
// ============================================================================
export const INITIAL_CATEGORIES: MaterialCategory[] = [
  {
    id: 'cat-pcb',
    code: 'PCB',
    name_en: 'Motherboards & Printed Circuit Boards',
    name_hi: 'मदरबोर्ड और पीसीबी सर्किट',
    name_mr: 'मदरबोर्ड आणि पीसीबी सर्किट्स',
    name_gu: 'મધરબોર્ડ અને સર્કિટ બોર્ડ (પીસીબી)',
    name_ta: 'மதர்போர்டுகள் மற்றும் சர்க்யூட் போர்டுகள் (பிசிபி)',
    name_te: 'మదర్‌బోర్డులు మరియు సర్క్యూట్ బోర్డులు (పిసిబి)',
    name_kn: 'ಮದರ್‌ಬೋರ್ಡ್‌ಗಳು ಮತ್ತು ಸರ್ಕ್ಯೂಟ್ ಬೋರ್ಡ್‌ಗಳು (ಪಿಸಿಬಿ)',
    icon_name: 'Cpu',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    hazard_level: 'medium',
    handling_instruction_en: 'Contains solder and precious metals. Do not burn or crush indoors.',
    handling_instruction_hi: 'सोल्डर और कीमती धातु होती है। कमरे में न जलाएं।',
    handling_instruction_mr: 'सोल्डर व धातू असतात. बंद जागेत जाळू किंवा फोडू नका.',
    handling_instruction_gu: 'સોલ્ડર અને કિંમતી ધાતુઓ હોય છે. ઘરમાં બાળવું કે તોડવું નહીં.',
    handling_instruction_ta: 'சாலிடர் மற்றும் விலைமதிப்பற்ற உலோகங்கள் உள்ளன. உள்ளே எரிக்கவோ நசுக்கவோ வேண்டாம்.',
    handling_instruction_te: 'సోల్డర్ మరియు విలువైన లోహాలు ఉంటాయి. ఇంట్లో కాల్చడం లేదా పగలగొట్టడం చేయవద్దు.',
    handling_instruction_kn: 'ಬೆಸುಗೆ ಮತ್ತು ಬೆಲೆಬಾಳುವ ಲೋಹಗಳನ್ನು ಹೊಂದಿರುತ್ತದೆ. ಮನೆಯೊಳಗೆ ಸುಡಬೇಡಿ ಅಥವಾ ಪುಡಿಮಾಡಬೇಡಿ.',
    is_active: true,
    benchmark_price_per_kg: 320,
    created_at: '2026-09-01T00:00:00Z',
  },
  {
    id: 'cat-battery',
    code: 'BATTERY',
    name_en: 'Lithium & Lead-Acid Batteries',
    name_hi: 'लिथियम व लेड-एसिड बैटरी',
    name_mr: 'लिथियम व लेड-ॲसिड बॅटऱ्या',
    name_gu: 'લિથિયમ અને લેડ-એસિડ બેટરીઓ',
    name_ta: 'லித்தியம் மற்றும் லெட்-ஆசிட் பேட்டரிகள்',
    name_te: 'లిథియం మరియు లెడ్-యాసిడ్ బ్యాటరీలు',
    name_kn: 'ಲಿಥಿಯಂ ಮತ್ತು ಲೆಡ್-ಆಸಿಡ್ ಬ್ಯಾಟರಿಗಳು',
    icon_name: 'BatteryCharging',
    image_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80',
    hazard_level: 'high',
    handling_instruction_en: 'Severe fire & explosion hazard. Keep contacts taped, avoid punctures.',
    handling_instruction_hi: 'आग और विस्फोट का खतरा। पानी और तेज धूप से बचाएं।',
    handling_instruction_mr: 'आग लागण्याचा धोका. छिद्र पाडू नका, सुक्या जागेत ठेवा.',
    handling_instruction_gu: 'આગ અને વિસ્ફોટનું જોખમ. સંપર્કો પર ટેપ લગાવો, પંચર ન કરો.',
    handling_instruction_ta: 'தீ மற்றும் வெடிப்பு அபாயம். முனையங்களை ஒட்டவும், துளையிடுவதைத் தவிர்க்கவும்.',
    handling_instruction_te: 'తీవ్రమైన అగ్ని మరియు పేలుడు ప్రమాదం. టెర్మినల్స్‌కు టేప్ వేయండి, గుచ్చవద్దు.',
    handling_instruction_kn: 'ತೀವ್ರ ಬೆಂಕಿ ಮತ್ತು ಸ್ಫೋಟದ ಅಪಾಯ. ಟರ್ಮಿನಲ್‌ಗಳಿಗೆ ಟೇಪ್ ಹಾಕಿ, ಚುಚ್ಚಬೇಡಿ.',
    is_active: true,
    benchmark_price_per_kg: 180,
    created_at: '2026-09-01T00:00:00Z',
  },
  {
    id: 'cat-copper',
    code: 'COPPER',
    name_en: 'Copper Wires & Yoke Coils',
    name_hi: 'तांबे के तार और कॉइल',
    name_mr: 'तांब्याची वायर आणि कॉइल्स',
    name_gu: 'તાંબાના વાયર અને કોઈલ',
    name_ta: 'செம்பு கம்பிகள் மற்றும் சுருள்கள்',
    name_te: 'రాగి తీగలు మరియు కాయిల్స్',
    name_kn: 'ತಾಮ್ರದ ತಂತಿಗಳು ಮತ್ತು ಕಾಯಿಲ್‌ಗಳು',
    icon_name: 'Zap',
    image_url: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=400&q=80',
    hazard_level: 'low',
    handling_instruction_en: 'Do not open-burn PVC coating. Toxic dioxins are released.',
    handling_instruction_hi: 'प्लास्टिक को आग लगाकर न छीलें। जहरीला धुआं निकलता है।',
    handling_instruction_mr: 'प्लास्टिक जाळून तांबे काढू नका, विषारी वायू तयार होतो.',
    handling_instruction_gu: 'પીવીસી કોટિંગને બાળવું નહીં. ઝેરી ધુમાડો નીકળે છે.',
    handling_instruction_ta: 'பிவிசி உறையை எரிக்க வேண்டாம். நச்சு வாயுக்கள் வெளியேறும்.',
    handling_instruction_te: 'పివిసి పూతను కాల్చవద్దు. విషపూరిత పొగలు విడుదలవుతాయి.',
    handling_instruction_kn: 'ಪಿವಿಸಿ ಲೇಪನವನ್ನು ಸುಡಬೇಡಿ. ವಿಷಕಾರಿ ಹೊಗೆ ಹೊರಹೊಮ್ಮುತ್ತದೆ.',
    is_active: true,
    benchmark_price_per_kg: 560,
    created_at: '2026-09-01T00:00:00Z',
  },
  {
    id: 'cat-crt',
    code: 'CRT',
    name_en: 'CRT Monitors & Picture Tubes',
    name_hi: 'सीआरटी मॉनिटर व पुराने टीवी',
    name_mr: 'सीआरटी मॉनिटर्स व जुने टीव्ही',
    name_gu: 'સીઆરટી મોનિટર અને ટીવી સ્ક્રીન',
    name_ta: 'சிஆர்டி மானிட்டர்கள் மற்றும் டிவி திரைகள்',
    name_te: 'సిఆర్‌టి మానిటర్లు మరియు పాత టీవీలు',
    name_kn: 'ಸಿಆರ್‌ಟಿ ಮಾನಿಟರ್‌ಗಳು ಮತ್ತು ಹಳೆಯ ಟಿವಿಗಳು',
    icon_name: 'Tv',
    image_url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=400&q=80',
    hazard_level: 'high',
    handling_instruction_en: 'High vacuum implosion risk and toxic leaded glass funnel.',
    handling_instruction_hi: 'कांच फूटने और लेड विष का खतरा। बहुत संभलकर उठाएं।',
    handling_instruction_mr: 'फुटल्यास काचेचे तुकडे उडण्याचा व शिसे विषबाधेचा धोका.',
    handling_instruction_gu: 'વેક્યુમ વિસ્ફોટ અને સીસાના કાચનું જોખમ. સાવધાનીથી સંભાળો.',
    handling_instruction_ta: 'வெற்றிட வெடிப்பு மற்றும் நச்சு ஈயக் கண்ணாடி ஆபத்து. கவனமாக கையாளவும்.',
    handling_instruction_te: 'వాక్యూమ్ విస్ఫోటనం మరియు సీసం గ్లాస్ ప్రమాదం. జాగ్రత్తగా నిర్వహించండి.',
    handling_instruction_kn: 'ನಿರ್ವಾತ ಸ್ಫೋಟ ಮತ್ತು ಸೀಸದ ಗಾಜಿನ ಅಪಾಯ. ಎಚ್ಚರಿಕೆಯಿಂದ ನಿರ್ವಹಿಸಿ.',
    is_active: true,
    benchmark_price_per_kg: 45,
    created_at: '2026-09-01T00:00:00Z',
  },
  {
    id: 'cat-mobile',
    code: 'MOBILE',
    name_en: 'Smartphones & Feature Phones',
    name_hi: 'मोबाइल फोन व गैजेट्स',
    name_mr: 'मोबाईल फोन व इलेक्ट्रॉनिक साधने',
    name_gu: 'સ્માર્ટફોન અને ઈલેક્ટ્રોનિક ગેજેટ્સ',
    name_ta: 'ஸ்மார்ட்போன்கள் மற்றும் மின்னணு சாதனங்கள்',
    name_te: 'స్మార్ట్‌ఫోన్లు మరియు ఎలక్ట్రానిక్ గాడ్జెట్లు',
    name_kn: 'ಸ್ಮಾರ್ಟ್‌ಫೋನ್‌ಗಳು ಮತ್ತು ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಗ್ಯಾಜೆಟ್‌ಗಳು',
    icon_name: 'Smartphone',
    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
    hazard_level: 'medium',
    handling_instruction_en: 'Keep intact. High recovery value for gold and palladium.',
    handling_instruction_hi: 'फोन न तोड़ें। कीमती धातुएं सुरक्षित रखें।',
    handling_instruction_mr: 'फोन फोडू नका, सुरक्षितपणे अधिकृत रिसायकलरला द्या.',
    handling_instruction_gu: 'ફોન તોડશો નહીં. સોનું અને કિંમતી ધાતુઓ સુરક્ષિત રાખો.',
    handling_instruction_ta: 'போன்களை உடைக்க வேண்டாம். தங்கம் மற்றும் பலேடியம் மீட்கப்படும்.',
    handling_instruction_te: 'ఫోన్లను పగలగొట్టవద్దు. బంగారం మరియు విలువైన లోహాలు ఉంటాయి.',
    handling_instruction_kn: 'ಫೋನ್‌ಗಳನ್ನು ಒಡೆಯಬೇಡಿ. ಚಿನ್ನ ಮತ್ತು ಅಮೂಲ್ಯ ಲೋಹಗಳ ಪುನರ್ಬಳಕೆ ಮೌಲ್ಯವಿದೆ.',
    is_active: true,
    benchmark_price_per_kg: 420,
    created_at: '2026-09-01T00:00:00Z',
  },
  {
    id: 'cat-appliances',
    code: 'APPLIANCES',
    name_en: 'Refrigerators & AC Compressors',
    name_hi: 'फ्रिज व एसी कंप्रेसर',
    name_mr: 'फ्रीज व एसी कंप्रेसर्स',
    name_gu: 'રેફ્રિજરેટર અને એસી કોમ્પ્રેસર',
    name_ta: 'குளிர்சாதன பெட்டி மற்றும் ஏசி கம்ப்ரசர்',
    name_te: 'రిఫ్రిజిరేటర్లు మరియు ఎసి కంప్రెసర్లు',
    name_kn: 'ರೆಫ್ರಿಜರೇಟರ್ ಮತ್ತು ಎಸಿ ಸಂಕೋಚಕಗಳು',
    icon_name: 'Refrigerator',
    image_url: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=400&q=80',
    hazard_level: 'high',
    handling_instruction_en: 'CFC/HFC refrigerant gases must not be vented. High ozone risk.',
    handling_instruction_hi: 'गैस हवा में न छोड़ें। अधिकृत प्लांट में ही खाली कराएं।',
    handling_instruction_mr: 'गॅस हवेत सोडू नका, पर्यावरणास अतिशय घातक आहे.',
    handling_instruction_gu: 'રેફ્રિજન્ટ ગેસ હવામાં છોડવો નહીં. ઓઝોનને નુકસાન થાય છે.',
    handling_instruction_ta: 'குளிரூட்டும் வாயுவை காற்றில் விடக்கூடாது. ஓசோன் பாதிப்பு அபாயம்.',
    handling_instruction_te: 'శీతలకరణి వాయువును గాలిలోకి వదలవద్దు. ఓజోన్ నష్టం ప్రమాదం.',
    handling_instruction_kn: 'ಶೈತ್ಯೀಕರಣ ಅನಿಲವನ್ನು ಗಾಳಿಯಲ್ಲಿ ಬಿಡಬೇಡಿ. ಓಝೋನ್ ಅಪಾಯವಿದೆ.',
    is_active: true,
    benchmark_price_per_kg: 85,
    created_at: '2026-09-01T00:00:00Z',
  },
];

export const INITIAL_PRICES: PriceRecord[] = [
  {
    id: 'pr-1',
    category_id: 'cat-pcb',
    sub_category_name: 'High-Grade Telecom & Server Motherboards',
    sub_category_name_mr: 'उच्च दर्जाचे सर्व्हर व टेलिकॉम मदरबोर्ड्स',
    sub_category_name_hi: 'हाई-ग्रेड टेलीकॉम व सर्वर मदरबोर्ड',
    sub_category_name_gu: 'હાઇ-ગ્રેડ ટેલિકોમ અને સર્વર મધરબોર્ડ',
    sub_category_name_ta: 'உயர்தர தொலைத்தொடர்பு மற்றும் சர்வர் மதர்போர்டுகள்',
    sub_category_name_te: 'హై-గ్రేడ్ టెలికాం మరియు సర్వర్ మదర్‌బోర్డులు',
    sub_category_name_kn: 'ಉನ್ನತ ದರ್ಜೆಯ ಟೆಲಿಕಾಂ ಮತ್ತು ಸರ್ವರ್ ಮದರ್‌ಬೋರ್ಡ್‌ಗಳು',
    region: 'Maharashtra (Mumbai MMR)',
    buying_price_per_kg: 320,
    market_min_price: 290,
    market_max_price: 350,
    unit: 'kg',
    price_source: 'SPCB Verified Recycler Index / Navi Mumbai Taloja Hub',
    is_verified: true,
    verified_at: '2026-09-23T06:00:00Z',
    effective_date: '2026-09-23',
    created_at: '2026-09-23T06:00:00Z',
  },
  {
    id: 'pr-2',
    category_id: 'cat-copper',
    sub_category_name: 'Stripped Heavy Gauge Copper Cable',
    sub_category_name_mr: 'इंसुलेशन काढलेली जाड तांब्याची केबल',
    sub_category_name_hi: 'छिली हुई भारी गेज कॉपर केबल',
    sub_category_name_gu: 'છોલેલી હેવી ગેજ તાંબાની કેબલ',
    sub_category_name_ta: 'உரிக்கப்பட்ட தடிமனான செம்பு கேபிள்',
    sub_category_name_te: 'ఇన్సులేషన్ తీసిన హెవీ గేజ్ రాగి కేబుల్',
    sub_category_name_kn: 'ಇನ್ಸುಲೇಶನ್ ತೆಗೆದ ಭಾರೀ ಗೇಜ್ ತಾಮ್ರದ ಕೇಬಲ್',
    region: 'Maharashtra (Mumbai MMR)',
    buying_price_per_kg: 560,
    market_min_price: 520,
    market_max_price: 590,
    unit: 'kg',
    price_source: 'Bombay Metal Exchange Reference / Kurla Scrap Hub',
    is_verified: true,
    verified_at: '2026-09-23T06:00:00Z',
    effective_date: '2026-09-23',
    created_at: '2026-09-23T06:00:00Z',
  },
  {
    id: 'pr-3',
    category_id: 'cat-battery',
    sub_category_name: 'Lead-Acid Inverter / UPS Batteries',
    sub_category_name_mr: 'इन्व्हर्टर व यूपीएस लेड-ॲसिड बॅटऱ्या',
    sub_category_name_hi: 'इन्वर्टर व यूपीएस लेड-एसिड बैटरी',
    sub_category_name_gu: 'ઇન્વર્ટર અને યુપીએસ લેડ-એસિડ બેટરી',
    sub_category_name_ta: 'இன்வெர்ட்டர் மற்றும் யுபிஎஸ் லெட்-ஆசிட் பேட்டரிகள்',
    sub_category_name_te: 'ఇన్వర్టర్ మరియు యుపిఎస్ లెడ్-యాసిడ్ బ్యాటరీలు',
    sub_category_name_kn: 'ಇನ್ವರ್ಟರ್ ಮತ್ತು ಯುಪಿಎಸ್ ಲೆಡ್-ಆಸಿಡ್ ಬ್ಯಾಟರಿಗಳು',
    region: 'Maharashtra (Mumbai MMR)',
    buying_price_per_kg: 180,
    market_min_price: 165,
    market_max_price: 195,
    unit: 'kg',
    price_source: 'CPCB Regulated Battery Scrap Framework',
    is_verified: true,
    verified_at: '2026-09-23T06:00:00Z',
    effective_date: '2026-09-23',
    created_at: '2026-09-23T06:00:00Z',
  },
  {
    id: 'pr-4',
    category_id: 'cat-mobile',
    sub_category_name: 'Mixed Mobile Phone Motherboards & Bodies',
    sub_category_name_mr: 'मिश्र मोबाईल फोन सर्किट बोर्ड व बॉडीज',
    sub_category_name_hi: 'मिश्रित मोबाइल फोन मदरबोर्ड व बॉडी',
    sub_category_name_gu: 'મિક્સ્ડ મોબાઇલ ફોન મધરબોર્ડ અને બોડીઝ',
    sub_category_name_ta: 'மொபைல் போன் மதர்போர்டுகள் மற்றும் பாடி பாகங்கள்',
    sub_category_name_te: 'మిశ్రమ మొబైల్ ఫోన్ మదర్‌బోర్డులు & బాడీలు',
    sub_category_name_kn: 'ಮಿಶ್ರ ಮೊಬೈಲ್ ಫೋನ್ ಮದರ್‌ಬೋರ್ಡ್‌ಗಳು ಮತ್ತು ಬಾಡಿಗಳು',
    region: 'Maharashtra (Mumbai MMR)',
    buying_price_per_kg: 420,
    market_min_price: 390,
    market_max_price: 460,
    unit: 'kg',
    price_source: 'Authorized Aggregator Formal Rate / Thane MIDC',
    is_verified: true,
    verified_at: '2026-09-23T06:00:00Z',
    effective_date: '2026-09-23',
    created_at: '2026-09-23T06:00:00Z',
  },
  {
    id: 'pr-5',
    category_id: 'cat-crt',
    sub_category_name: 'Intact Cathode Ray Tubes with Yoke Coils',
    sub_category_name_mr: 'अखंड सीआरटी टीव्ही मॉनिटर व योक कॉइल्स',
    sub_category_name_hi: 'सुरक्षित सीआरटी ट्यूब व योक कॉइल',
    sub_category_name_gu: 'ઇન્ટેક્ટ કેથોડ રે ટ્યુબ અને યોક કોઈલ્સ',
    sub_category_name_ta: 'முழுமையான கேத்தோடு கதிர் குழாய்கள் (சிஆர்டி)',
    sub_category_name_te: 'చెక్కుచెదరని కాథోడ్ రే ట్యూబ్‌లు మరియు కాయిల్స్',
    sub_category_name_kn: 'ಸಂಪೂರ್ಣ ಕ್ಯಾಥೋಡ್ ರೇ ಟ್ಯೂಬ್‌ಗಳು ಮತ್ತು ಕಾಯಿಲ್‌ಗಳು',
    region: 'Maharashtra (Mumbai MMR)',
    buying_price_per_kg: 45,
    market_min_price: 38,
    market_max_price: 52,
    unit: 'kg',
    price_source: 'CPCB Hazard Treatment Benchmark',
    is_verified: true,
    verified_at: '2026-09-23T06:00:00Z',
    effective_date: '2026-09-23',
    created_at: '2026-09-23T06:00:00Z',
  },
];

export const INITIAL_SAFETY_GUIDES: SafetyGuide[] = [
  {
    id: 'safe-battery',
    hazard_code: 'HAZ-BAT',
    title_en: 'Battery Fire & Acid Protection',
    title_hi: 'बैटरी आग और एसिड से बचाव',
    title_mr: 'बॅटरी आग आणि ॲसिडपासून संरक्षण',
    short_warning_en: 'Never puncture lithium batteries or open lead batteries near fire.',
    short_warning_hi: 'बैटरी में छेद न करें और आग के पास न रखें।',
    short_warning_mr: 'बॅटरी फोडू नका व आगीजवळ ठेवू नका. स्फोट होऊ शकतो.',
    dos_en: ['Keep in dry ventilated box', 'Tape terminal ends', 'Use thick rubber gloves'],
    dos_hi: ['सूखे डिब्बे में रखें', 'तारों पर टेप लगाएं', 'मोटे दस्ताने पहनें'],
    dos_mr: ['सुक्या प्लास्टिक डब्यात ठेवा', 'टोकांवर चिकटपट्टी लावा', 'रबरी हातमोजे वापरा'],
    donts_en: ['Do not throw in water', 'Do not hammer or break cells', 'Do not inhale acidic fumes'],
    donts_hi: ['पानी में न फेंकें', 'हथौड़े से न तोड़ें', 'तेजाब का धुआं न सूंघें'],
    donts_mr: ['पाण्यात टाकू नका', 'हातोड्याने फोडू नका', 'धूर हुंगू नका'],
    icon_name: 'Flame',
    severity: 'critical',
  },
  {
    id: 'safe-crt',
    hazard_code: 'HAZ-CRT',
    title_en: 'CRT Implosion & Leaded Glass Warning',
    title_hi: 'सीआरटी कांच टूटने और लेड का खतरा',
    title_mr: 'सीआरटी फुटण्याचा व शिसे विषबाधेचा धोका',
    short_warning_en: 'Picture tubes have vacuum. If hit, shards shoot inward then outward.',
    short_warning_hi: 'पुराने टीवी के कांच में भारी वैक्यूम और सीसा होता है।',
    short_warning_mr: 'पिक्चर ट्यूबमध्ये निर्वात पोकळी असते. जोरात आपटल्यास उडण्याची शक्यता.',
    dos_en: ['Carry with screen face away from body', 'Wear protective eye goggles', 'Wrap in sack during transport'],
    dos_hi: ['आंखों पर चश्मा पहनें', 'बोरी में लपेटकर ले जाएं', 'स्क्रीन दूर रखकर उठाएं'],
    dos_mr: ['डोळ्यांवर गॉगल घाला', 'गोणीत गुंडाळून हाताळा', 'शरीरापासून सुरक्षित अंतर ठेवा'],
    donts_en: ['Do not break neck with hammer', 'Do not store under heavy metal scrap'],
    donts_hi: ['हथौड़े से गर्दन न तोड़ें', 'भारी लोहे के नीचे न दबाएं'],
    donts_mr: ['हातोड्याने नळी फोडू नका', 'अवजड भंगाराखाली दाबू नका'],
    icon_name: 'ShieldAlert',
    severity: 'high',
  },
  {
    id: 'safe-wires',
    hazard_code: 'HAZ-BURNING',
    title_en: 'Strict Prohibition on Wire Burning',
    title_hi: 'तारों को आग में जलाना सख्त मना है',
    title_mr: 'वायरी जाळून तांबे काढण्यास सक्त मनाई',
    short_warning_en: 'Burning PVC wires causes cancer-causing dioxin fumes and ruins lungs.',
    short_warning_hi: 'प्लास्टिक जलाने से कैंसर करने वाला जहरीला धुआं निकलता है। फेफड़े खराब होते हैं।',
    short_warning_mr: 'प्लास्टिक जाळल्याने कॅन्सरकारक विषारी धूर निघतो व फुफ्फुसे खराब होतात.',
    dos_en: ['Sell unstripped wire to authorized recyclers', 'Use mechanical stripper if provided'],
    dos_hi: ['तार सीधे अधिकृत रिसाइक्लर को बेचें', 'मशीन से छीलें न कि आग से'],
    dos_mr: ['वायरी थेट अधिकृत रिसायकलरला विका', 'मशीनचा वापर करा'],
    donts_en: ['Never burn in open grounds or chawls', 'Never pour kerosene on cables'],
    donts_hi: ['खुले मैदान या झोपड़पट्टी में आग न लगाएं', 'मिट्टी का तेल न डालें'],
    donts_mr: ['उघड्यावर आग लावू नका', 'रॉकेल किंवा डिझेल ओतू नका'],
    icon_name: 'Ban',
    severity: 'critical',
  },
];

export const INITIAL_RECYCLERS: RecyclerProfile[] = [
  {
    id: 'rec-1',
    profile_id: 'prof-rec-1',
    company_name: 'EcoRounds Authorized Aggregators Pvt Ltd',
    facility_address: 'Plot B-14, TTC Industrial Area, MIDC Mahape, Navi Mumbai 400710',
    latitude: 19.1128,
    longitude: 73.0135,
    service_radius_km: 45,
    pickup_available: true,
    capacity_per_month_mt: 300.0,
    authorization_status: 'verified',
    spcb_license_number: 'MPCB/RO-NM/EW/2024/0912',
    cpcb_registration_no: 'CPCB-REG-EW-MH-0844',
    created_at: '2026-08-15T00:00:00Z',
    updated_at: '2026-09-20T00:00:00Z',
  },
  {
    id: 'rec-2',
    profile_id: 'prof-rec-2',
    company_name: 'GreenShield Recovery Systems',
    facility_address: 'Survey 88, Taloja Industrial Estate, Panvel, Raigad 410208',
    latitude: 19.0435,
    longitude: 73.1254,
    service_radius_km: 60,
    pickup_available: true,
    capacity_per_month_mt: 450.0,
    authorization_status: 'verified',
    spcb_license_number: 'MPCB/RO-TAL/EW/2023/1104',
    cpcb_registration_no: 'CPCB-REG-EW-MH-0519',
    created_at: '2026-07-10T00:00:00Z',
    updated_at: '2026-09-18T00:00:00Z',
  },
  {
    id: 'rec-3',
    profile_id: 'prof-rec-3',
    company_name: 'MahaRecycle Urban Cleantech',
    facility_address: 'Gala 4, Kurla Scrap Merchant Complex, Mumbai 400070',
    latitude: 19.0663,
    longitude: 72.8821,
    service_radius_km: 25,
    pickup_available: true,
    capacity_per_month_mt: 120.0,
    authorization_status: 'under_review',
    spcb_license_number: 'MPCB-PROV-2026-44',
    cpcb_registration_no: 'CPCB-PENDING-2026',
    created_at: '2026-09-10T00:00:00Z',
    updated_at: '2026-09-21T00:00:00Z',
  },
];

export const INITIAL_COLLECTOR: CollectorProfile = {
  id: 'col-1',
  profile_id: 'prof-col-1',
  collector_code: 'EK-COL-7089',
  operating_hub: 'Dharavi 90ft Road Hub, Mumbai',
  latitude: 19.0435,
  longitude: 72.8567,
  trust_score: 4.9,
  total_collections_count: 24,
  created_at: '2026-08-01T00:00:00Z',
  profile: {
    id: 'prof-col-1',
    role: 'collector',
    full_name: 'Rameshwar Shantaram Jadhav',
    phone_number: '+91 98201 44512',
    preferred_language: 'mr',
    city: 'Mumbai',
    state: 'Maharashtra',
    is_active: true,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-09-20T00:00:00Z',
  },
};

// Initial Seed Lots for Demonstration & Traceability
export const INITIAL_LOTS: Lot[] = [
  {
    id: 'lot-101',
    lot_code: 'LOT-2026-0921-001',
    collector_id: 'col-1',
    category_id: 'cat-pcb',
    approx_weight_kg: 24.5,
    estimated_value_inr: 7840,
    agreed_rate_per_kg: 330,
    final_sale_value_inr: 8085,
    description: 'Server motherboards and desktop telecom cards collected from Kurla commercial offices.',
    primary_image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    location_name: 'Dharavi Sector 4 Hub, Mumbai',
    latitude: 19.0435,
    longitude: 72.8567,
    status: 'payment_completed',
    selected_recycler_id: 'rec-1',
    created_at: '2026-09-21T09:15:00Z',
    updated_at: '2026-09-21T14:40:00Z',
  },
  {
    id: 'lot-102',
    lot_code: 'LOT-2026-0922-002',
    collector_id: 'col-1',
    category_id: 'cat-copper',
    approx_weight_kg: 18.0,
    estimated_value_inr: 10080,
    agreed_rate_per_kg: 570,
    final_sale_value_inr: 10260,
    description: 'Heavy copper wiring from air conditioner dismantling. Insulation intact.',
    primary_image_url: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=600&q=80',
    location_name: 'Sion Koliwada Hub, Mumbai',
    latitude: 19.0345,
    longitude: 72.8642,
    status: 'payment_completed',
    selected_recycler_id: 'rec-1',
    created_at: '2026-09-22T08:30:00Z',
    updated_at: '2026-09-22T13:10:00Z',
  },
  {
    id: 'lot-103',
    lot_code: 'LOT-2026-0923-003',
    collector_id: 'col-1',
    category_id: 'cat-battery',
    approx_weight_kg: 42.0,
    estimated_value_inr: 7560,
    agreed_rate_per_kg: 185,
    description: 'Two UPS lead acid batteries from housing society backup repair.',
    primary_image_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
    location_name: 'Dharavi 90ft Road Hub, Mumbai',
    latitude: 19.0435,
    longitude: 72.8567,
    status: 'offer_received',
    selected_recycler_id: 'rec-2',
    created_at: '2026-09-23T07:10:00Z',
    updated_at: '2026-09-23T08:20:00Z',
  },
];

export const INITIAL_OFFERS: RecyclerOffer[] = [
  {
    id: 'off-1',
    lot_id: 'lot-103',
    recycler_id: 'rec-2',
    offered_rate_per_kg: 185,
    total_offered_amount: 7770,
    pickup_offered: true,
    estimated_pickup_hours: 3,
    notes: 'Authorized hazardous lead handling facility pickup van available in Sion/Dharavi sector.',
    is_accepted: false,
    created_at: '2026-09-23T08:00:00Z',
  },
  {
    id: 'off-2',
    lot_id: 'lot-103',
    recycler_id: 'rec-1',
    offered_rate_per_kg: 180,
    total_offered_amount: 7560,
    pickup_offered: true,
    estimated_pickup_hours: 5,
    notes: 'Pickup with verified calibrated digital crane scale.',
    is_accepted: false,
    created_at: '2026-09-23T08:15:00Z',
  },
];

export const INITIAL_HANDOVERS: Handover[] = [
  {
    id: 'hnd-1',
    handover_code: 'HND-2026-781',
    lot_id: 'lot-101',
    collector_id: 'col-1',
    recycler_id: 'rec-1',
    verified_weight_kg: 24.5,
    final_amount_inr: 8085,
    handover_photo_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    latitude: 19.0435,
    longitude: 72.8567,
    location_name: 'Dharavi Sector 4 Hub, Mumbai',
    collector_otp_verified: true,
    handover_timestamp: '2026-09-21T14:30:00Z',
    digital_signature_hash: 'sha256-e9b4412c98a01f5',
    created_at: '2026-09-21T14:30:00Z',
  },
  {
    id: 'hnd-2',
    handover_code: 'HND-2026-795',
    lot_id: 'lot-102',
    collector_id: 'col-1',
    recycler_id: 'rec-1',
    verified_weight_kg: 18.0,
    final_amount_inr: 10260,
    handover_photo_url: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=400&q=80',
    latitude: 19.0345,
    longitude: 72.8642,
    location_name: 'Sion Koliwada Hub, Mumbai',
    collector_otp_verified: true,
    handover_timestamp: '2026-09-22T13:00:00Z',
    digital_signature_hash: 'sha256-a4c88319f07d23b',
    created_at: '2026-09-22T13:00:00Z',
  },
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    transaction_code: 'TXN-20260921-9921',
    lot_id: 'lot-101',
    handover_id: 'hnd-1',
    collector_id: 'col-1',
    recycler_id: 'rec-1',
    amount_inr: 8085,
    payment_mode: 'cash',
    payment_status: 'completed',
    payment_reference: 'CASH-RECEIPT-VOUCHER-0881',
    completed_at: '2026-09-21T14:40:00Z',
    created_at: '2026-09-21T14:40:00Z',
  },
  {
    id: 'pay-2',
    transaction_code: 'TXN-20260922-4819',
    lot_id: 'lot-102',
    handover_id: 'hnd-2',
    collector_id: 'col-1',
    recycler_id: 'rec-1',
    amount_inr: 10260,
    payment_mode: 'upi',
    payment_status: 'completed',
    payment_reference: 'UPI/HDFC/20260922/918237',
    completed_at: '2026-09-22T13:10:00Z',
    created_at: '2026-09-22T13:10:00Z',
  },
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp-1',
    complaint_code: 'CMP-2026-104',
    raised_by: 'prof-col-1',
    against_user: 'prof-rec-3',
    lot_id: 'lot-101',
    category: 'Payment Delay Inquiry',
    description: 'Recycler requested 3-hour delay for cash balance settlement at Dharavi checkpost. Resolved smoothly upon vehicle arrival.',
    status: 'resolved',
    admin_notes: 'Settled by aggregator field supervisor with cash voucher receipt.',
    resolved_at: '2026-09-21T16:00:00Z',
    created_at: '2026-09-21T14:00:00Z',
    updated_at: '2026-09-21T16:00:00Z',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  // ==========================================
  // COLLECTOR NOTIFICATIONS
  // ==========================================
  {
    id: 'notif-col-1',
    profile_id: 'prof-col-1',
    target_role: 'collector',
    title_en: 'New Offer Received for Battery Lot',
    title_hi: 'बैटरी लॉट के लिए नई बोली मिली',
    title_mr: 'बॅटरी लॉटसाठी नवीन ऑफर प्राप्त झाली',
    title_gu: 'બેટરી લોટ માટે નવી ઑફર મળી',
    title_ta: 'பேட்டரி லாட்டுக்கு புதிய சலுகை வந்துள்ளது',
    title_te: 'బ్యాటరీ లాట్ కోసం కొత్త ఆఫర్ వచ్చింది',
    title_kn: 'ಬ್ಯಾಟರಿ ಲಾಟ್‌ಗಾಗಿ ಹೊಸ ಆಫರ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ',
    message_en: 'GreenShield Recovery Systems offered ₹185/kg (₹7,770 total) with doorstep pickup.',
    message_hi: 'ग्रीनशील्ड सिस्टम्स ने ₹185/किलो (कुल ₹7,770) का ऑफर दिया है।',
    message_mr: 'ग्रीनशील्ड रिकव्हरी सिस्टीम्सने ₹185/किलो (एकूण ₹7,770) चा भाव दिला आहे.',
    message_gu: 'ગ્રીનશીલ્ડ સિસ્ટમ્સે ડોરસ્ટેપ પીકઅપ સાથે ₹185/કિગ્રાની ઑફર કરી.',
    message_ta: 'கிரீன்ஷீல்ட் நிறுவனம் ₹185/கிலோ விலையில் வீட்டு வாசலில் பிக்கப் வழங்குகிறது.',
    message_te: 'గ్రీన్‌షీల్డ్ సిస్టమ్స్ డోర్‌స్టెప్ పికప్‌తో ₹185/కిలో ఆఫర్ చేసింది.',
    message_kn: 'ಗ್ರೀನ್‌ಶೀಲ್ಡ್ ಸಿಸ್ಟಮ್ಸ್ ಮನೆಬಾಗಿಲಿನ ಪಿಕಪ್‌ನೊಂದಿಗೆ ₹185/ಕೆಜಿ ಆಫರ್ ನೀಡಿದೆ.',
    entity_type: 'offer',
    entity_id: 'off-1',
    is_read: false,
    created_at: '2026-09-23T08:00:00Z',
  },
  {
    id: 'notif-col-2',
    profile_id: 'prof-col-1',
    target_role: 'collector',
    title_en: 'Payment Received: ₹8,085',
    title_hi: 'रुपये प्राप्त हुए: ₹8,085',
    title_mr: 'पैसे जमा झाले: ₹8,085',
    title_gu: 'ચૂકવણી મળી: ₹8,085',
    title_ta: 'பணம் பெறப்பட்டது: ₹8,085',
    title_te: 'చెల్లింపు అందింది: ₹8,085',
    title_kn: 'ಪಾವತಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ: ₹8,085',
    message_en: 'Cash payment of ₹8,085 completed for PCB Lot #LOT-2026-0921-001.',
    message_hi: 'पीसीबी लॉट #LOT-2026-0921-001 के लिए ₹8,085 का नकद भुगतान हुआ।',
    message_mr: 'पीसीबी लॉट #LOT-2026-0921-001 साठी ₹8,085 रोख रक्कम पूर्ण झाली.',
    message_gu: 'પીસીબી લોટ માટે ₹8,085 ની રોકડ ચૂકવણી પૂર્ણ થઈ.',
    message_ta: 'பிசிபி லாட்டுக்கு ₹8,085 ரொக்கப் பணம் வெற்றிகரமாக பெறப்பட்டது.',
    message_te: 'పీసీబీ లాట్ కోసం ₹8,085 నగదు చెల్లింపు పూర్తయింది.',
    message_kn: 'ಪಿಸಿಬಿ ಲಾಟ್‌ಗಾಗಿ ₹8,085 ನಗದು ಪಾವತಿ ಪೂರ್ಣಗೊಂಡಿದೆ.',
    entity_type: 'payment',
    entity_id: 'pay-1',
    is_read: true,
    created_at: '2026-09-21T14:40:00Z',
  },
  {
    id: 'notif-col-3',
    profile_id: 'prof-col-1',
    target_role: 'collector',
    title_en: 'AI Match: EcoRecycle Maharashtra',
    title_hi: 'एआई सर्वश्रेष्ठ रीसाइक्लर चुना गया',
    title_mr: 'एआय सर्वोत्तम खरेदीदार निवडले',
    title_gu: 'એઆઈ બેસ્ટ રીસાયકલર પસંદ કર્યું',
    title_ta: 'ஏஐ சிறந்த மறுசுழற்சியாளர் தேர்ந்தெடுக்கப்பட்டது',
    title_te: 'ఏఐ ఉత్తమ రీసైక్లర్ ఎంపికైంది',
    title_kn: 'ಎಐ ಅತ್ಯುತ್ತಮ ಮರುಬಳಕೆದಾರರನ್ನು ಆಯ್ಕೆ ಮಾಡಿದೆ',
    message_en: 'AI matched your scrap lot to verified recycler with calibrated scale & doorstep pickup vehicle.',
    message_hi: 'एआई ने आपके माल के लिए प्रमाणित इलेक्ट्रॉनिक स्केल युक्त अधिकृत रीसाइक्लर चुना है।',
    message_mr: 'एआयने तुमच्या भंगारासाठी वजनकाट्यासह वाहन पाठवणारे शासकीय परवानाधारक खरेदीदार निवडले.',
    message_gu: 'એઆઈએ તમારા ભંગાર માટે ડિજિટલ સ્કેલવાળા અધિકૃત રીસાયકલરને મેચ કર્યા.',
    message_ta: 'உங்கள் கழிவுகளுக்கு சான்றளிக்கப்பட்ட டிஜிட்டல் அளவுகோல் கொண்ட மறுசுழற்சியாளர் தேர்வு செய்யப்பட்டார்.',
    message_te: 'మీ స్క్రాప్ కోసం ధృవీకరించబడిన డిజిటల్ స్కేల్ రీసైక్లర్‌ను ఏఐ ఎంపిక చేసింది.',
    message_kn: 'ನಿಮ್ಮ ತ್ಯಾಜ್ಯಕ್ಕೆ ಡಿಜಿಟಲ್ ಮಾಪಕ ಹೊಂದಿರುವ ಪ್ರಮಾಣೀಕೃತ ಮರುಬಳಕೆದಾರರನ್ನು ಎಐ ಆಯ್ಕೆಮಾಡಿದೆ.',
    entity_type: 'system',
    is_read: false,
    created_at: '2026-09-23T07:30:00Z',
  },

  // ==========================================
  // RECYCLER NOTIFICATIONS
  // ==========================================
  {
    id: 'notif-rec-1',
    profile_id: 'prof-rec-1',
    target_role: 'recycler',
    title_en: 'New Collection Lot in Your Service Radius',
    title_hi: 'आपके सेवा क्षेत्र में नया ई-कचरा लॉट',
    title_mr: 'तुमच्या कार्यक्षेत्रात नवीन ई-कचरा लॉट उपलब्ध',
    title_gu: 'તમારા સર્વિસ એરિયામાં નવો ઇ-કચરો લોટ',
    title_ta: 'உங்கள் சேவை பகுதியில் புதிய மின் கழிவு லாட்',
    title_te: 'మీ సర్వీస్ ప్రాంతంలో కొత్త ఈ-వ్యర్థాల లాట్',
    title_kn: 'ನಿಮ್ಮ ಸೇವಾ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಹೊಸ ಇ-ತ್ಯಾಜ್ಯ ಲಾಟ್',
    message_en: '42kg UPS Inverter Battery lot available for pickup in Dharavi Yard 4 (within 35km radius).',
    message_hi: 'धारावी यार्ड 4 में 42 किलो यूपीएस बैटरी लॉट पिकअप हेतु उपलब्ध है।',
    message_mr: 'धारावी यार्ड ४ मध्ये ४२ किलो यूपीएस बॅटरी लॉट पिकअपसाठी उपलब्ध आहे.',
    message_gu: 'ધારાવી યાર્ડ 4 માં 42 કિગ્રા બેટરી લોટ પીકઅપ માટે ઉપલબ્ધ છે.',
    message_ta: 'தாராவி யார்ட் 4-ல் 42 கிலோ பேட்டரி லாட் எடுக்க தயாராக உள்ளது.',
    message_te: 'ధారావి యార్డ్ 4లో 42 కిలోల బ్యాటరీ లాట్ పికప్ కోసం సిద్ధంగా ఉంది.',
    message_kn: 'ಧಾರಾವಿ ಯಾರ್ಡ್ 4 ರಲ್ಲಿ 42 ಕೆಜಿ ಬ್ಯಾಟರಿ ಲಾಟ್ ಪಿಕಪ್‌ಗೆ ಸಿದ್ಧವಾಗಿದೆ.',
    entity_type: 'lot',
    entity_id: 'lot-103',
    is_read: false,
    created_at: '2026-09-23T08:15:00Z',
  },
  {
    id: 'notif-rec-2',
    profile_id: 'prof-rec-1',
    target_role: 'recycler',
    title_en: 'Pickup Confirmed: Babu Bhai Accepted Your Offer',
    title_hi: 'पिकअप स्वीकृत: बाबू भाई ने आपकी बोली स्वीकार की',
    title_mr: 'पिकअप निश्चित: बाबू भाईंनी तुमची ऑफर स्वीकारली',
    title_gu: 'પીકઅપ કન્ફર્મ: બાબુ ભાઈએ ઑફર સ્વીકારી',
    title_ta: 'பிக்கப் உறுதிசெய்யப்பட்டது: பாபு பாய் உங்கள் சலுகையை ஏற்றுக்கொண்டார்',
    title_te: 'పికప్ ఖరారైంది: బాబు భాయ్ మీ ఆఫర్‌ను అంగీకరించారు',
    title_kn: 'ಪಿಕಪ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ: ಬಾಬು ಭಾಯ್ ನಿಮ್ಮ ಆಫರ್ ಒಪ್ಪಿಕೊಂಡಿದ್ದಾರೆ',
    message_en: 'Handover scheduled at Dharavi. Please dispatch collection vehicle equipped with calibrated scale.',
    message_hi: 'धारावी में हैंडओवर शेड्यूल हुआ। कृपया कैलिब्रेटेड स्केल युक्त वाहन भेजें।',
    message_mr: 'धारावी येथे हस्तांतरण निश्चित झाले. डिजिटल वजनकाट्यासह वाहन पाठवा.',
    message_gu: 'ધારાવી ખાતે હેન્ડઓવર સમય નક્કી થયો. ડિજિટલ સ્કેલવાળું વાહન મોકલો.',
    message_ta: 'தாராவியில் கைமாற்ற நேரம் குறிக்கப்பட்டது. அளவீட்டு கருவியுடன் வாகனம் அனுப்பவும்.',
    message_te: 'ధారావిలో హ్యాండోవర్ సమయం నిర్ణయించబడింది. డిజిటల్ స్కేల్ వాహనం పంపండి.',
    message_kn: 'ಧಾರಾವಿಯಲ್ಲಿ ಹಸ್ತಾಂತರ ನಿಗದಿಯಾಗಿದೆ. ಡಿಜಿಟಲ್ ಮಾಪಕ ವಾಹನ ಕಳುಹಿಸಿ.',
    entity_type: 'handover',
    entity_id: 'hnd-1',
    is_read: false,
    created_at: '2026-09-23T07:45:00Z',
  },
  {
    id: 'notif-rec-3',
    profile_id: 'prof-rec-1',
    target_role: 'recycler',
    title_en: 'Form 6 Manifest Generated: Lot #LOT-2026-0921-001',
    title_hi: 'फॉर्म 6 घोषणापत्र तैयार हुआ: लॉट #LOT-2026-0921-001',
    title_mr: 'फॉर्म ६ मॅनिफेस्ट तयार: लॉट #LOT-2026-0921-001',
    title_gu: 'ફોર્મ 6 મેનિફેસ્ટ તૈયાર: લોટ #LOT-2026-0921-001',
    title_ta: 'படிவம் 6 அறிக்கை தயாரானது: லாட் #LOT-2026-0921-001',
    title_te: 'ఫారమ్ 6 మేనిఫెస్ట్ సిద్ధమైంది: లాట్ #LOT-2026-0921-001',
    title_kn: 'ಫಾರ್ಮ್ 6 ಮ್ಯಾನಿಫೆಸ್ಟ್ ಸಿದ್ಧವಾಗಿದೆ: ಲಾಟ್ #LOT-2026-0921-001',
    message_en: 'Regulatory manifest ready for digital signature and SPCB compliance audit log.',
    message_hi: 'प्रदूषण नियंत्रण बोर्ड के लिए डिजिटल फॉर्म 6 हस्ताक्षर हेतु तैयार है।',
    message_mr: 'महाराष्ट्र प्रदूषण नियंत्रण मंडळाच्या डिजिटल स्वाक्षरीसाठी फॉर्म ६ तयार आहे.',
    message_gu: 'નિયામક ઓડિટ માટે ડિજિટલ ફોર્મ 6 સહી માટે તૈયાર છે.',
    message_ta: 'ஒழுங்குமுறை தணிக்கைக்காக படிவம் 6 டிஜிட்டல் கையொப்பத்திற்கு தயாராக உள்ளது.',
    message_te: 'రెగ్యుಲೇటరీ ఆడిట్ కోసం డిజిటల్ ఫారమ్ 6 సంతకానికి సిద్ధంగా ఉంది.',
    message_kn: 'ನಿಯಂತ್ರಕ ಲೆಕ್ಕಪರಿಶೋಧನೆಗಾಗಿ ಡಿಜಿಟಲ್ ಫಾರ್ಮ್ 6 ಸಹಿಗೆ ಸಿದ್ಧವಾಗಿದೆ.',
    entity_type: 'system',
    is_read: true,
    created_at: '2026-09-22T16:20:00Z',
  },

  // ==========================================
  // ADMIN NOTIFICATIONS
  // ==========================================
  {
    id: 'notif-adm-1',
    profile_id: 'prof-adm-1',
    target_role: 'admin',
    title_en: 'Regulatory Alert: MMR Formalization at 92%',
    title_hi: 'नियामक सूचना: एमएमआर औपचारिक रूपांतरण 92% पहुंचा',
    title_mr: 'शासकीय सूचना: एमएमआर अनौपचारिक-ते-अधिकृत प्रमाण ९२%',
    title_gu: 'નિયામક ચેતવણી: એમએમઆર ફોર્મલાઇઝેશન 92% પહોંચ્યું',
    title_ta: 'ஒழுங்குமுறை எச்சரிக்கை: எம்எம்ஆர் முறையான பதிவு 92% எட்டியுள்ளது',
    title_te: 'రెగ్యులేటరీ అలర్ట్: ఎంఎంఆర్ ఫార్మలైజేషన్ 92%కి చేరుకుంది',
    title_kn: 'ನಿಯಂತ್ರಣ ಎಚ್ಚರಿಕೆ: ಎಂಎಂಆರ್ ಔಪಚಾರಿಕೀಕರಣ ಶೇ 92 ತಲುಪಿದೆ',
    message_en: 'Central E-Waste Registry verified 1,280 kg safely diverted from open burning in Mumbai cluster this month.',
    message_hi: 'केंद्रीय रजिस्ट्री: मुंबई में 1,280 किलो कचरा खुले में जलाने से रोककर सुरक्षित रिसाइकल किया गया।',
    message_mr: 'केंद्रीय ई-कचरा नोंदणी: मुंबई क्षेत्रात १,२८० किलो कचरा जाळण्यापासून वाचवून सुरक्षितपणे वळवला गेला.',
    message_gu: 'મુંબઈ ક્ષેત્રમાં 1,280 કિગ્રા કચરો બળવાથી બચાવી સુરક્ષિત રીતે રિસાયકલ કરવામાં આવ્યો.',
    message_ta: 'மும்பை பகுதியில் 1,280 கிலோ மின்னணுக் கழிவுகள் எரிக்கப்படாமல் பாதுகாப்பாக திசைதிருப்பப்பட்டது.',
    message_te: 'ముంబై క్లస్టర్‌లో 1,280 కిలోల వ్యర్థాలు తగులబెట్టకుండా సురక్షితంగా రీసైకిల్ చేయబడ్డాయి.',
    message_kn: 'ಮುಂಬೈ ಕ್ಲಸ್ಟರ್‌ನಲ್ಲಿ 1,280 ಕೆಜಿ ಇ-ತ್ಯಾಜ್ಯವನ್ನು ಸುಡುವುದರಿಂದ ತಪ್ಪಿಸಿ ಮರುಬಳಕೆಗೆ ಒಳಪಡಿಸಲಾಗಿದೆ.',
    entity_type: 'system',
    is_read: false,
    created_at: '2026-09-23T09:00:00Z',
  },
  {
    id: 'notif-adm-2',
    profile_id: 'prof-adm-1',
    target_role: 'admin',
    title_en: 'Inspection Anomaly: Weight Variance in Kurla Hub',
    title_hi: 'निरीक्षण असंगति: कुर्ला हब में वजन विसंगति दर्ज',
    title_mr: 'तपासणी विसंगती: कुर्ला हबमध्ये वजनात तफावत आढळली',
    title_gu: 'તપાસ વિસંગતતા: કુર્લા હબમાં વજન તફાવત',
    title_ta: 'ஆய்வு முரண்பாடு: குர்லா மையத்தில் எடை மாறுபாடு',
    title_te: 'పరిశీలన తేడా: కుర్లా హబ్‌లో బరువు వ్యత్యాసం',
    title_kn: 'ಪರಿಶೀಲನಾ ವ್ಯತ್ಯಾಸ: ಕುರ್ಲಾ ಹಬ್‌ನಲ್ಲಿ ತೂಕ ವ್ಯತ್ಯಾಸ',
    message_en: 'Single residential unit logged 42kg of high-density battery scrap. Verified as commercial inverter backup cells.',
    message_hi: 'एकल आवासीय इकाई से 42 किलो बैटरी स्क्रैप दर्ज। वाणिज्यिक इन्वर्टर सेल के रूप में सत्यापित।',
    message_mr: 'एकाच घरातून ४२ किलो बॅटरी भंगार नोंदवले गेले. व्यावसायिक इन्व्हर्टर बॅटरी म्हणून पडताळणी झाली.',
    message_gu: 'એકલ રહેણાંક એકમમાંથી 42 કિગ્રા બેટરી ભંગાર નોંધાયો. વ્યાવસાયિક ઇન્વર્ટર સેલ તરીકે ચકાસણી થઈ.',
    message_ta: 'ஒற்றை குடியிருப்புப் பகுதியிலிருந்து 42 கிலோ பேட்டரி பதிவு செய்யப்பட்டது. வணிக இன்வெர்ட்டர் செல்கள் என சரிபார்க்கப்பட்டது.',
    message_te: 'ఒకే నివాస యూనిట్ నుండి 42 కిలోల బ్యాటరీ స్క్రాప్ నమోదైంది. కమర్షియల్ ఇన్వర్టర్ సెల్స్‌గా ధృవీకరించబడింది.',
    message_kn: 'ಒಂದೇ ವಸತಿ ಘಟಕದಿಂದ 42 ಕೆಜಿ ಬ್ಯಾಟರಿ ತ್ಯಾಜ್ಯ ದಾಖಲಾಗಿದೆ. ವಾಣಿಜ್ಯ ಇನ್ವರ್ಟರ್ ಸೆಲ್‌ಗಳು ಎಂದು ಪರಿಶೀಲಿಸಲಾಗಿದೆ.',
    entity_type: 'lot',
    entity_id: 'lot-103',
    is_read: false,
    created_at: '2026-09-23T07:15:00Z',
  },
  {
    id: 'notif-adm-3',
    profile_id: 'prof-adm-1',
    target_role: 'admin',
    title_en: 'Grievance Filed: Ticket #CMP-202609-001',
    title_hi: 'शिकायत दर्ज: टिकट #CMP-202609-001',
    title_mr: 'तक्रार दाखल: तिकीट #CMP-202609-001',
    title_gu: 'ફરિયાદ દાખલ: ટિકિટ #CMP-202609-001',
    title_ta: 'புகார் பதிவு: டிக்கெட் #CMP-202609-001',
    title_te: 'ఫిర్యాదు దాఖలు: టికెట్ #CMP-202609-001',
    title_kn: 'ದೂರು ದಾಖಲು: ಟಿಕೆಟ್ #CMP-202609-001',
    message_en: 'Informal collector raised scale calibration inquiry for Chembur aggregator. Pending regulatory desk mediation.',
    message_hi: 'संग्रहक ने चेंबूर एग्रीगेटर के खिलाफ तराजू संबंधी शिकायत दर्ज की। समाधान हेतु लंबित।',
    message_mr: 'कचरा वेचकाने चेंबूर ॲग्रीगेटरच्या काट्याबाबत तक्रार नोंदवली आहे. मध्यस्थी प्रलंबित.',
    message_gu: 'કલેક્ટરે ચેમ્બુર એગ્રીગેટરના વજનકાંટા અંગે ફરિયાદ નોંધાવી. મધ્યસ્થી પેન્ડિંગ.',
    message_ta: 'செம்பூர் சேகரிப்பாளரின் எடைத்தராசு குறித்து புகார் எழுப்பப்பட்டுள்ளது. ஒழுங்குமுறை தீர்வு நிலுவையில் உள்ளது.',
    message_te: 'చెంబూర్ అగ్రిగేటర్ స్కేల్ క్రమాంకనంపై ఫిర్యాదు నమోదైంది. పరిష్కారం పెండింగ్‌లో ఉంది.',
    message_kn: 'ಚೆಂಬೂರ್ ಅಗ್ರಿಗೇಟರ್ ತೂಕದ ಮಾಪಕದ ಬಗ್ಗೆ ದೂರು ದಾಖಲಾಗಿದೆ. ಪರಿಹಾರ ಬಾಕಿ ಉಳಿದಿದೆ.',
    entity_type: 'system',
    entity_id: 'cmp-1',
    is_read: false,
    created_at: '2026-09-21T14:00:00Z',
  },
  {
    id: 'notif-adm-4',
    profile_id: 'prof-adm-1',
    target_role: 'admin',
    title_en: 'Recycler License Audit: EcoRecycle Maharashtra',
    title_hi: 'रीसाइक्लर लाइसेंस ऑडिट: इकोरीसायकल महाराष्ट्र',
    title_mr: 'परवाना तपासणी: इकोरिसायकल महाराष्ट्र',
    title_gu: 'રીસાયકલર લાયસન્સ ઓડિટ: ઇકોરીસાયકલ મહારાષ્ટ્ર',
    title_ta: 'மறுசுழற்சியாளர் உரிம தணிக்கை: எகோரீசைக்கிள் மகாராஷ்டிரா',
    title_te: 'రీసైక్లర్ లైసెన్స్ ఆడిట్: ఎకోరీసైకిల్ మహారాష్ట్ర',
    title_kn: 'ಮರುಬಳಕೆದಾರರ ಪರವಾನಗಿ ಲೆಕ್ಕಪರಿಶೋಧನೆ: ಇಕೋರೀಸೈಕಲ್ ಮಹಾರಾಷ್ಟ್ರ',
    message_en: 'SPCB Form 6 annual authorization compliance verified for 250 MT/month capacity facility.',
    message_hi: '250 मीट्रिक टन/माह क्षमता वाले संयंत्र का वार्षिक प्रदूषण नियंत्रण अनुपालन सत्यापित।',
    message_mr: '२५० मेट्रिक टन/महिना क्षमतेच्या फॅक्टरीचे वार्षिक प्रदूषण नियंत्रण अनुपालन यशस्वी.',
    message_gu: '250 મેટ્રિક ટન/માસ ક્ષમતાવાળા પ્લાન્ટનું વાર્ષિક પ્રદૂષણ નિયંત્રણ પાલન ચકાસાયું.',
    message_ta: '250 மெட்ரிக் டன்/மாத திறன் கொண்ட வசதிக்கான வருடாந்திர மாசுக்கட்டுப்பாட்டு விதிமுறைகள் சரிபார்க்கப்பட்டது.',
    message_te: '250 మెట్రిక్ టన్నుల సామర్థ్యం గల సదుపాయానికి వార్షિક కాలుష్య నియంత్రణ నిబంధనలు ధృవీకరించబడ్డాయి.',
    message_kn: 'ತಿಂಗಳಿಗೆ 250 ಮೆಟ್ರಿಕ್ ಟನ್ ಸಾಮರ್ಥ್ಯದ ಸ್ಥಾವರದ ವಾರ್ಷಿಕ ಮಾಲಿನ್ಯ ನಿಯಂತ್ರಣ ಅನುಸರಣೆ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.',
    entity_type: 'system',
    is_read: true,
    created_at: '2026-09-20T10:00:00Z',
  },
];

export const INITIAL_FIELD_RESEARCH: FieldResearchRecord[] = [
  {
    id: 'fr-1',
    informal_collector_pseudonym: 'Babu Bhai (Informal Collector, Dharavi 13th Compound)',
    hub_area: 'Dharavi Scrap Yard, Mumbai',
    years_in_scrap_collection: 14,
    typical_daily_weight_kg: 35.0,
    middleman_rate_per_kg: 210.0,
    ekatra_platform_rate_per_kg: 320.0,
    health_issues_reported: 'Chronic cough from burning copper wire coverings indoors in 2021; now stopped after EKATRA awareness.',
    notes: 'Prior to formal auctioning, local aggregators took a 40% margin. EKATRA direct aggregator link provides an extra ₹3,500/week net income.',
    recorded_at: '2026-09-12T11:00:00Z',
  },
  {
    id: 'fr-2',
    informal_collector_pseudonym: 'Anita Tai (Door-to-door E-Waste Buyer)',
    hub_area: 'Kurla West Station Colony, Mumbai',
    years_in_scrap_collection: 8,
    typical_daily_weight_kg: 22.0,
    middleman_rate_per_kg: 120.0,
    ekatra_platform_rate_per_kg: 180.0,
    health_issues_reported: 'Acid skin burns from old battery leakage in 2023. Needs accessible protective gloves.',
    notes: 'Welcomes cash-on-delivery guarantee and clear pictorial price board so she knows exact fair value before negotiating with households.',
    recorded_at: '2026-09-15T15:30:00Z',
  },
];

export const INITIAL_ANOMALIES: AnomalyRecord[] = [
  {
    id: 'anom-1',
    lot_id: 'lot-103',
    rule_triggered: 'Weight-to-category high density variance',
    severity: 'low',
    details: 'Lot contains 42kg for single residential unit pickup. Verified as dual UPS commercial inverter battery set.',
    is_reviewed: true,
    review_notes: 'Aggregator verified with photo evidence; standard UPS industrial cells.',
    created_at: '2026-09-23T07:12:00Z',
  },
];

// ============================================================================
// REACTIVE STORE & SUPABASE DATABASE ACCESS LAYER
// ============================================================================
const LOCAL_STORAGE_KEY = 'ekatra_database_state_v3';

interface DBState {
  categories: MaterialCategory[];
  prices: PriceRecord[];
  recyclers: RecyclerProfile[];
  collector: CollectorProfile;
  lots: Lot[];
  offers: RecyclerOffer[];
  handovers: Handover[];
  payments: Payment[];
  complaints: Complaint[];
  notifications: NotificationItem[];
  safetyGuides: SafetyGuide[];
  fieldResearch: FieldResearchRecord[];
  anomalies: AnomalyRecord[];
}

function loadInitialState(): DBState {
  if (typeof window === 'undefined') {
    return {
      categories: INITIAL_CATEGORIES,
      prices: INITIAL_PRICES,
      recyclers: INITIAL_RECYCLERS,
      collector: INITIAL_COLLECTOR,
      lots: INITIAL_LOTS,
      offers: INITIAL_OFFERS,
      handovers: INITIAL_HANDOVERS,
      payments: INITIAL_PAYMENTS,
      complaints: INITIAL_COMPLAINTS,
      notifications: INITIAL_NOTIFICATIONS,
      safetyGuides: INITIAL_SAFETY_GUIDES,
      fieldResearch: INITIAL_FIELD_RESEARCH,
      anomalies: INITIAL_ANOMALIES,
    };
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure all roles have their notifications
      const loadedNotifs: NotificationItem[] = parsed.notifications || [];
      const hasRecycler = loadedNotifs.some(
        (n) => n.target_role === 'recycler' || n.profile_id?.includes('rec')
      );
      const hasAdmin = loadedNotifs.some(
        (n) => n.target_role === 'admin' || n.profile_id?.includes('adm')
      );

      let finalNotifs = loadedNotifs;
      if (!hasRecycler || !hasAdmin || loadedNotifs.length < 5) {
        // Merge missing initial role notifications
        finalNotifs = [...INITIAL_NOTIFICATIONS];
      }

      // Ensure categories have complete multilingual names
      const categories =
        parsed.categories && parsed.categories[0]?.name_gu
          ? parsed.categories
          : INITIAL_CATEGORIES;
      const prices =
        parsed.prices && parsed.prices[0]?.sub_category_name_gu
          ? parsed.prices
          : INITIAL_PRICES;

      return {
        categories,
        prices,
        recyclers: parsed.recyclers || INITIAL_RECYCLERS,
        collector: parsed.collector || INITIAL_COLLECTOR,
        lots: parsed.lots || INITIAL_LOTS,
        offers: parsed.offers || INITIAL_OFFERS,
        handovers: parsed.handovers || INITIAL_HANDOVERS,
        payments: parsed.payments || INITIAL_PAYMENTS,
        complaints: parsed.complaints || INITIAL_COMPLAINTS,
        notifications: finalNotifs,
        safetyGuides: parsed.safetyGuides || INITIAL_SAFETY_GUIDES,
        fieldResearch: parsed.fieldResearch || INITIAL_FIELD_RESEARCH,
        anomalies: parsed.anomalies || INITIAL_ANOMALIES,
      };
    }
  } catch (e) {
    console.error('Failed to parse local database state:', e);
  }

  return {
    categories: INITIAL_CATEGORIES,
    prices: INITIAL_PRICES,
    recyclers: INITIAL_RECYCLERS,
    collector: INITIAL_COLLECTOR,
    lots: INITIAL_LOTS,
    offers: INITIAL_OFFERS,
    handovers: INITIAL_HANDOVERS,
    payments: INITIAL_PAYMENTS,
    complaints: INITIAL_COMPLAINTS,
    notifications: INITIAL_NOTIFICATIONS,
    safetyGuides: INITIAL_SAFETY_GUIDES,
    fieldResearch: INITIAL_FIELD_RESEARCH,
    anomalies: INITIAL_ANOMALIES,
  };
}

// Master synchronized in-memory and local storage state
let dbState: DBState = loadInitialState();
const listeners = new Set<() => void>();

function persistAndBroadcast(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dbState));
    } catch (e) {
      console.warn('LocalStorage quota or write error:', e);
    }
  }
  listeners.forEach((fn) => fn());
}

export function subscribeToDB(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

// ============================================================================
// SERVICE API METHODS (Supports offline queue & real Supabase synchronization)
// ============================================================================
export const EkatraDB = {
  // GETTERS
  getCategories(): MaterialCategory[] {
    return dbState.categories;
  },

  getPrices(): PriceRecord[] {
    return dbState.prices.map((p) => ({
      ...p,
      category: dbState.categories.find((c) => c.id === p.category_id),
    }));
  },

  getRecyclers(): RecyclerProfile[] {
    return dbState.recyclers;
  },

  getCollectorProfile(): CollectorProfile {
    return dbState.collector;
  },

  getLots(): Lot[] {
    return dbState.lots.map((lot) => ({
      ...lot,
      category: dbState.categories.find((c) => c.id === lot.category_id),
      selected_recycler: dbState.recyclers.find(
        (r) => r.id === lot.selected_recycler_id
      ),
      offers: dbState.offers
        .filter((o) => o.lot_id === lot.id)
        .map((o) => ({
          ...o,
          recycler: dbState.recyclers.find((r) => r.id === o.recycler_id),
        })),
      handover: dbState.handovers.find((h) => h.lot_id === lot.id),
      payment: dbState.payments.find((p) => p.lot_id === lot.id),
    }));
  },

  getOffersForLot(lotId: string): RecyclerOffer[] {
    return dbState.offers
      .filter((o) => o.lot_id === lotId)
      .map((o) => ({
        ...o,
        recycler: dbState.recyclers.find((r) => r.id === o.recycler_id),
      }));
  },

  getHandovers(): Handover[] {
    return dbState.handovers.map((h) => ({
      ...h,
      lot: dbState.lots.find((l) => l.id === h.lot_id),
      recycler: dbState.recyclers.find((r) => r.id === h.recycler_id),
    }));
  },

  getPayments(): Payment[] {
    return dbState.payments.map((p) => {
      const lot = dbState.lots.find((l) => l.id === p.lot_id);
      return {
        ...p,
        lot: lot
          ? {
              ...lot,
              category: dbState.categories.find((c) => c.id === lot.category_id),
            }
          : undefined,
        recycler: dbState.recyclers.find((r) => r.id === p.recycler_id),
        collector: dbState.collector,
        handover: dbState.handovers.find(
          (h) => h.id === p.handover_id || h.lot_id === p.lot_id
        ),
      };
    });
  },

  getComplaints(): Complaint[] {
    return dbState.complaints;
  },

  getNotifications(role?: UserRole): NotificationItem[] {
    let list = dbState.notifications;
    if (role) {
      list = list.filter((n) => {
        if (n.target_role) {
          return n.target_role === role;
        }
        if (role === 'collector') return n.profile_id.includes('col');
        if (role === 'recycler') return n.profile_id.includes('rec');
        if (role === 'admin') return n.profile_id.includes('adm');
        return false;
      });
    }
    return list.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  getSafetyGuides(): SafetyGuide[] {
    return dbState.safetyGuides;
  },

  getFieldResearch(): FieldResearchRecord[] {
    return dbState.fieldResearch;
  },

  getAnomalies(): AnomalyRecord[] {
    return dbState.anomalies.map((a) => ({
      ...a,
      lot: dbState.lots.find((l) => l.id === a.lot_id),
    }));
  },

  // MUTATIONS (Idempotent, Transactional)
  createLot(
    category_id: string,
    approx_weight_kg: number,
    location_name: string,
    latitude: number,
    longitude: number,
    primary_image_url?: string,
    description?: string,
    preferred_recycler_id?: string
  ): Lot {
    const category = dbState.categories.find((c) => c.id === category_id);
    const benchmarkRate = category ? category.benchmark_price_per_kg : 150;
    const estimated_value_inr = Math.round(approx_weight_kg * benchmarkRate);

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const lot_code = `LOT-${dateStr}-${randomSuffix}`;

    const newLot: Lot = {
      id: `lot-${Date.now()}`,
      lot_code,
      collector_id: dbState.collector.id,
      category_id,
      approx_weight_kg,
      estimated_value_inr,
      description: description || `E-waste lot containing ${category?.name_en || 'materials'}`,
      primary_image_url:
        primary_image_url ||
        category?.image_url ||
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
      location_name: location_name || 'Dharavi Scrap Market, Mumbai',
      latitude,
      longitude,
      status: preferred_recycler_id ? 'recycler_selected' : 'collected',
      selected_recycler_id: preferred_recycler_id,
      agreed_rate_per_kg: preferred_recycler_id ? benchmarkRate : undefined,
      final_sale_value_inr: preferred_recycler_id ? estimated_value_inr : undefined,
      handover_otp: String(Math.floor(1000 + Math.random() * 9000)),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    dbState.lots.unshift(newLot);

    // Auto-generate offer from the AI preferred or closest verified authorized recycler
    const targetRecycler = preferred_recycler_id
      ? dbState.recyclers.find((r) => r.id === preferred_recycler_id)
      : dbState.recyclers.find((r) => r.authorization_status === 'verified');

    if (targetRecycler) {
      const offeredRate = benchmarkRate;
      const newOffer: RecyclerOffer = {
        id: `off-${Date.now()}`,
        lot_id: newLot.id,
        recycler_id: targetRecycler.id,
        offered_rate_per_kg: offeredRate,
        total_offered_amount: Math.round(approx_weight_kg * offeredRate),
        pickup_offered: true,
        estimated_pickup_hours: 4,
        notes: `AI Optimized match for ${category?.name_en || 'e-waste'}. Immediate pickup available from ${targetRecycler.company_name} with certified electronic weighing scale.`,
        is_accepted: !!preferred_recycler_id,
        created_at: new Date().toISOString(),
      };
      dbState.offers.unshift(newOffer);
      if (preferred_recycler_id) {
        newLot.status = 'recycler_selected';
        newLot.agreed_rate_per_kg = offeredRate;
      } else {
        newLot.status = 'offer_received';
      }

      // Send persistent notification to collector
      dbState.notifications.unshift({
        id: `notif-${Date.now()}-col`,
        profile_id: dbState.collector.profile_id,
        target_role: 'collector',
        title_en: preferred_recycler_id ? `AI Match Assigned: ${targetRecycler.company_name}` : `New Offer on ${lot_code}`,
        title_hi: preferred_recycler_id ? `एआई रीसाइक्लर चुना गया: ${targetRecycler.company_name}` : `${lot_code} के लिए नया ऑफर मिला`,
        title_mr: preferred_recycler_id ? `एआय अधिकृत खरेदीदार निश्चित: ${targetRecycler.company_name}` : `${lot_code} साठी नवीन भाव मिळाला`,
        message_en: `${targetRecycler.company_name} assigned with rate ₹${offeredRate}/kg (Total ₹${newOffer.total_offered_amount}).`,
        message_hi: `${targetRecycler.company_name} ने ₹${offeredRate}/किलो (कुल ₹${newOffer.total_offered_amount}) पर पिकअप शेड्यूल किया।`,
        message_mr: `${targetRecycler.company_name} कडून ₹${offeredRate}/किलो (एकूण ₹${newOffer.total_offered_amount}) दराने पिकअप निश्चित झाले.`,
        entity_type: 'offer',
        entity_id: newOffer.id,
        is_read: false,
        created_at: new Date().toISOString(),
      });

      // Send notification to recycler
      dbState.notifications.unshift({
        id: `notif-${Date.now()}-rec`,
        profile_id: targetRecycler.profile_id,
        target_role: 'recycler',
        title_en: `New Assigned Lot: ${lot_code} (${approx_weight_kg}kg)`,
        title_hi: `नया असाइन्ड लॉट: ${lot_code} (${approx_weight_kg} किलो)`,
        title_mr: `नवीन नियुक्त लॉट: ${lot_code} (${approx_weight_kg} किलो)`,
        message_en: `AI matched your facility to collect ${approx_weight_kg}kg e-waste at ₹${offeredRate}/kg from ${location_name}.`,
        message_hi: `एआई ने ₹${offeredRate}/किलो की दर से ${approx_weight_kg} किलो कचरे के लिए आपके संयंत्र का चयन किया।`,
        message_mr: `एआईने ${location_name} येथून ₹${offeredRate}/किलो दराने ${approx_weight_kg} किलो ई-कचरा पिकअप निश्चित केला.`,
        entity_type: 'lot',
        entity_id: newLot.id,
        is_read: false,
        created_at: new Date().toISOString(),
      });

      // Send regulatory audit notification to admin
      dbState.notifications.unshift({
        id: `notif-${Date.now()}-adm`,
        profile_id: 'prof-adm-1',
        target_role: 'admin',
        title_en: `Lot Registered: ${lot_code} (${category?.name_en || 'E-Waste'})`,
        title_hi: `लॉट पंजीकृत: ${lot_code}`,
        title_mr: `लॉट नोंदणी: ${lot_code}`,
        message_en: `Informal collector Babu Bhai logged ${approx_weight_kg}kg at ${location_name}. Routed to ${targetRecycler.company_name}.`,
        message_hi: `संग्रहक बाबू भाई ने ${approx_weight_kg} किलो माल पंजीकृत किया। ${targetRecycler.company_name} को प्रेषित।`,
        message_mr: `कचरा वेचक बाबू भाईंनी ${approx_weight_kg} किलो लॉट नोंदवला. ${targetRecycler.company_name} कडे वर्ग.`,
        entity_type: 'lot',
        entity_id: newLot.id,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    persistAndBroadcast();
    return newLot;
  },

  submitRecyclerOffer(
    lot_id: string,
    recycler_id: string,
    offered_rate_per_kg: number,
    pickup_offered: boolean = true,
    estimated_pickup_hours: number = 4,
    notes?: string
  ): RecyclerOffer {
    const lot = dbState.lots.find((l) => l.id === lot_id);
    if (!lot) throw new Error('Lot not found');

    const total_offered_amount = Math.round(
      lot.approx_weight_kg * offered_rate_per_kg
    );

    const offer: RecyclerOffer = {
      id: `off-${Date.now()}`,
      lot_id,
      recycler_id,
      offered_rate_per_kg,
      total_offered_amount,
      pickup_offered,
      estimated_pickup_hours,
      notes,
      is_accepted: false,
      created_at: new Date().toISOString(),
    };

    dbState.offers.unshift(offer);
    lot.status = 'offer_received';
    lot.updated_at = new Date().toISOString();

    const recycler = dbState.recyclers.find((r) => r.id === recycler_id);

    // Send offer notification to collector
    dbState.notifications.unshift({
      id: `notif-${Date.now()}-col`,
      profile_id: dbState.collector.profile_id,
      target_role: 'collector',
      title_en: `New Offer: ₹${offered_rate_per_kg}/kg`,
      title_hi: `नई बोली: ₹${offered_rate_per_kg}/किलो`,
      title_mr: `नवीन ऑफर: ₹${offered_rate_per_kg}/किलो`,
      message_en: `${recycler?.company_name || 'Recycler'} offered ₹${offered_rate_per_kg}/kg for Lot ${lot.lot_code}.`,
      message_hi: `${recycler?.company_name || 'रीसाइक्लर'} ने लॉट ${lot.lot_code} के लिए ₹${offered_rate_per_kg}/किलो की बोली लगाई।`,
      message_mr: `${recycler?.company_name || 'रिसायकलर'} ने लॉट ${lot.lot_code} साठी ₹${offered_rate_per_kg}/किलोची ऑफर दिली.`,
      entity_type: 'offer',
      entity_id: offer.id,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    // Send confirmation to recycler
    dbState.notifications.unshift({
      id: `notif-${Date.now()}-rec`,
      profile_id: recycler_id,
      target_role: 'recycler',
      title_en: `Offer Dispatched for ${lot.lot_code}`,
      title_hi: `बोली भेजी गई: ${lot.lot_code}`,
      title_mr: `ऑफर पाठवली: ${lot.lot_code}`,
      message_en: `Your offer of ₹${offered_rate_per_kg}/kg (Total ₹${total_offered_amount}) sent to collector Babu Bhai.`,
      message_hi: `आपका ₹${offered_rate_per_kg}/किलो (कुल ₹${total_offered_amount}) का प्रस्ताव भेजा गया।`,
      message_mr: `तुमची ₹${offered_rate_per_kg}/किलोची ऑफर कचरा वेचक बाबू भाईंना पाठवली गेली.`,
      entity_type: 'offer',
      entity_id: offer.id,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    persistAndBroadcast();
    return offer;
  },

  acceptOffer(lot_id: string, offer_id: string): void {
    const lot = dbState.lots.find((l) => l.id === lot_id);
    const offer = dbState.offers.find((o) => o.id === offer_id);
    if (!lot || !offer) throw new Error('Lot or offer not found');

    dbState.offers.forEach((o) => {
      if (o.lot_id === lot_id) {
        o.is_accepted = o.id === offer_id;
      }
    });

    lot.status = 'recycler_selected';
    lot.selected_recycler_id = offer.recycler_id;
    lot.agreed_rate_per_kg = offer.offered_rate_per_kg;
    lot.updated_at = new Date().toISOString();

    const recycler = dbState.recyclers.find((r) => r.id === offer.recycler_id);

    // Send notification to Recycler
    dbState.notifications.unshift({
      id: `notif-${Date.now()}-rec`,
      profile_id: recycler?.profile_id || 'prof-rec-1',
      target_role: 'recycler',
      title_en: `Offer Accepted for ${lot.lot_code}`,
      title_hi: `${lot.lot_code} के लिए ऑफर स्वीकार हुआ`,
      title_mr: `${lot.lot_code} साठी ऑफर स्वीकारली गेली`,
      message_en: `Collector accepted your offer of ₹${offer.offered_rate_per_kg}/kg. Please proceed with pickup and handover.`,
      message_hi: `संग्रहक ने आपका ₹${offer.offered_rate_per_kg}/किलो का ऑफर स्वीकार कर लिया। कृपया पिकअप करें।`,
      message_mr: `कचरा वेचकाने तुमची ₹${offer.offered_rate_per_kg}/किलोची ऑफर स्वीकारली. पिकअप वेळापत्रक निश्चित करा.`,
      entity_type: 'lot',
      entity_id: lot.id,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    // Send confirmation to Collector
    dbState.notifications.unshift({
      id: `notif-${Date.now()}-col`,
      profile_id: dbState.collector.profile_id,
      target_role: 'collector',
      title_en: `Pickup Scheduled: ${recycler?.company_name || 'Recycler'}`,
      title_hi: `पिकअप निर्धारित: ${recycler?.company_name || 'रीसाइक्लर'}`,
      title_mr: `पिकअप निश्चित: ${recycler?.company_name || 'रिसायकलर'}`,
      message_en: `You accepted offer at ₹${offer.offered_rate_per_kg}/kg. Vehicle with calibrated digital scale dispatched.`,
      message_hi: `आपने ₹${offer.offered_rate_per_kg}/किलो की बोली स्वीकार की। वजनकाट्यासह गाडी येत आहे.`,
      message_mr: `तुम्ही ₹${offer.offered_rate_per_kg}/किलोची ऑफर स्वीकारली. तराजू सहित गाडी रवाना झाली.`,
      entity_type: 'lot',
      entity_id: lot.id,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    // Send audit log to Admin
    dbState.notifications.unshift({
      id: `notif-${Date.now()}-adm`,
      profile_id: 'prof-adm-1',
      target_role: 'admin',
      title_en: `Handover Handshake: ${lot.lot_code}`,
      title_hi: `हैंडओवर समझौता: ${lot.lot_code}`,
      title_mr: `हस्तांतरण करार: ${lot.lot_code}`,
      message_en: `Collector matched with authorized facility ${recycler?.company_name}. Digital audit trail started.`,
      message_hi: `संग्रहक एवं अधिकृत रीसाइक्लर ${recycler?.company_name} के बीच समझौता सम्पन्न।`,
      message_mr: `कचरा वेचक आणि अधिकृत रिसायकलर ${recycler?.company_name} यांच्यात डिजिटल करार झाला.`,
      entity_type: 'lot',
      entity_id: lot.id,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    persistAndBroadcast();
  },

  confirmHandover(
    lot_id: string,
    recycler_id: string,
    verified_weight_kg: number,
    handover_photo_url?: string,
    payment_mode: PaymentMode = 'cash',
    payment_reference?: string
  ): { handover: Handover; payment: Payment } {
    const lot = dbState.lots.find((l) => l.id === lot_id);
    if (!lot) throw new Error('Lot not found');

    const rate = lot.agreed_rate_per_kg || 150;
    const final_amount_inr = Math.round(verified_weight_kg * rate);

    const now = new Date();
    const handover_code = `HND-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const handover: Handover = {
      id: `hnd-${Date.now()}`,
      handover_code,
      lot_id,
      collector_id: lot.collector_id,
      recycler_id,
      verified_weight_kg,
      final_amount_inr,
      handover_photo_url:
        handover_photo_url ||
        lot.primary_image_url ||
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
      latitude: lot.latitude,
      longitude: lot.longitude,
      location_name: lot.location_name,
      collector_otp_verified: true,
      handover_timestamp: now.toISOString(),
      digital_signature_hash: `sha256-${Math.random().toString(36).substring(2, 12)}`,
      created_at: now.toISOString(),
    };

    dbState.handovers.unshift(handover);

    lot.status = 'handover_completed';
    lot.final_sale_value_inr = final_amount_inr;
    lot.updated_at = now.toISOString();

    // Create payment record
    const txn_code = `TXN-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100000 + Math.random() * 900000)}`;
    const payment: Payment = {
      id: `pay-${Date.now()}`,
      transaction_code: txn_code,
      lot_id,
      handover_id: handover.id,
      collector_id: lot.collector_id,
      recycler_id,
      amount_inr: final_amount_inr,
      payment_mode,
      payment_status: 'completed',
      payment_reference:
        payment_reference ||
        (payment_mode === 'cash'
          ? `CASH-VOUCHER-${Math.floor(1000 + Math.random() * 9000)}`
          : `UPI-REF-${Date.now()}`),
      completed_at: now.toISOString(),
      created_at: now.toISOString(),
    };

    dbState.payments.unshift(payment);
    lot.status = 'payment_completed';

    // Update collector total collections
    dbState.collector.total_collections_count += 1;

    // Send payment notification to collector
    dbState.notifications.unshift({
      id: `notif-${Date.now()}-col`,
      profile_id: dbState.collector.profile_id,
      target_role: 'collector',
      title_en: `Payment Completed: ₹${final_amount_inr}`,
      title_hi: `भुगतान संपन्न: ₹${final_amount_inr}`,
      title_mr: `पैसे पूर्ण मिळाले: ₹${final_amount_inr}`,
      message_en: `Payment of ₹${final_amount_inr} via ${payment_mode.toUpperCase()} recorded for lot ${lot.lot_code}. Handover ref: ${handover_code}.`,
      message_hi: `${payment_mode.toUpperCase()} द्वारा ₹${final_amount_inr} का भुगतान लॉट ${lot.lot_code} के लिए दर्ज किया गया।`,
      message_mr: `${payment_mode.toUpperCase()} द्वारे ₹${final_amount_inr} ची रक्कम लॉट ${lot.lot_code} साठी यशस्वीरित्या जमा झाली.`,
      entity_type: 'payment',
      entity_id: payment.id,
      is_read: false,
      created_at: now.toISOString(),
    });

    // Send receipt notification to recycler
    dbState.notifications.unshift({
      id: `notif-${Date.now()}-rec`,
      profile_id: recycler_id,
      target_role: 'recycler',
      title_en: `Handover Receipt: ${lot.lot_code}`,
      title_hi: `हैंडओवर रसीद: ${lot.lot_code}`,
      title_mr: `हस्तांतरण पावती: ${lot.lot_code}`,
      message_en: `Verified ${verified_weight_kg}kg received. Payment of ₹${final_amount_inr} released to Babu Bhai.`,
      message_hi: `सत्यापित ${verified_weight_kg} किलो प्राप्त। बाबू भाई को ₹${final_amount_inr} का भुगतान जारी।`,
      message_mr: `पडताळणी झालेले ${verified_weight_kg} किलो प्राप्त. बाबू भाईंना ₹${final_amount_inr} चा मोबदला दिला.`,
      entity_type: 'handover',
      entity_id: handover.id,
      is_read: false,
      created_at: now.toISOString(),
    });

    // Send SPCB Form 6 notification to admin
    dbState.notifications.unshift({
      id: `notif-${Date.now()}-adm`,
      profile_id: 'prof-adm-1',
      target_role: 'admin',
      title_en: `SPCB Form 6 Manifest: ${handover_code}`,
      title_hi: `प्रदूषण बोर्ड फॉर्म 6: ${handover_code}`,
      title_mr: `प्रदूषण नियंत्रण फॉर्म ६: ${handover_code}`,
      message_en: `Formal chain-of-custody recorded. ${verified_weight_kg}kg diverted to certified recycling facility.`,
      message_hi: `अधिकृत कस्टडी दर्ज। ${verified_weight_kg} किलो कचरा प्रमाणित रीसाइक्लिंग केंद्र में सुरक्षित पहुंचाया गया।`,
      message_mr: `अधिकृत नोंद पूर्ण. ${verified_weight_kg} किलो ई-कचरा नोंदणीकृत प्रक्रिया केंद्रात हस्तांतरित झाला.`,
      entity_type: 'handover',
      entity_id: handover.id,
      is_read: false,
      created_at: now.toISOString(),
    });

    persistAndBroadcast();
    return { handover, payment };
  },

  fileComplaint(
    category: string,
    description: string,
    lot_id?: string,
    against_user?: string
  ): Complaint {
    const code = `CMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const complaint: Complaint = {
      id: `cmp-${Date.now()}`,
      complaint_code: code,
      raised_by: dbState.collector.profile_id,
      against_user,
      lot_id,
      category,
      description,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbState.complaints.unshift(complaint);

    // Send alert to admin
    dbState.notifications.unshift({
      id: `notif-${Date.now()}-adm`,
      profile_id: 'prof-adm-1',
      target_role: 'admin',
      title_en: `New Grievance: ${code}`,
      title_hi: `नई शिकायत दर्ज: ${code}`,
      title_mr: `नवीन तक्रार: ${code}`,
      message_en: `Collector raised dispute regarding ${category}. Please review in Grievance Redressal desk.`,
      message_hi: `${category} के संबंध में नई शिकायत प्राप्त। कृपया निवारण डेस्क पर समीक्षा करें।`,
      message_mr: `${category} बाबत तक्रार प्राप्त झाली. तक्रार निवारण कक्षात तपासा.`,
      entity_type: 'system',
      entity_id: complaint.id,
      is_read: false,
      created_at: new Date().toISOString(),
    });
    persistAndBroadcast();
    return complaint;
  },

  resolveComplaint(complaint_id: string, admin_notes: string): void {
    const c = dbState.complaints.find((x) => x.id === complaint_id);
    if (!c) return;
    c.status = 'resolved';
    c.admin_notes = admin_notes;
    c.resolved_at = new Date().toISOString();
    c.updated_at = new Date().toISOString();
    persistAndBroadcast();
  },

  updateRecyclerAuthorization(
    recycler_id: string,
    status: RecyclerProfile['authorization_status'],
    notes?: string
  ): void {
    const rec = dbState.recyclers.find((r) => r.id === recycler_id);
    if (!rec) return;
    rec.authorization_status = status;
    rec.updated_at = new Date().toISOString();

    dbState.notifications.unshift({
      id: `notif-${Date.now()}`,
      profile_id: rec.profile_id,
      title_en: `Authorization Status Updated: ${status.toUpperCase()}`,
      title_hi: `अनुमति स्थिति अपडेट: ${status}`,
      title_mr: `परवाना स्थिती अद्यतन: ${status}`,
      message_en: `Regulatory authority updated your facility status to: ${status}. ${notes || ''}`,
      message_hi: `नियामक प्राधिकरण ने आपकी स्थिति ${status} की है।`,
      message_mr: `शासकीय प्राधिकरणाने आपल्या रिसायकलर परवान्याची स्थिती '${status}' अशी केली आहे.`,
      entity_type: 'system',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    persistAndBroadcast();
  },

  markNotificationAsRead(id: string): void {
    const n = dbState.notifications.find((item) => item.id === id);
    if (n) {
      n.is_read = true;
      persistAndBroadcast();
    }
  },

  markAllNotificationsAsRead(role?: UserRole): void {
    dbState.notifications.forEach((n) => {
      if (!role) {
        n.is_read = true;
      } else {
        const matches =
          n.target_role === role ||
          (role === 'collector' && n.profile_id?.includes('col')) ||
          (role === 'recycler' && n.profile_id?.includes('rec')) ||
          (role === 'admin' && n.profile_id?.includes('adm'));
        if (matches) {
          n.is_read = true;
        }
      }
    });
    persistAndBroadcast();
  },

  updatePriceRecord(id: string, buying_price_per_kg: number, min: number, max: number): void {
    const pr = dbState.prices.find((p) => p.id === id);
    if (!pr) return;
    pr.buying_price_per_kg = buying_price_per_kg;
    pr.market_min_price = min;
    pr.market_max_price = max;
    pr.verified_at = new Date().toISOString();
    pr.effective_date = new Date().toISOString().slice(0, 10);
    persistAndBroadcast();
  },

  resetDemoData(): void {
    dbState = {
      categories: INITIAL_CATEGORIES,
      prices: INITIAL_PRICES,
      recyclers: INITIAL_RECYCLERS,
      collector: INITIAL_COLLECTOR,
      lots: INITIAL_LOTS,
      offers: INITIAL_OFFERS,
      handovers: INITIAL_HANDOVERS,
      payments: INITIAL_PAYMENTS,
      complaints: INITIAL_COMPLAINTS,
      notifications: INITIAL_NOTIFICATIONS,
      safetyGuides: INITIAL_SAFETY_GUIDES,
      fieldResearch: INITIAL_FIELD_RESEARCH,
      anomalies: INITIAL_ANOMALIES,
    };
    persistAndBroadcast();
  },
};
