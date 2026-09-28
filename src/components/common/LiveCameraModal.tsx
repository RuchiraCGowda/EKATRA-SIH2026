import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  RotateCcw,
  Check,
  RefreshCw,
  AlertCircle,
  Image as ImageIcon,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { AppLanguage } from '../../types/database';
import { captureVideoFrame, compressImageFile } from '../../lib/imageUtils';

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  lang: AppLanguage;
  title?: string;
}

export const LiveCameraModal: React.FC<LiveCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  lang,
  title,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Stop active stream tracks
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Check if device has multiple video inputs
  useEffect(() => {
    if (!isOpen) return;

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          setHasMultipleCameras(videoInputs.length > 1);
        })
        .catch(() => setHasMultipleCameras(false));
    }
  }, [isOpen]);

  // Start live stream when modal opens or facing mode toggles
  useEffect(() => {
    if (!isOpen) {
      stopStream();
      setCapturedImage(null);
      setCameraError(null);
      return;
    }

    let isMounted = true;
    setIsInitializing(true);
    setCameraError(null);

    const startCamera = async () => {
      // If mediaDevices is not supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (isMounted) {
          setIsInitializing(false);
          setCameraError('live_unavailable');
        }
        return;
      }

      try {
        // Stop any old stream before starting new
        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
        }

        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!isMounted) {
          newStream.getTracks().forEach((t) => t.stop());
          return;
        }

        setStream(newStream);
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          videoRef.current.play().catch(() => {
            // Autoplay policy handled
          });
        }
        setIsInitializing(false);
      } catch (err: unknown) {
        console.warn('getUserMedia error, falling back to native inputs:', err);
        if (isMounted) {
          setIsInitializing(false);
          setCameraError('permission_or_restricted');
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  // Handle snap photo from live video
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    const dataUrl = captureVideoFrame(videoRef.current);
    if (dataUrl) {
      setCapturedImage(dataUrl);
    }
  };

  // Confirm photo and pass to parent
  const handleConfirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopStream();
      onClose();
    }
  };

  // Flip between environment (rear) and user (selfie)
  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Handle native camera or gallery file chosen
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImageFile(file);
      onCapture(compressedDataUrl);
      stopStream();
      onClose();
    } catch (err) {
      console.error('File compression error:', err);
    } finally {
      // Reset input value so same file can be re-selected if needed
      e.target.value = '';
    }
  };

  // Trigger native phone camera app directly
  const handleOpenNativeCamera = () => {
    nativeCameraInputRef.current?.click();
  };

  // Trigger native gallery / photo picker directly
  const handleOpenGallery = () => {
    galleryInputRef.current?.click();
  };

  // Localized texts
  const t_title =
    title ||
    (lang === 'mr'
      ? 'कचऱ्याचा फोटो घ्या'
      : lang === 'hi'
      ? 'ई-कचरे का फोटो खींचें'
      : lang === 'gu'
      ? 'ઈ-કચરાનો ફોટો લો'
      : lang === 'ta'
      ? 'மின்-கழிவு புகைப்படம் எடுங்கள்'
      : lang === 'te'
      ? 'ఇ-వ్యర్థం ఫోటో తీయండి'
      : lang === 'kn'
      ? 'ಇ-ತ್ಯಾಜ್ಯ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ'
      : 'Capture Scrap Photo');

  const t_align =
    lang === 'mr'
      ? 'कचरा चौकटीत ठेवा'
      : lang === 'hi'
      ? 'कचरा फ्रेम के बीच में रखें'
      : lang === 'gu'
      ? 'કચરો ફ્રેમમાં રાખો'
      : lang === 'ta'
      ? 'பொருளை சட்டகத்தில் வைக்கவும்'
      : lang === 'te'
      ? 'వస్తువును ఫ్రేమ్‌లో ఉంచండి'
      : lang === 'kn'
      ? 'ವಸ್ತುವನ್ನು ಚೌಕಟ್ಟಿನಲ್ಲಿರಿಸಿ'
      : 'Center scrap within the frame';

  const t_retake =
    lang === 'mr'
      ? 'पुन्हा फोटो घ्या'
      : lang === 'hi'
      ? 'दोबारा खींचें'
      : lang === 'gu'
      ? 'ફરીથી લો'
      : lang === 'ta'
      ? 'மீண்டும் எடு'
      : lang === 'te'
      ? 'మళ్లీ తీయండి'
      : lang === 'kn'
      ? 'ಮತ್ತೆ ತೆಗೆದುಕೊಳ್ಳಿ'
      : 'Retake Photo';

  const t_usePhoto =
    lang === 'mr'
      ? 'हा फोटो वापरा'
      : lang === 'hi'
      ? 'यह फोटो उपयोग करें'
      : lang === 'gu'
      ? 'આ ફોટો વાપરો'
      : lang === 'ta'
      ? 'இந்த புகைப்படத்தை பயன்படுத்து'
      : lang === 'te'
      ? 'ఈ ఫోటోను ఉపయోగించండి'
      : lang === 'kn'
      ? 'ಈ ಫೋಟೋ ಬಳಸಿ'
      : 'Use This Photo';

  const t_nativeCamera =
    lang === 'mr'
      ? 'फोनचा कॅमेरा ॲप उघडा'
      : lang === 'hi'
      ? 'फोन का कैमरा ऐप खोलें'
      : lang === 'gu'
      ? 'ફોન કેમેરા એપ ખોલો'
      : lang === 'ta'
      ? 'மொபைல் கேமரா பயன்பாட்டைத் திறக்கவும்'
      : lang === 'te'
      ? 'ఫోన్ కెమెరా యాప్ తెరవండి'
      : lang === 'kn'
      ? 'ಫೋನ್ ಕ್ಯಾಮೆರಾ ಅಪ್ಲಿಕೇಶನ್ ತೆರೆಯಿರಿ'
      : 'Open Device Camera App';

  const t_gallery =
    lang === 'mr'
      ? 'गॅलरीतून निवडा'
      : lang === 'hi'
      ? 'गैलरी से चुनें'
      : lang === 'gu'
      ? 'ગેલેરીમાંથી પસંદ કરો'
      : lang === 'ta'
      ? 'கேலரியில் இருந்து தேர்வுசெய்க'
      : lang === 'te'
      ? 'గ్యాలరీ నుండి ఎంచుకోండి'
      : lang === 'kn'
      ? 'ಗ್ಯಾಲರಿಯಿಂದ ಆಯ್ಕೆಮಾಡಿ'
      : 'Choose from Gallery';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
      {/* Hidden File Inputs for Direct Camera & Gallery */}
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm sm:text-base leading-tight">
                {t_title}
              </h3>
              <p className="text-[11px] text-slate-400">{t_align}</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview Container */}
        <div className="relative bg-black flex-1 min-h-[300px] sm:min-h-[360px] flex items-center justify-center overflow-hidden">
          {/* Captured Image Preview State */}
          {capturedImage ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={capturedImage}
                alt="Captured scrap"
                className="max-h-[60vh] w-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Captured Ready</span>
              </div>
            </div>
          ) : cameraError ? (
            /* Live Camera Permission / Unavailable Fallback State */
            <div className="p-6 text-center space-y-4 max-w-sm mx-auto">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
                <Smartphone className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-100 text-base">
                  {lang === 'mr'
                    ? 'थेट कॅमेरा किंवा गॅलरी वापरा'
                    : lang === 'hi'
                    ? 'सीधे कैमरा या गैलरी का उपयोग करें'
                    : 'Use Device Camera or Gallery'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {lang === 'mr'
                    ? 'ब्राउझर कॅमेरा सुरू करू न शकल्यास खालील बटण दाबून थेट तुमच्या मोबाईलचा कॅमेरा ॲप किंवा गॅलरी उघडा.'
                    : lang === 'hi'
                    ? 'यदि ब्राउज़र में लाइव कैमरा नहीं खुल रहा, तो नीचे दिए बटन से सीधे अपने फोन का कैमरा या गैलरी खोलें।'
                    : 'You can launch your device camera app directly or choose an existing photo from your gallery.'}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleOpenNativeCamera}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  {t_nativeCamera}
                </button>

                <button
                  type="button"
                  onClick={handleOpenGallery}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm flex items-center justify-center gap-2 active:scale-95"
                >
                  <ImageIcon className="w-4 h-4 text-teal-400" />
                  {t_gallery}
                </button>
              </div>
            </div>
          ) : (
            /* Live Viewfinder Video Feed */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover max-h-[60vh]"
              />

              {/* Viewfinder Reticle Overlay */}
              <div className="absolute inset-6 border-2 border-emerald-500/40 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <span className="w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
                  <span className="w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
                </div>
                <div className="text-center">
                  <span className="bg-slate-950/70 text-emerald-300 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    EKATRA AI Scan
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
                  <span className="w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br" />
                </div>
              </div>

              {/* Flip camera button if multiple cameras available */}
              {(hasMultipleCameras || true) && (
                <button
                  type="button"
                  onClick={handleToggleFacingMode}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-900/80 text-white border border-slate-700/80 shadow-lg hover:bg-slate-800 active:scale-90"
                  title="Switch Camera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}

              {isInitializing && (
                <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-slate-300 text-xs font-semibold gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Loading camera...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls Footer */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex flex-col gap-3">
          {capturedImage ? (
            /* Post-capture Confirm / Retake Controls */
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCapturedImage(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {t_retake}
              </button>
              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95"
              >
                <Check className="w-4 h-4" />
                {t_usePhoto}
              </button>
            </div>
          ) : !cameraError ? (
            /* Active Live Camera Viewfinder Controls */
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleOpenGallery}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 flex items-center gap-1.5 text-xs font-bold active:scale-95"
                title={t_gallery}
              >
                <ImageIcon className="w-4 h-4 text-teal-400" />
                <span className="hidden sm:inline">{t_gallery}</span>
              </button>

              {/* Shutter Button */}
              <button
                type="button"
                onClick={handleSnapPhoto}
                disabled={isInitializing}
                className="w-16 h-16 rounded-full border-4 border-emerald-400 bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/40 active:scale-90 transition-transform disabled:opacity-50"
                aria-label="Capture photo"
              >
                <div className="w-12 h-12 rounded-full border-2 border-slate-950/40 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-slate-950" />
                </div>
              </button>

              <button
                type="button"
                onClick={handleOpenNativeCamera}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 flex items-center gap-1.5 text-xs font-bold active:scale-95"
                title={t_nativeCamera}
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">{t_nativeCamera}</span>
              </button>
            </div>
          ) : (
            /* Cancel button when camera error */
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  stopStream();
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
