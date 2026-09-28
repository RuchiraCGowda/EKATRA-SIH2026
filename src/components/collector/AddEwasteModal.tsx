import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Scale,
  Sparkles,
  MapPin,
  ShieldCheck,
  Truck,
  IndianRupee,
  RotateCcw,
  Cpu,
  Check,
  Flame,
  Award,
  Image as ImageIcon,
  Smartphone,
  QrCode,
  Radio,
  Zap,
  Pickaxe,
} from 'lucide-react';
import { MaterialCategory, AppLanguage, RecyclerProfile, Lot } from '../../types/database';
import { getTranslation } from '../../lib/i18n';
import { AudioButton } from '../common/AudioButton';
import { EkatraDB } from '../../lib/supabase';
import { offlineSyncEngine } from '../../lib/offlineQueue';
import {
  recommendRecyclers,
  fetchAiRecyclerRecommendation,
  AiRecommendationResult,
} from '../../lib/recommendation';
import { getMaterialCategoryName } from '../../lib/materialHelpers';
import { identifyScrapMaterial, AiIdentificationResult } from '../../lib/aiMaterialIdentification';
import { compressImageFile } from '../../lib/imageUtils';
import { LiveCameraModal } from '../common/LiveCameraModal';
import { MetallurgyCard } from '../common/MetallurgyCard';

interface AddEwasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  categories: MaterialCategory[];
  onOpenLot?: (lot: Lot) => void;
  onTrackGps?: (lot: Lot) => void;
}

export const AddEwasteModal: React.FC<AddEwasteModalProps> = ({
  isOpen,
  onClose,
  lang,
  categories,
  onOpenLot,
  onTrackGps,
}) => {
  const t = getTranslation(lang);
  const [step, setStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory | null>(
    categories[0] || null
  );
  const [photoUrl, setPhotoUrl] = useState<string>(
    categories[0]?.image_url ||
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80'
  );
  // User wished custom weight input - supports any custom weight typed by user
  const [weightInput, setWeightInput] = useState<string>('15');
  const [locationName, setLocationName] = useState<string>('Dharavi 90ft Road Hub, Mumbai');
  const [latitude] = useState<number>(19.0435);
  const [longitude] = useState<number>(72.8567);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLotCode, setSubmittedLotCode] = useState<string | null>(null);
  const [createdLot, setCreatedLot] = useState<Lot | null>(null);
  const [generatedQrUrl, setGeneratedQrUrl] = useState<string>('');

  // AI-Based Material Identification & Permission States
  const [aiIdentification, setAiIdentification] = useState<AiIdentificationResult | null>(null);
  const [isIdentifyingAi, setIsIdentifyingAi] = useState<boolean>(false);
  const [showCameraPermissionDialog, setShowCameraPermissionDialog] = useState<boolean>(false);
  const [showGalleryPermissionDialog, setShowGalleryPermissionDialog] = useState<boolean>(false);
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // AI-Based Recycler Recommendation State
  const [aiResult, setAiResult] = useState<AiRecommendationResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [chosenRecyclerId, setChosenRecyclerId] = useState<string | null>(null);

  const parsedWeight = parseFloat(weightInput);
  const validWeight = isNaN(parsedWeight) || parsedWeight <= 0 ? 1 : parsedWeight;
  const currentRate = selectedCategory ? selectedCategory.benchmark_price_per_kg : 150;
  const estimatedTotal = Math.round(validWeight * currentRate);

  const recyclers = EkatraDB.getRecyclers();

  // Load AI Recommendation whenever category, weight, or step changes to 5
  useEffect(() => {
    let isMounted = true;
    if (step === 5 && selectedCategory) {
      setIsAiLoading(true);
      fetchAiRecyclerRecommendation(
        recyclers,
        selectedCategory,
        latitude,
        longitude,
        validWeight,
        locationName,
        lang
      )
        .then((result) => {
          if (isMounted && result) {
            setAiResult(result);
            setChosenRecyclerId(result.bestRecyclerId);
          }
        })
        .finally(() => {
          if (isMounted) setIsAiLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [step, selectedCategory, validWeight, lang, latitude, longitude, locationName]);

  if (!isOpen) return null;

  const handleCategorySelect = (cat: MaterialCategory) => {
    setSelectedCategory(cat);
    if (cat.image_url) {
      setPhotoUrl(cat.image_url);
    }
    setStep(2);
  };

  const handleWeightChange = (val: string) => {
    // Allows user to freely type their wished weight including decimals and any custom number
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setWeightInput(val);
    }
  };

  const handleKeypadPress = (action: string) => {
    if (action === 'clear') {
      setWeightInput('');
      return;
    }
    if (action === 'backspace') {
      setWeightInput((prev) => prev.slice(0, -1));
      return;
    }
    if (action === '.') {
      if (!weightInput.includes('.')) {
        setWeightInput((prev) => (prev === '' ? '0.' : prev + '.'));
      }
      return;
    }
    // Digit 0-9
    setWeightInput((prev) => (prev === '0' ? action : prev + action));
  };

  const handleAdjustWeight = (delta: number) => {
    const current = isNaN(parseFloat(weightInput)) ? 0 : parseFloat(weightInput);
    const updated = Math.max(0.1, Math.round((current + delta) * 10) / 10);
    setWeightInput(String(updated));
  };

  const handlePresetWeight = (preset: number) => {
    setWeightInput(String(preset));
  };

  const handleSubmitLot = async () => {
    if (!selectedCategory) return;
    setIsSubmitting(true);

    try {
      const net = offlineSyncEngine.getNetworkStatus();
      if (!net.isOnline) {
        offlineSyncEngine.enqueue('create_lot', {
          category_id: selectedCategory.id,
          approx_weight_kg: validWeight,
          location_name: locationName,
          latitude,
          longitude,
          primary_image_url: photoUrl,
          description: `${selectedCategory.name_en} collection from ${locationName}`,
          preferred_recycler_id: chosenRecyclerId,
        });
        setSubmittedLotCode('QUEUED-OFFLINE');
      } else {
        const created = EkatraDB.createLot(
          selectedCategory.id,
          validWeight,
          locationName,
          latitude,
          longitude,
          photoUrl,
          `${selectedCategory.name_en} collection from ${locationName}`,
          chosenRecyclerId || undefined
        );
        setSubmittedLotCode(created.lot_code);
        setCreatedLot(created);

        // Generate working scannable QR Code
        const payload = JSON.stringify({
          protocol: 'EKATRA_FORM6_V1',
          lotCode: created.lot_code,
          lotId: created.id,
          weightKg: created.approx_weight_kg,
          handoverOtp: created.handover_otp || created.lot_code.slice(-4),
          category: selectedCategory.name_en,
          location: locationName,
          manifestHash: `CPCB-${created.lot_code}`,
        });
        QRCode.toDataURL(payload, {
          width: 320,
          margin: 2,
          color: { dark: '#020617', light: '#ffffff' },
        })
          .then((url) => setGeneratedQrUrl(url))
          .catch((err) => console.error('Error generating lot QR code:', err));
      }
      setStep(6);
    } catch (e) {
      console.error(e);
      setErrorMessage(t.uploadErrorDesc);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageCaptured = (dataUrl: string) => {
    setPhotoUrl(dataUrl);
    const msg =
      lang === 'mr'
        ? 'कॅमेऱ्यातून फोटो यशस्वीरित्या घेतला!'
        : lang === 'hi'
        ? 'कैमरे से फोटो सफलतापूर्वक लिया गया!'
        : lang === 'gu'
        ? 'કેમેરામાંથી ફોટો સફળતાપૂર્વક લેવાયો!'
        : lang === 'ta'
        ? 'கேமராவில் இருந்து புகைப்படம் எடுக்கப்பட்டது!'
        : lang === 'te'
        ? 'కెమెరా నుండి ఫోటో విజయవంతంగా తీయబడింది!'
        : lang === 'kn'
        ? 'ಕ್ಯಾಮೆರಾದಿಂದ ಫೋಟೋ ಯಶಸ್ವಿಯಾಗಿ ಸೆರೆಹಿಡಿಯಲಾಗಿದೆ!'
        : 'Scrap photo captured from camera!';
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 3500);

    // Trigger AI scrap material recognition on newly captured real photo
    identifyScrapMaterial(dataUrl, categories, lang)
      .then((res) => {
        setAiIdentification(res);
        setSelectedCategory(res.matchedCategory);
      })
      .catch(() => {});
    setStep((s) => (s === 1 ? 2 : s));
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file);
      setPhotoUrl(compressed);
      const msg =
        lang === 'mr'
          ? 'फोटो यशस्वीरित्या जोडला गेला!'
          : lang === 'hi'
          ? 'फोटो सफलतापूर्वक जोड़ा गया!'
          : lang === 'gu'
          ? 'ફોટો સફળતાપૂર્વક ઉમેરાયો!'
          : lang === 'ta'
          ? 'புகைப்படம் வெற்றிகரமாக சேர்க்கப்பட்டது!'
          : lang === 'te'
          ? 'ఫోటో విజయవంతంగా జోడించబడింది!'
          : lang === 'kn'
          ? 'ಫೋಟೋ ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ!'
          : 'Scrap photo updated!';
      setSuccessNotice(msg);
      setTimeout(() => setSuccessNotice(null), 3500);

      // Run AI identification on the newly loaded photo
      identifyScrapMaterial(compressed, categories, lang)
        .then((res) => {
          setAiIdentification(res);
          setSelectedCategory(res.matchedCategory);
        })
        .catch(() => {});
      setStep((s) => (s === 1 ? 2 : s));
    } catch (err) {
      console.error('File load error:', err);
      setErrorMessage(t.uploadErrorDesc || 'Unable to process selected image');
    } finally {
      e.target.value = '';
    }
  };

  const handleOpenLiveCamera = () => {
    setIsLiveCameraOpen(true);
  };

  const handleOpenNativeCamera = () => {
    cameraInputRef.current?.click();
  };

  const handleOpenGallery = () => {
    galleryInputRef.current?.click();
  };

  const handleTriggerAiScan = async () => {
    setIsIdentifyingAi(true);
    setErrorMessage(null);
    try {
      const result = await identifyScrapMaterial(photoUrl, categories, lang);
      setAiIdentification(result);
      setSelectedCategory(result.matchedCategory);
      setStep(2);
    } catch {
      setErrorMessage(t.aiUnavailableDesc);
    } finally {
      setIsIdentifyingAi(false);
    }
  };

  const getCategoryName = (cat: MaterialCategory) => {
    return getMaterialCategoryName(cat, lang);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Hidden Global Native Inputs for Camera and Gallery */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileInputChange}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm flex items-center justify-center border border-emerald-500/30">
              {step <= 5 ? step : 5}/5
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              {step === 1 && t.step1Title}
              {step === 2 && t.step2Title}
              {step === 3 && (lang === 'mr' ? '३. तुमचे हवे असलेले वजन टाका' : lang === 'hi' ? '३. अपना मनचाहा वजन दर्ज करें' : '3. Enter Your Custom Weight')}
              {step === 4 && t.step4Title}
              {step === 5 && (lang === 'mr' ? '५. AI-आधारित सर्वोत्कृष्ट रीसाइक्लर' : lang === 'hi' ? '५. AI-आधारित सर्वश्रेष्ठ रीसाइक्लर' : '5. AI Multi-Factor Best Recycler')}
              {step === 6 && t.lotCreatedSuccess}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/60"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Localized Error / Notice Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-300 hover:text-white px-2 py-0.5"
              >
                ✕
              </button>
            </div>
          )}

          {/* STEP 1: CATEGORY SELECTION */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm text-slate-400">{t.step1Desc}</p>
                <AudioButton
                  textToSpeak={
                    lang === 'mr'
                      ? 'तुमच्याकडे असलेला कचरा निवडा किंवा एआय स्कॅन वापरा.'
                      : lang === 'hi'
                      ? 'अपने ई-कचरे की श्रेणी चुनें या एआई स्कैन का उपयोग करें।'
                      : lang === 'gu'
                      ? 'તમારી પાસે રહેલ ઈ-કચરાની શ્રેણી પસંદ કરો અથવા AI સ્કેન વાપરો.'
                      : lang === 'ta'
                      ? 'விற்பனை செய்ய உங்களிடம் உள்ள மின்னணுக் கழிவு வகையைத் தேர்வு செய்யவும் அல்லது AI ஸ்கேனைப் பயன்படுத்தவும்.'
                      : lang === 'te'
                      ? 'మీ వద్ద ఉన్న ఈ-వ్యర్థాల రకాన్ని ఎంచుకోండి లేదా AI స్కాన్ ఉపయోగించండి.'
                      : lang === 'kn'
                      ? 'ನಿಮ್ಮ ಬಳಿ ಇರುವ ಇ-ತ್ಯಾಜ್ಯದ ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ AI ಸ್ಕ್ಯಾನ್ ಬಳಸಿ.'
                      : 'Select what e-waste material you have to sell or use AI scan.'
                  }
                  lang={lang}
                  size="sm"
                />
              </div>

              {/* Instant AI Material Identification Scan Action */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleTriggerAiScan}
                  disabled={isIdentifyingAi}
                  className="w-full p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-teal-950/60 to-slate-800 border-2 border-emerald-500/50 hover:border-emerald-400 text-left flex items-center justify-between shadow-lg active:scale-[0.99] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                      <Sparkles className={`w-5 h-5 ${isIdentifyingAi ? 'animate-spin' : 'group-hover:scale-110'}`} />
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-100 text-sm block">
                        {isIdentifyingAi ? t.aiScanning : t.aiScanButton}
                      </span>
                      <span className="text-[11px] text-emerald-300/90 font-medium">
                        {lang === 'mr'
                          ? 'फोटोवरून अचूक धातू व सुरक्षिततेचे नियम ओळखा'
                          : lang === 'hi'
                          ? 'फोटो से तुरंत सामग्री और सुरक्षा नियम पहचानें'
                          : 'Identifies material, hazard warnings and fair benchmark'}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleOpenLiveCamera}
                    className="py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500/40 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{lang === 'mr' ? 'कॅमेऱ्याने स्कॅन करा' : lang === 'hi' ? 'कैमरे से फोटो लें' : 'Scan via Camera'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenGallery}
                    className="py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 hover:border-teal-500/40 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>{lang === 'mr' ? 'गॅलरीतून निवडा' : lang === 'hi' ? 'गैलरी से चुनें' : 'Choose Gallery'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat)}
                    className="group relative p-3 sm:p-4 rounded-2xl bg-slate-800/60 hover:bg-emerald-950/30 border border-slate-700 hover:border-emerald-500/50 transition-all text-left flex flex-col justify-between overflow-hidden shadow-lg active:scale-95"
                  >
                    <div className="h-24 sm:h-28 w-full rounded-xl overflow-hidden mb-3 bg-slate-900">
                      <img
                        src={cat.image_url}
                        alt={getCategoryName(cat)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 text-sm sm:text-base leading-snug">
                        {getCategoryName(cat)}
                      </div>
                      <div className="mt-1 text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <span>₹{cat.benchmark_price_per_kg}</span>
                        <span className="text-slate-400 font-normal">/ kg</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: PHOTO */}
          {step === 2 && selectedCategory && (
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-between text-left">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    {getCategoryName(selectedCategory)}
                  </h3>
                  <p className="text-xs text-slate-400">{t.step2Desc}</p>
                </div>
                <AudioButton
                  textToSpeak={
                    lang === 'mr'
                      ? 'कचऱ्याचा स्पष्ट फोटो घ्या. कॅमेरा बटण दाबा.'
                      : lang === 'hi'
                      ? 'सामान का साफ फोटो खींचें या गैलरी से चुनें।'
                      : lang === 'gu'
                      ? 'ઈ-કચરાનો સ્પષ્ટ ફોટો પાડો અથવા ગેલેરીમાંથી પસંદ કરો.'
                      : lang === 'ta'
                      ? 'மின்னணுக் கழிவின் தெளிவான புகைப்படத்தை எடுக்கவும் அல்லது கேலரியில் இருந்து தேர்வு செய்யவும்.'
                      : lang === 'te'
                      ? 'ఈ-వ్యర్థాల స్పష్టమైన ఫోటో తీయండి లేదా గ్యాలరీ నుండి ఎంచుకోండి.'
                      : lang === 'kn'
                      ? 'ಇ-ತ್ಯಾಜ್ಯದ ಸ್ಪಷ್ಟ ಫೋಟೋ ತೆಗೆಯಿರಿ ಅಥವಾ ಗ್ಯಾಲರಿಯಿಂದ ಆಯ್ಕೆಮಾಡಿ.'
                      : 'Take a clear photograph of your e-waste scrap.'
                  }
                  lang={lang}
                  size="sm"
                />
              </div>

              <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-emerald-500/40 bg-slate-800/40 p-2 max-w-sm mx-auto">
                <img
                  src={photoUrl}
                  alt="Scrap Preview"
                  className="w-full h-48 sm:h-56 object-cover rounded-xl shadow-md"
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    type="button"
                    onClick={handleOpenLiveCamera}
                    className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-transform"
                    title={t.takePhoto || 'Open Camera'}
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenGallery}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-transform"
                    title={lang === 'mr' ? 'गॅलरीतून निवडा' : lang === 'hi' ? 'गैलरी से चुनें' : 'Choose from Gallery'}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Large, Touch-Friendly Action Buttons for Camera and Gallery */}
              <div className="max-w-sm mx-auto space-y-2">
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleOpenLiveCamera}
                    className="py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                  >
                    <Camera className="w-4 h-4 shrink-0" />
                    <span>{t.takePhoto || 'Take Photo'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenGallery}
                    className="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                  >
                    <ImageIcon className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>{lang === 'mr' ? 'गॅलरीतून निवडा' : lang === 'hi' ? 'गैलरी से चुनें' : 'Gallery'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                  <button
                    type="button"
                    onClick={handleOpenNativeCamera}
                    className="hover:text-emerald-400 underline underline-offset-2 flex items-center gap-1"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{lang === 'mr' ? 'फोन कॅमेरा ॲपने फोटो काढा' : lang === 'hi' ? 'फोन कैमरा ऐप से फोटो लें' : 'Open phone camera app directly'}</span>
                  </button>
                </div>
              </div>

              {/* Success Notification Banner */}
              {successNotice && (
                <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-center gap-2 shadow-lg animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">{successNotice}</span>
                </div>
              )}

              {/* AI Material Identification Card & Metallurgical Breakdown if available */}
              {aiIdentification ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/70 to-slate-850 border-2 border-emerald-500/50 space-y-3 text-left shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold uppercase text-emerald-400">
                          {t.aiIdentifiedTitle}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          aiIdentification.isHighConfidence
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {aiIdentification.confidenceMessage}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-base font-extrabold text-slate-100">
                        {aiIdentification.localizedName}
                      </span>
                      <AudioButton textToSpeak={aiIdentification.speechText} lang={lang} size="sm" />
                    </div>

                    {/* Localized Safety Guidance */}
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{aiIdentification.safetyWarning}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-slate-300 font-medium">{t.aiConfirmPrompt}</span>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-emerald-400 hover:underline font-semibold"
                      >
                        {t.aiChangeMaterial} →
                      </button>
                    </div>
                  </div>

                  {/* Scientific Metallurgical & Mineral Percentage Breakdown Card */}
                  <MetallurgyCard
                    metallurgy={aiIdentification.metallurgy}
                    approxWeightKg={validWeight || 15}
                    lang={lang}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleTriggerAiScan}
                  disabled={isIdentifyingAi}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  {isIdentifyingAi ? t.aiScanning : t.aiScanButton}
                </button>
              )}

              {/* SIH One-Click Demo Samples Strip for SIH Judges */}
              <div className="p-2.5 rounded-2xl bg-slate-850/80 border border-slate-700/80 max-w-sm mx-auto space-y-1.5 text-left">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-amber-300">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>SIH Judges Instant Demo Samples:</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Tap to scan</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    {
                      title: 'PCB',
                      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
                    },
                    {
                      title: 'Copper',
                      url: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=600&q=80',
                    },
                    {
                      title: 'Battery',
                      url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
                    },
                    {
                      title: 'Mobile',
                      url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
                    },
                    {
                      title: 'CRT/Yoke',
                      url: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=600&q=80',
                    },
                  ].map((s) => (
                    <button
                      key={s.title}
                      type="button"
                      onClick={() => {
                        setPhotoUrl(s.url);
                        identifyScrapMaterial(s.url, categories, lang).then((res) => {
                          setAiIdentification(res);
                          setSelectedCategory(res.matchedCategory);
                        });
                      }}
                      className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 flex flex-col items-center gap-0.5 transition-all group"
                    >
                      <img
                        src={s.url}
                        alt={s.title}
                        className="w-10 h-8 object-cover rounded-md group-hover:scale-105 transition-transform"
                      />
                      <span className="text-[9px] text-slate-300 font-semibold">{s.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {lang === 'mr'
                  ? 'धीम्या २G/३G नेटवर्कवर आपोआप इमेज कॉम्प्रेस केली जाते.'
                  : lang === 'hi'
                  ? 'कम नेटवर्क स्पीड (2G/3G) के लिए फोटो का आकार स्वतः अनुकूलित होता है।'
                  : 'Automatic image compression enabled for low-bandwidth 2G/3G speeds.'}
              </p>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t.backAction}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                >
                  {t.nextAction}: {t.weightValidationMsg.split(' ')[0] || 'Weight'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CUSTOM WEIGHT ENTRY (Direct user typing + quick presets) */}
          {step === 3 && selectedCategory && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    {getCategoryName(selectedCategory)}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'mr'
                      ? 'कीबोर्डने हवे ते अचूक वजन टाईप करा किंवा खालील बटणे वापरा'
                      : lang === 'hi'
                      ? 'कीबोर्ड से जो वजन चाहें टाइप करें या नीचे दिए बटन दबाएं'
                      : 'Type your exact wished weight directly, or use quick presets'}
                  </p>
                </div>
                <AudioButton
                  textToSpeak={
                    lang === 'mr'
                      ? `तुम्हाला हवे असलेले वजन तुम्ही स्वतः टाईप करू शकता. सध्या ${validWeight} किलो निवडले आहे.`
                      : lang === 'hi'
                      ? `आप अपनी मर्जी से जो वजन चाहें टाइप कर सकते हैं। अभी ${validWeight} किलो दर्ज है।`
                      : lang === 'gu'
                      ? `તમે ઇચ્છો તે ચોક્કસ વજન ટાઇપ કરી શકો છો. હાલ ${validWeight} કિગ્રા નોંધાયેલ છે.`
                      : lang === 'ta'
                      ? `நீங்கள் விரும்பும் துல்லியமான எடையைத் தட்டச்சு செய்யலாம். தற்போது ${validWeight} கிலோ தேர்ந்தெடுக்கப்பட்டுள்ளது.`
                      : lang === 'te'
                      ? `మీరు కోరుకున్న ఖచ్చితమైన బరువును టైప్ చేయవచ్చు. ప్రస్తుతం ${validWeight} కిలోలు ఎంపిక చేయబడింది.`
                      : lang === 'kn'
                      ? `ನಿಮಗೆ ಬೇಕಾದ ನಿಖರ ತೂಕವನ್ನು ನೀವು ಟೈಪ್ ಮಾಡಬಹುದು. ಪ್ರಸ್ತುತ ${validWeight} ಕೆಜಿ ನಮೂದಿಸಲಾಗಿದೆ.`
                      : `You can type any custom weight you wish. Currently ${validWeight} kilograms.`
                  }
                  lang={lang}
                  size="sm"
                />
              </div>

              {/* Large Interactive Digital Scale Display with Editable Custom Input */}
              <div className="p-6 rounded-3xl bg-slate-800/90 border-2 border-emerald-500/50 shadow-xl text-center space-y-3 relative group">
                <span className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider flex items-center justify-center gap-1.5">
                  <Scale className="w-4 h-4" />
                  {lang === 'mr' ? 'अचूक वजन नोंदणी (किलोमध्ये)' : lang === 'hi' ? 'सटीक वजन दर्ज करें (किलोग्राम)' : 'Custom Weight Input (kg)'}
                </span>

                <div className="flex items-center justify-center gap-3">
                  <div className="relative inline-flex items-center">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={weightInput}
                      onChange={(e) => handleWeightChange(e.target.value)}
                      placeholder="0"
                      autoFocus
                      className="w-48 sm:w-56 text-5xl sm:text-6xl font-black text-center text-white bg-slate-900/90 border-2 border-emerald-400 rounded-2xl py-2 px-3 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all font-mono shadow-inner"
                    />
                    {weightInput !== '' && (
                      <button
                        type="button"
                        onClick={() => handleKeypadPress('clear')}
                        className="absolute right-3 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors text-xs font-bold"
                        title="Clear Weight"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <span className="text-2xl sm:text-3xl font-bold text-emerald-400">kg</span>
                </div>

                <p className="text-xs text-slate-400 font-medium">
                  {lang === 'mr'
                    ? `तपासा: ₹${currentRate}/किलो दराने अंदाजे मूल्य: ₹${estimatedTotal}`
                    : lang === 'hi'
                    ? `रेट: ₹${currentRate}/किलो के हिसाब से अनुमानित मूल्य: ₹${estimatedTotal}`
                    : lang === 'gu'
                    ? `ભાવ: ₹${currentRate}/કિલો મુજબ અંદાજિત રકમ: ₹${estimatedTotal}`
                    : lang === 'ta'
                    ? `மதிப்பு: ₹${currentRate}/கிலோ படி மதிப்பிடப்பட்ட தொகை: ₹${estimatedTotal}`
                    : lang === 'te'
                    ? `ధర: ₹${currentRate}/కిలో ప్రకారం అంచనా విలువ: ₹${estimatedTotal}`
                    : lang === 'kn'
                    ? `ದರ: ₹${currentRate}/ಕೆಜಿ ಪ್ರಕಾರ ಅಂದಾಜು ಮೌಲ್ಯ: ₹${estimatedTotal}`
                    : `Benchmark Rate: ₹${currentRate}/kg • Approx Value: ₹${estimatedTotal}`}
                </p>
              </div>

              {/* On-screen Touch Keypad for effortless custom weight input */}
              <div className="bg-slate-900/85 p-3 rounded-2xl border border-slate-700/80 max-w-xs mx-auto shadow-inner">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                  {lang === 'mr' ? 'कीपॅडद्वारे अचूक वजन नोंदवा:' : lang === 'hi' ? 'कीपैड से मनचाहा वजन दर्ज करें:' : 'Direct Weight Keypad:'}
                </span>
                <div className="grid grid-cols-3 gap-2 text-base font-bold">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleKeypadPress(k === '⌫' ? 'backspace' : k)}
                      className={`py-2 rounded-xl border transition-all active:scale-95 flex items-center justify-center font-mono ${
                        k === '⌫'
                          ? 'bg-rose-950/40 border-rose-700/50 text-rose-300 hover:bg-rose-900/50'
                          : k === '.'
                          ? 'bg-slate-800 border-slate-600 text-emerald-400 hover:bg-slate-700'
                          : 'bg-slate-800/90 border-slate-700 text-slate-100 hover:bg-slate-700'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Preset Buttons (1, 5, 10, 25, 50, 100 kg) */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  {lang === 'mr' ? 'जलद वजन पर्याय (Quick Presets):' : lang === 'hi' ? 'त्वरित वजन विकल्प:' : 'Quick Presets:'}
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {[1, 5, 10, 25, 50, 100].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetWeight(preset)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                        validWeight === preset
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {preset} kg
                    </button>
                  ))}
                </div>
              </div>

              {/* Fine-Tuning Step Adjusters (+1, +5, +10, -1, -5, -10) */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  {lang === 'mr' ? 'बारीक बदल करा (Fine Tune):' : lang === 'hi' ? 'कम / ज्यादा करें:' : 'Fine Tune Weight:'}
                </span>
                <div className="grid grid-cols-6 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleAdjustWeight(-10)}
                    className="py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold hover:bg-slate-700 active:scale-95"
                  >
                    -10
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustWeight(-5)}
                    className="py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold hover:bg-slate-700 active:scale-95"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustWeight(-1)}
                    className="py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold hover:bg-slate-700 active:scale-95"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustWeight(1)}
                    className="py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold hover:bg-emerald-900/60 active:scale-95"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustWeight(5)}
                    className="py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold hover:bg-emerald-900/60 active:scale-95"
                  >
                    +5
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustWeight(10)}
                    className="py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold hover:bg-emerald-900/60 active:scale-95"
                  >
                    +10
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t.backAction}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (validWeight <= 0) {
                      setErrorMessage(t.weightValidationMsg);
                      return;
                    }
                    setStep(4);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                >
                  {t.nextAction}: {t.estimatedValue}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: VALUATION */}
          {step === 4 && selectedCategory && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    {t.step4Title}
                  </h3>
                  <p className="text-xs text-slate-400">{t.step4Desc}</p>
                </div>
                <AudioButton
                  textToSpeak={
                    lang === 'mr'
                      ? `${validWeight} किलो ${getCategoryName(selectedCategory)} चे अंदाजित मूल्य ₹${estimatedTotal} रुपये आहे. सरकारी मान्य भाव ₹${currentRate} प्रति किलो आहे.`
                      : lang === 'hi'
                      ? `${validWeight} किलो का अनुमानित मूल्य ₹${estimatedTotal} रुपये है। रेट ₹${currentRate} प्रति किलो है।`
                      : lang === 'gu'
                      ? `${validWeight} કિગ્રા ${getCategoryName(selectedCategory)} ની અંદાજિત કિંમત ₹${estimatedTotal} છે. સરકારી માન્ય દર ₹${currentRate} પ્રતિ કિલો છે.`
                      : lang === 'ta'
                      ? `${validWeight} கிலோ ${getCategoryName(selectedCategory)} இன் மதிப்பிடப்பட்ட மதிப்பு ₹${estimatedTotal} ரூபாய். அரசு அங்கீகரிக்கப்பட்ட விலை ஒரு கிலோவுக்கு ₹${currentRate} ரூபாய்.`
                      : lang === 'te'
                      ? `${validWeight} కిలోల ${getCategoryName(selectedCategory)} అంచనా విలువ ₹${estimatedTotal} రూపాయలు. ప్రభుత్వ ధర కిలోకు ₹${currentRate} రూపాయలు.`
                      : lang === 'kn'
                      ? `${validWeight} ಕೆಜಿ ${getCategoryName(selectedCategory)} ನ ಅಂದಾಜು ಮೌಲ್ಯ ₹${estimatedTotal} ರೂಪಾಯಿ. ಸರ್ಕಾರಿ ದರ ಪ್ರತಿ ಕೆಜಿಗೆ ₹${currentRate} ರೂಪಾಯಿ.`
                      : `Estimated total value is ${estimatedTotal} Rupees based on ${currentRate} Rupees per kilogram benchmark for ${validWeight} kilograms.`
                  }
                  lang={lang}
                  size="sm"
                />
              </div>

              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-800 to-teal-950/60 border border-emerald-500/40 text-center space-y-3 shadow-xl">
                <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                  {t.estimatedValue}
                </span>
                <div className="flex items-center justify-center gap-1 text-white">
                  <span className="text-3xl font-bold text-emerald-400">₹</span>
                  <span className="text-5xl font-black tracking-tight">{estimatedTotal}</span>
                </div>
                <div className="text-xs text-slate-300 flex items-center justify-center gap-3 pt-1">
                  <span className="font-bold text-emerald-300 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-700">
                    {validWeight} kg
                  </span>
                  <span>×</span>
                  <span className="font-semibold text-emerald-400">₹{currentRate}/kg</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <p>{t.approxValueNotice}</p>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t.backAction}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                >
                  {t.nextAction}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: AI-BASED BEST RECYCLER RECOMMENDATION */}
          {step === 5 && selectedCategory && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <h3 className="text-sm font-bold text-slate-100">
                      {lang === 'mr'
                        ? 'AI द्वारे सर्व घटकांवरून सर्वोत्तम खरेदीदार'
                        : lang === 'hi'
                        ? 'AI द्वारा सभी मानकों पर सर्वश्रेष्ठ रीसाइक्लर'
                        : 'AI Multi-Factor Best Recycler Selection'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    {lang === 'mr'
                      ? 'वजन, अंतर, सरकारी परवाना, डिजिटल तराजू आणि सुरक्षिततेचे AI विश्लेषण'
                      : lang === 'hi'
                      ? 'वजन, दूरी, सरकारी लाइसेंस, डिजिटल स्केल और सुरक्षा का AI विश्लेषण'
                      : 'Evaluates distance, CPCB Form 6 status, calibrated scale & fair price'}
                  </p>
                </div>
                <AudioButton
                  textToSpeak={
                    aiResult?.localizedReasoning ||
                    (lang === 'mr'
                      ? 'तुमच्या मालासाठी आणि वजनासाठी एआयने सर्वात योग्य शासकीय परवानाधारक रीसाइक्लर निवडला आहे.'
                      : lang === 'hi'
                      ? 'आपके माल और वजन के लिए एआई ने सबसे उपयुक्त सरकारी रीसाइक्लर चुना है।'
                      : lang === 'gu'
                      ? 'તમારા માલ અને વજન માટે AI દ્વારા શ્રેષ્ઠ સરકાર માન્ય રિસાયકલર પસંદ કરાયેલ છે.'
                      : lang === 'ta'
                      ? 'உங்கள் பொருள் மற்றும் எடைக்கு AI சிறந்த அங்கீகரிக்கப்பட்ட மறுசுழற்சியாளரைத் தேர்ந்தெடுத்துள்ளது.'
                      : lang === 'te'
                      ? 'మీ మెటీరియల్ మరియు బరువు కోసం AI ఉత్తమ రీసైక్లర్‌ను ఎంపిక చేసింది.'
                      : lang === 'kn'
                      ? 'ನಿಮ್ಮ ಸರಕು ಮತ್ತು ತೂಕಕ್ಕಾಗಿ AI ಅತ್ಯುತ್ತಮ ಅಧಿಕೃತ ಮರುಬಳಕೆದಾರರನ್ನು ಆಯ್ಕೆ ಮಾಡಿದೆ.'
                      : 'AI has selected the optimal authorized recycler based on distance, calibrated scale, and compliance.')
                  }
                  lang={lang}
                  size="sm"
                />
              </div>

              {/* AI Loading State */}
              {isAiLoading && (
                <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="text-xs text-slate-300 font-semibold">
                    {lang === 'mr'
                      ? 'सर्व घटकांवरून सर्वोत्तम रीसाइक्लर शोधत आहे...'
                      : lang === 'hi'
                      ? 'सभी मानकों के आधार पर सबसे अच्छा रीसाइक्लर चुना जा रहा है...'
                      : 'AI evaluating all 7 compliance, route, scale & pricing factors...'}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Checking CPCB/MPCB authorizations, transport emissions, calibrated scale availability...
                  </p>
                </div>
              )}

              {/* AI Recommendation Result Card */}
              {!isAiLoading && aiResult && (
                <div className="space-y-3">
                  {/* AI Match Callout Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-2 border-emerald-500/50 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-black uppercase text-emerald-400 tracking-wider">
                        <Award className="w-4 h-4 text-emerald-400" />
                        AI Verified Best Match
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {aiResult.confidenceScore}% AI Confidence
                      </span>
                    </div>

                    {/* AI Localized Rationale */}
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/30 text-xs text-slate-200 leading-relaxed font-medium">
                      "{aiResult.localizedReasoning}"
                    </div>

                    {/* Multi-Factor Radar / Metric Bars */}
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Factor Weighting Analysis:
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg">
                          <span className="text-slate-400">CPCB Compliance:</span>
                          <span className="font-bold text-emerald-400">
                            {aiResult.factorScores.regulatoryCompliance}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg">
                          <span className="text-slate-400">Digital Scale Pickup:</span>
                          <span className="font-bold text-emerald-400">
                            {aiResult.factorScores.doorstepEquipment}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg">
                          <span className="text-slate-400">Low-Emission Route:</span>
                          <span className="font-bold text-teal-300">
                            {aiResult.factorScores.proximityAndCarbon}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg">
                          <span className="text-slate-400">Material Specialization:</span>
                          <span className="font-bold text-teal-300">
                            {aiResult.factorScores.materialSuitability}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recyclers Selection List */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold text-slate-300 block">
                      {lang === 'mr' ? 'खरेदीदार निवडा:' : lang === 'hi' ? 'रीसाइक्लर चुनें:' : 'Select Recycler for Handover:'}
                    </span>
                    {recyclers.map((r) => {
                      const isAiTop = r.id === aiResult.bestRecyclerId;
                      const isSelected = r.id === (chosenRecyclerId || aiResult.bestRecyclerId);

                      return (
                        <div
                          key={r.id}
                          onClick={() => setChosenRecyclerId(r.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                            isSelected
                              ? 'bg-slate-800/95 border-emerald-500 shadow-lg ring-1 ring-emerald-500'
                              : 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/70'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2.5">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 border ${
                                  isSelected
                                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                    : 'border-slate-600 bg-slate-900'
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-100 text-sm">
                                    {r.company_name}
                                  </span>
                                  {isAiTop && (
                                    <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                      AI Pick
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-500" />
                                    {r.facility_address.split(',')[0]}
                                  </span>
                                  <span className="flex items-center gap-1 text-teal-400 font-medium">
                                    <Truck className="w-3 h-3" />
                                    Doorstep Pickup
                                  </span>
                                </div>
                              </div>
                            </div>

                            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-500/30">
                              ₹{currentRate}/kg
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 bg-slate-900/60 px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                            <span>Capacity: {r.capacity_per_month_mt} MT/mo</span>
                            <span className="text-emerald-400 font-medium">
                              Form 6 Certified • Calibrated Scale
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t.backAction}
                </button>
                <button
                  onClick={handleSubmitLot}
                  disabled={isSubmitting || isAiLoading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-emerald-600/30 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? t.loading : t.submitLot}
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: SUCCESS */}
          {step === 6 && (
            <div className="text-center py-4 space-y-4 max-w-sm mx-auto">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border-2 border-emerald-500/40 animate-bounce">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-100">
                  {t.lotCreatedSuccess}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Lot Reference:{' '}
                  <span className="font-mono text-emerald-400 font-bold">
                    {submittedLotCode}
                  </span>
                </p>
              </div>

              {/* Working QR Code Card */}
              {generatedQrUrl && (
                <div className="bg-white p-3.5 rounded-2xl shadow-xl border-2 border-slate-700/40 inline-block">
                  <img
                    src={generatedQrUrl}
                    alt="Lot QR Code"
                    className="w-44 h-44 object-contain mx-auto rounded-lg"
                  />
                  <div className="flex items-center justify-center gap-1 mt-1 text-[10px] font-mono font-bold text-slate-800">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>CPCB Form 6 Verified Pass</span>
                  </div>
                </div>
              )}

              {/* Recycler Handover OTP */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 border border-amber-500/30 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">
                  {t.handoverCode} (OTP for Recycler)
                </span>
                <span className="font-mono text-2xl font-black text-white tracking-widest">
                  {createdLot?.handover_otp || submittedLotCode?.slice(-4)}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">{t.showToRecycler}</p>
              </div>

              {/* Summary Details */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Material:</span>
                  <span className="font-semibold text-slate-100">
                    {selectedCategory && getCategoryName(selectedCategory)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Entered Weight:</span>
                  <span className="font-extrabold text-emerald-400">{validWeight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. Total Payout:</span>
                  <span className="font-bold text-emerald-400">₹{estimatedTotal}</span>
                </div>
                {chosenRecyclerId && (
                  <div className="flex justify-between pt-1 border-t border-slate-700/60">
                    <span className="text-slate-400">Assigned Recycler:</span>
                    <span className="font-semibold text-teal-300 truncate max-w-[160px]">
                      {recyclers.find((r) => r.id === chosenRecyclerId)?.company_name}
                    </span>
                  </div>
                )}
              </div>

              {/* Primary Actions: Open Lot & Track GPS */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = createdLot || {
                      id: `lot-${Date.now()}`,
                      lot_code: submittedLotCode || 'LOT-NEW',
                      collector_id: 'col-1',
                      category_id: selectedCategory?.id || 'cat-pcb',
                      approx_weight_kg: validWeight,
                      estimated_value_inr: estimatedTotal,
                      category: selectedCategory || undefined,
                      location_name: locationName,
                      latitude,
                      longitude,
                      status: 'collected',
                      handover_otp: submittedLotCode?.slice(-4),
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    } as Lot;
                    onClose();
                    if (onOpenLot) {
                      onOpenLot(target);
                    }
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Open Lot & View Digital Pass</span>
                </button>

                {onTrackGps && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = createdLot || {
                        id: `lot-${Date.now()}`,
                        lot_code: submittedLotCode || 'LOT-NEW',
                        collector_id: 'col-1',
                        category_id: selectedCategory?.id || 'cat-pcb',
                        approx_weight_kg: validWeight,
                        estimated_value_inr: estimatedTotal,
                        category: selectedCategory || undefined,
                        location_name: locationName,
                        latitude,
                        longitude,
                        status: 'collected',
                        handover_otp: submittedLotCode?.slice(-4),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                      } as Lot;
                      onClose();
                      onTrackGps(target);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-300 hover:text-amber-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow"
                  >
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>Track Material GPS Route</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  {t.close}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Localized Camera Permission Dialog */}
      {showCameraPermissionDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 max-w-sm w-full rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
              <Camera className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-base">{t.cameraPermissionTitle}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {t.cameraPermissionDesc}
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCameraPermissionDialog(false);
                  handleOpenLiveCamera();
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                <span>{lang === 'mr' ? 'कॅमेरा उघडा' : lang === 'hi' ? 'कैमरा खोलें' : 'Open Camera'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCameraPermissionDialog(false);
                  handleOpenNativeCamera();
                }}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{lang === 'mr' ? 'फोनचा कॅमेरा ॲप वापरा' : lang === 'hi' ? 'फोन कैमरा ऐप का उपयोग करें' : 'Use Device Camera App'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCameraPermissionDialog(false)}
                className="w-full py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Localized Gallery Permission Dialog */}
      {showGalleryPermissionDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 max-w-sm w-full rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
              <ImageIcon className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-base">{t.galleryPermissionTitle}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {t.galleryPermissionDesc}
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowGalleryPermissionDialog(false);
                  handleOpenGallery();
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center justify-center gap-1.5"
              >
                <ImageIcon className="w-4 h-4" />
                <span>{lang === 'mr' ? 'गॅलरी उघडा' : lang === 'hi' ? 'गैलरी खोलें' : 'Open Photo Gallery'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGalleryPermissionDialog(false)}
                className="w-full py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Live Camera Viewfinder Modal */}
      <LiveCameraModal
        isOpen={isLiveCameraOpen}
        onClose={() => setIsLiveCameraOpen(false)}
        onCapture={handleImageCaptured}
        lang={lang}
      />
    </div>
  );
};
