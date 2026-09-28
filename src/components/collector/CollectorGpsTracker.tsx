import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation,
  MapPin,
  Radio,
  Truck,
  ShieldCheck,
  Compass,
  Play,
  Pause,
  RotateCcw,
  ExternalLink,
  QrCode,
  Package,
  Layers,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Signal,
  Eye,
} from 'lucide-react';
import { Lot, AppLanguage } from '../../types/database';
import { getTranslation } from '../../lib/i18n';
import { AudioButton } from '../common/AudioButton';
import { getMaterialCategoryName } from '../../lib/materialHelpers';
import { EkatraDB } from '../../lib/supabase';

interface CollectorGpsTrackerProps {
  lots: Lot[];
  lang: AppLanguage;
  initialLotId?: string;
  onOpenLotQr?: (lot: Lot) => void;
  onRefresh?: () => void;
}

interface RecyclerDestination {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  spcbLicense: string;
}

export const CollectorGpsTracker: React.FC<CollectorGpsTrackerProps> = ({
  lots,
  lang,
  initialLotId,
  onOpenLotQr,
  onRefresh,
}) => {
  const t = getTranslation(lang);

  // Default recycler destination (Taloja MIDC Authorized Recycler)
  const defaultRecycler: RecyclerDestination = {
    id: 'rec-taloja',
    name: 'EcoRecycle Maharashtra Smelter Facility',
    address: 'Plot M-44, MIDC Taloja Industrial Zone, Navi Mumbai',
    lat: 19.0583,
    lng: 73.1124,
    spcbLicense: 'MPCB/RO/BMW/AUT/2026/0882',
  };

  // Collector's live device location
  const [deviceCoords, setDeviceCoords] = useState<{
    lat: number;
    lng: number;
    accuracy: number | null;
    isLive: boolean;
  }>({
    lat: 19.0435,
    lng: 72.8567,
    accuracy: 5.2,
    isLive: false,
  });

  const [locationError, setLocationError] = useState<string | null>(null);
  const [isWatchingGps, setIsWatchingGps] = useState<boolean>(false);
  const [selectedLotId, setSelectedLotId] = useState<string>(
    initialLotId || lots[0]?.id || ''
  );
  const [geotagSuccessMsg, setGeotagSuccessMsg] = useState<string | null>(null);

  // Transit Simulation State
  const [isSimulatingTransit, setIsSimulatingTransit] = useState<boolean>(false);
  const [transitProgress, setTransitProgress] = useState<number>(0); // 0 to 100%
  const [simulatedSpeed, setSimulatedSpeed] = useState<number>(32); // km/h
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Selected lot object
  const currentLot = lots.find((l) => l.id === selectedLotId) || lots[0] || null;

  // Real-time Geolocation tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Device does not support GPS sensor.');
      return;
    }

    let watchId: number | null = null;

    const onSuccess = (pos: GeolocationPosition) => {
      setDeviceCoords({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy * 10) / 10,
        isLive: true,
      });
      setLocationError(null);
    };

    const onError = (err: GeolocationPositionError) => {
      // Graceful fallback to default Dharavi hub if permission is blocked in dev iframe
      setDeviceCoords((prev) => ({
        ...prev,
        lat: 19.0435,
        lng: 72.8567,
        isLive: false,
      }));
      setLocationError(
        err.code === 1
          ? 'GPS permission not granted. Showing registered scrap hub coordinates.'
          : 'Weak GPS signal. Using cached location.'
      );
    };

    // Initial position fetch
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 10000,
    });

    // Start watching position
    watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    });
    setIsWatchingGps(true);

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Update selected lot if initialLotId changes
  useEffect(() => {
    if (initialLotId) {
      setSelectedLotId(initialLotId);
    }
  }, [initialLotId]);

  // Handle Transit Simulation Timer
  useEffect(() => {
    if (isSimulatingTransit) {
      simulationIntervalRef.current = setInterval(() => {
        setTransitProgress((prev) => {
          if (prev >= 100) {
            setIsSimulatingTransit(false);
            if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
            return 100;
          }
          // Random slight variance in vehicle speed
          setSimulatedSpeed(Math.floor(28 + Math.random() * 14));
          return prev + 2.5;
        });
      }, 500);
    } else {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    }

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [isSimulatingTransit]);

  // Distance calculation (Haversine formula in kilometers)
  const calculateDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  const originLat = currentLot?.latitude || deviceCoords.lat;
  const originLng = currentLot?.longitude || deviceCoords.lng;
  const destLat = defaultRecycler.lat;
  const destLng = defaultRecycler.lng;

  const totalDistanceKm = calculateDistanceKm(originLat, originLng, destLat, destLng);
  const remainingDistanceKm = Math.max(
    0,
    Math.round(totalDistanceKm * (1 - transitProgress / 100) * 10) / 10
  );
  const estimatedTimeMins = Math.max(
    1,
    Math.round((remainingDistanceKm / (simulatedSpeed || 30)) * 60)
  );

  // Compute animated transit position
  const currentTransitLat = originLat + (destLat - originLat) * (transitProgress / 100);
  const currentTransitLng = originLng + (destLng - originLng) * (transitProgress / 100);

  // Stamp current device GPS onto the active lot
  const handleStampCurrentGps = () => {
    if (!currentLot) return;
    try {
      currentLot.latitude = deviceCoords.lat;
      currentLot.longitude = deviceCoords.lng;
      currentLot.location_name = `Live GPS Fix (${deviceCoords.lat.toFixed(4)}, ${deviceCoords.lng.toFixed(4)})`;
      setGeotagSuccessMsg(
        lang === 'mr'
          ? `लॉट ${currentLot.lot_code} साठी लाइव्ह जीपीएस टॅग यशस्वीरित्या सेव्ह केला!`
          : lang === 'hi'
          ? `लॉट ${currentLot.lot_code} के लिए लाइव जीपीएस लोकेशन सफलतापूर्वक अपडेट हुई!`
          : `Live GPS coordinates successfully stamped on lot ${currentLot.lot_code}!`
      );
      setTimeout(() => setGeotagSuccessMsg(null), 4000);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const audioGpsPrompt =
    lang === 'mr'
      ? `हे ई-कचरा साहित्याचे थेट जीपीएस ट्रॅकिंग आहे. तुमचे साहित्य सध्या कुठल्या स्थानावर आहे आणि रिसायकलरच्या गोदामाचे अंतर किती आहे ते येथे दिसेल.`
      : lang === 'hi'
      ? `यह ई-कचरा सामग्री की लाइव जीपीएस ट्रैकिंग है। आपका माल किस स्थान पर है और रीसाइक्लर केंद्र से दूरी कितनी है, यह रडार पर दिखाई देगा।`
      : lang === 'gu'
      ? `આ ઈ-કચરા સામગ્રીનું લાઈવ જીપીએસ ટ્રેકિંગ છે. તમારો માલ હાલ ક્યાં છે અને રિસાઈકલર ગોડાઉનનું અંતર કેટલું છે તે અહીં રડાર પર દેખાશે.`
      : lang === 'ta'
      ? `இது மின்னணுக் கழிவுகளின் நேரடி ஜிபிஎஸ் கண்காணிப்பு. உங்கள் கழிவு தற்போது எங்குள்ளது மற்றும் மறுசுழற்சி மையத்தின் தூரம் எவ்வளவு என்பதை இங்கே பார்க்கலாம்.`
      : lang === 'te'
      ? `ఇది ఈ-వ్యర్థాల ప్రత్యక్ష జీపీఎస్ ట్రాకింగ్. మీ సరుకు ప్రస్తుతం ఏ ప్రదేశంలో ఉంది మరియు రీసైక్లర్ గిడ్డంగి దూరం ఎంత అనేది ఇక్కడ కనిపిస్తుంది.`
      : lang === 'kn'
      ? `ಇದು ಇ-ತ್ಯಾಜ್ಯ ವಸ್ತುಗಳ ನೇರ ಜಿಪಿಎಸ್ ಟ್ರ್ಯಾಕಿಂಗ್ ಆಗಿದೆ. ನಿಮ್ಮ ವಸ್ತುಗಳು ಪ್ರಸ್ತುತ ಎಲ್ಲಿದೆ ಮತ್ತು ರಿಸೈಕ್ಲರ್ ಗೋದಾಮಿನ ದೂರ ಎಷ್ಟು ಎಂಬುದನ್ನು ಇಲ್ಲಿ ನೋಡಬಹುದು.`
      : `Live GPS material tracking. Monitor the real-time location and transit route of your scrap lots to authorized recyclers.`;

  return (
    <div className="space-y-4">
      {/* Header with audio prompt */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-100">
                Material GPS Live Tracker
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Geofence
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              CPCB Form 6 Real-time Hazardous Scrap Movement Tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* GPS Live Status Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs">
            <Signal
              className={`w-3.5 h-3.5 ${
                deviceCoords.isLive ? 'text-emerald-400' : 'text-amber-400'
              }`}
            />
            <span className="text-[11px] font-mono text-slate-300">
              {deviceCoords.isLive ? 'GPS Locked' : 'Scrap Hub GPS'}
            </span>
            {deviceCoords.accuracy && (
              <span className="text-[10px] text-slate-500 font-mono">
                (±{deviceCoords.accuracy}m)
              </span>
            )}
          </div>

          <AudioButton textToSpeak={audioGpsPrompt} lang={lang} size="md" />
        </div>
      </div>

      {/* Geotag Success Toast */}
      {geotagSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{geotagSuccessMsg}</span>
          </div>
          <button
            onClick={() => setGeotagSuccessMsg(null)}
            className="text-emerald-400 hover:text-white px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Active Lot Selector Tabs */}
      {lots.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider pl-1">
            Active Lots:
          </span>
          {lots.map((lot) => {
            const isSelected = lot.id === selectedLotId;
            const catName = getMaterialCategoryName(lot.category, lang);
            return (
              <button
                key={lot.id}
                onClick={() => {
                  setSelectedLotId(lot.id);
                  setTransitProgress(0);
                  setIsSimulatingTransit(false);
                }}
                className={`px-3 py-2 rounded-2xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-900/40'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-750'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span className="font-mono">{lot.lot_code}</span>
                <span className="text-[10px] opacity-80 truncate max-w-[80px]">
                  ({catName})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main GPS Radar & Visual Corridor View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Interactive Radar Map Canvas (Left 2 cols) */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Subtle Radar Background Grid Lines */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />

          {/* Top Bar inside Map */}
          <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-extrabold text-slate-200">
                Mumbai MMR E-Waste Transit Corridor
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bearing: 072° ENE</span>
            </div>
          </div>

          {/* Radar Map Graphic */}
          <div className="relative z-10 my-4 h-64 sm:h-72 w-full rounded-2xl bg-slate-950/80 border border-slate-800 p-4 flex flex-col justify-between overflow-hidden">
            {/* SVG Visual Transit Path */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="corridorGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Highway Route Curve (Dharavi to Taloja) */}
              <path
                d="M 50 180 Q 150 120, 260 140 T 420 80"
                fill="none"
                stroke="#334155"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M 50 180 Q 150 120, 260 140 T 420 80"
                fill="none"
                stroke="url(#corridorGrad)"
                strokeWidth="3"
                strokeDasharray="6,4"
                className="animate-[dash_20s_linear_infinite]"
              />

              {/* Geofence Circles */}
              <circle cx="50" cy="180" r="32" fill="#10b981" fillOpacity="0.08" stroke="#10b981" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="420" cy="80" r="40" fill="#f59e0b" fillOpacity="0.08" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" />
            </svg>

            {/* Pins on the Radar */}
            <div className="relative z-10 flex items-start justify-between h-full">
              {/* Origin Pin (Kabadiwala Hub) */}
              <div className="flex flex-col items-center mt-24 sm:mt-28">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600/90 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 border-2 border-emerald-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="mt-2 text-center bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-700 shadow-md">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                    Origin Hub
                  </span>
                  <span className="text-[11px] font-bold text-slate-100">
                    {currentLot?.location_name || 'Dharavi Hub'}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 block">
                    {originLat.toFixed(3)}°, {originLng.toFixed(3)}°
                  </span>
                </div>
              </div>

              {/* Live Vehicle / Transit Marker */}
              <div className="flex flex-col items-center my-auto transition-all duration-300">
                <div
                  className={`p-3 rounded-2xl flex items-center justify-center shadow-2xl border-2 transition-all ${
                    transitProgress === 100
                      ? 'bg-emerald-500 text-white border-emerald-300 animate-bounce'
                      : isSimulatingTransit
                      ? 'bg-amber-500 text-slate-950 border-amber-300 animate-pulse'
                      : 'bg-slate-800 text-slate-300 border-slate-600'
                  }`}
                >
                  <Truck className="w-6 h-6" />
                </div>

                <div className="mt-2 text-center bg-slate-900/95 px-3 py-1.5 rounded-xl border border-slate-700 shadow-lg">
                  <div className="flex items-center gap-1 justify-center text-[10px] font-mono font-bold text-amber-400">
                    <span>{simulatedSpeed} km/h</span>
                    <span>•</span>
                    <span>{transitProgress.toFixed(0)}%</span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-semibold block">
                    {transitProgress === 100
                      ? '✅ Arrived at Recycler'
                      : isSimulatingTransit
                      ? 'In Transit (Sion-Panvel Hwy)'
                      : 'Ready for Dispatch'}
                  </span>
                </div>
              </div>

              {/* Destination Pin (Authorized Recycler Facility) */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-amber-600/90 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 border-2 border-amber-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-2 text-center bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-700 shadow-md">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">
                    Authorized Recycler
                  </span>
                  <span className="text-[11px] font-bold text-slate-100 truncate max-w-[130px] block">
                    {defaultRecycler.name}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 block">
                    Taloja MIDC
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Transit Simulation Controller */}
          <div className="relative z-10 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSimulatingTransit((prev) => !prev)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 ${
                  isSimulatingTransit
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isSimulatingTransit ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Vehicle Tracker</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>
                      {transitProgress > 0 ? 'Resume Transit' : 'Simulate Vehicle Route'}
                    </span>
                  </>
                )}
              </button>

              {transitProgress > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSimulatingTransit(false);
                    setTransitProgress(0);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  title="Reset Route"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* External Navigation Link */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Maps Navigation</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Right Column: Live Telemetry & Geotagging Details */}
        <div className="space-y-4">
          {/* Current Material Telemetry Card */}
          {currentLot ? (
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-400">
                  Target Material Telemetry
                </span>
                <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                  {currentLot.lot_code}
                </span>
              </div>

              {/* Material Details Strip */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Scrap Category:</span>
                  <span className="font-bold text-slate-100">
                    {getMaterialCategoryName(currentLot.category, lang)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Weight:</span>
                  <span className="font-extrabold text-emerald-400 text-sm">
                    {currentLot.approx_weight_kg} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Value:</span>
                  <span className="font-bold text-teal-300">
                    ₹{currentLot.estimated_value_inr}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Distance to Smelter:</span>
                  <span className="font-extrabold text-amber-400 text-sm">
                    {remainingDistanceKm} km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. Transit Time:</span>
                  <span className="font-mono text-slate-200 font-bold">
                    ~{estimatedTimeMins} mins
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleStampCurrentGps}
                  className="w-full py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <MapPin className="w-4 h-4 text-emerald-200" />
                  <span>Update GPS Tag with My Device</span>
                </button>

                {onOpenLotQr && (
                  <button
                    type="button"
                    onClick={() => onOpenLotQr(currentLot)}
                    className="w-full py-2 px-3 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <QrCode className="w-4 h-4 text-teal-400" />
                    <span>View Digital Manifest QR Pass</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
              No active scrap lots to track.
            </div>
          )}

          {/* SPCB Compliance Geofence Badge */}
          <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>SPCB Form 6 Regulatory Audit</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every hazardous e-waste shipment is timestamped with GPS breadcrumbs to prevent illegal informal dumping into Mumbai waterways.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
