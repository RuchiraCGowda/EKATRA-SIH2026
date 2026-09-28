import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  MapPin,
  Factory,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle,
  Truck,
  ShieldCheck,
  Package,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  Crosshair,
  Search,
  Sliders,
  Navigation,
  Globe,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { Lot, RecyclerProfile, Handover } from '../../types/database';

interface AdminMapProps {
  lots: Lot[];
  recyclers: RecyclerProfile[];
  handovers: Handover[];
}

// Key MMR Hub Landmarks
const PRESET_LOCATIONS = [
  { name: 'Dharavi Scrap Cluster', lat: 19.0435, lon: 72.8567, tag: 'Informal Hub' },
  { name: 'Kurla West Market', lat: 19.0688, lon: 72.879, tag: 'Aggregator Yard' },
  { name: 'Sion Koliwada Depot', lat: 19.035, lon: 72.862, tag: 'Collection Center' },
  { name: 'Navi Mumbai MIDC Plant', lat: 19.033, lon: 73.0297, tag: 'Authorized Recycler' },
  { name: 'Taloja Industrial Cluster', lat: 19.08, lon: 73.11, tag: 'Hazardous Processing' },
  { name: 'Thane MIDC Facility', lat: 19.2183, lon: 72.9781, tag: 'Authorized Recycler' },
];

export const AdminMap: React.FC<AdminMapProps> = ({ lots, recyclers, handovers }) => {
  // Map Viewport state (Zoom & Pan translation)
  const [zoom, setZoom] = useState<number>(1.2);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [scrollZoomEnabled, setScrollZoomEnabled] = useState<boolean>(true);
  const [showScrollHint, setShowScrollHint] = useState<boolean>(false);
  const lastTouchDistRef = useRef<number | null>(null);

  // Filters & Map Styles
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [showRecyclers, setShowRecyclers] = useState<boolean>(true);
  const [showHandovers, setShowHandovers] = useState<boolean>(true);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [showServiceRadius, setShowServiceRadius] = useState<boolean>(true);
  const [mapStyle, setMapStyle] = useState<'tactical' | 'satellite' | 'blueprint'>('tactical');

  // Selected item inspector
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'lot' | 'recycler' | 'handover';
    title: string;
    details: string;
    lat: number;
    lon: number;
    extraBadge?: string;
    metrics?: Record<string, string>;
  } | null>(null);

  // Search & entity list
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'lots' | 'recyclers' | 'handovers'>('all');

  // Live Hover Coordinates
  const [hoverCoords, setHoverCoords] = useState<{ lat: number; lon: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapSvgRef = useRef<SVGSVGElement>(null);

  // Geographic boundaries for Mumbai Metropolitan Region (MMR)
  const minLat = 18.92;
  const maxLat = 19.32;
  const minLon = 72.78;
  const maxLon = 73.22;

  // Convert GPS Coordinates to SVG ViewBox space (800 x 520)
  const projectToSvg = useCallback(
    (lat: number, lon: number) => {
      const x = ((lon - minLon) / (maxLon - minLon)) * 700 + 50;
      const y = ((maxLat - lat) / (maxLat - minLat)) * 440 + 40;
      return {
        x: Math.max(20, Math.min(780, x)),
        y: Math.max(20, Math.min(500, y)),
      };
    },
    [minLat, maxLat, minLon, maxLon]
  );

  // Convert SVG ViewBox coordinates back to approximate GPS coordinates
  const projectToGps = useCallback(
    (svgX: number, svgY: number) => {
      const lon = ((svgX - 50) / 700) * (maxLon - minLon) + minLon;
      const lat = maxLat - ((svgY - 40) / 440) * (maxLat - minLat);
      return {
        lat: Math.round(lat * 10000) / 10000,
        lon: Math.round(lon * 10000) / 10000,
      };
    },
    [minLat, maxLat, minLon, maxLon]
  );

  // Mouse drag handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Primary mouse button only
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    // Calculate hover GPS coordinates relative to map center
    if (mapSvgRef.current) {
      const rect = mapSvgRef.current.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left - pan.x) / zoom;
      const relativeY = (e.clientY - rect.top - pan.y) / zoom;
      const svgX = (relativeX / rect.width) * 800;
      const svgY = (relativeY / rect.height) * 520;
      setHoverCoords(projectToGps(svgX, svgY));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag & pinch-to-zoom handlers for mobile/touch screens
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      lastTouchDistRef.current = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && lastTouchDistRef.current) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDist = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      if (lastTouchDistRef.current > 0) {
        const factor = currentDist / lastTouchDistRef.current;
        setZoom((prev) => {
          const next = Math.min(4.0, Math.max(0.6, prev * factor));
          return Math.round(next * 100) / 100;
        });
      }
      lastTouchDistRef.current = currentDist;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    lastTouchDistRef.current = null;
  };

  // Active non-passive wheel zoom listener to smoothly zoom without scrolling the parent page
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY < 0 ? 0.2 : -0.2;
      setZoom((prevZoom) => {
        const nextZoom = Math.min(4.5, Math.max(0.6, Math.round((prevZoom + delta) * 10) / 10));
        return nextZoom;
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Double click handler: Instant zoom in
  const handleDoubleClick = () => {
    setZoom((prev) => Math.min(4.5, Math.round((prev + 0.4) * 10) / 10));
  };

  // Pan controls (Step Pan)
  const panBy = (dx: number, dy: number) => {
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  };

  // Reset View
  const handleResetView = () => {
    setZoom(1.2);
    setPan({ x: 0, y: 0 });
    setSelectedEntity(null);
  };

  // Center camera onto a specific lat/lon
  const focusOnCoordinates = (lat: number, lon: number, zoomLevel = 1.8) => {
    const { x, y } = projectToSvg(lat, lon);
    // In 800x520 space, center is (400, 260)
    const targetPanX = (400 - x) * zoomLevel;
    const targetPanY = (260 - y) * zoomLevel;

    setZoom(zoomLevel);
    setPan({ x: targetPanX, y: targetPanY });
  };

  // Filtered entity search
  const filteredEntities = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const results: Array<{
      id: string;
      type: 'lot' | 'recycler' | 'handover';
      title: string;
      subtitle: string;
      lat: number;
      lon: number;
      badge: string;
      color: string;
    }> = [];

    if (activeTab === 'all' || activeTab === 'lots') {
      lots.forEach((l) => {
        if (!q || l.lot_code.toLowerCase().includes(q) || l.location_name.toLowerCase().includes(q) || l.category?.name_en.toLowerCase().includes(q)) {
          results.push({
            id: l.id,
            type: 'lot',
            title: `${l.lot_code} (${l.category?.name_en || 'E-Waste'})`,
            subtitle: `${l.approx_weight_kg} kg • ${l.location_name}`,
            lat: l.latitude,
            lon: l.longitude,
            badge: l.status.toUpperCase(),
            color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
          });
        }
      });
    }

    if (activeTab === 'all' || activeTab === 'recyclers') {
      recyclers.forEach((r) => {
        if (!q || r.company_name.toLowerCase().includes(q) || r.facility_address.toLowerCase().includes(q)) {
          results.push({
            id: r.id,
            type: 'recycler',
            title: r.company_name,
            subtitle: `${r.facility_address} • ${r.capacity_per_month_mt} MT/mo`,
            lat: r.latitude,
            lon: r.longitude,
            badge: r.authorization_status.toUpperCase(),
            color: 'text-teal-400 border-teal-500/40 bg-teal-500/10',
          });
        }
      });
    }

    if (activeTab === 'all' || activeTab === 'handovers') {
      handovers.forEach((h) => {
        if (!q || h.handover_code.toLowerCase().includes(q) || h.location_name.toLowerCase().includes(q)) {
          results.push({
            id: h.id,
            type: 'handover',
            title: `Handover ${h.handover_code}`,
            subtitle: `${h.verified_weight_kg} kg • ₹${h.final_amount_inr} • ${h.location_name}`,
            lat: h.latitude,
            lon: h.longitude,
            badge: 'VERIFIED',
            color: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10',
          });
        }
      });
    }

    return results;
  }, [lots, recyclers, handovers, searchQuery, activeTab]);

  return (
    <div
      className={`space-y-4 transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 p-4 overflow-hidden flex flex-col'
          : 'relative'
      }`}
      ref={containerRef}
    >
      {/* Top Toolbar: Layer Toggles, Map Style, and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-slate-800/90 border border-slate-700 text-xs shadow-xl backdrop-blur-md">
        {/* Layer Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            Layers:
          </span>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
            <input
              type="checkbox"
              checked={showHotspots}
              onChange={(e) => setShowHotspots(e.target.checked)}
              className="rounded accent-emerald-500 w-3.5 h-3.5"
            />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Scrap Lots ({lots.length})
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
            <input
              type="checkbox"
              checked={showRecyclers}
              onChange={(e) => setShowRecyclers(e.target.checked)}
              className="rounded accent-teal-500 w-3.5 h-3.5"
            />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              Recyclers ({recyclers.length})
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
            <input
              type="checkbox"
              checked={showHandovers}
              onChange={(e) => setShowHandovers(e.target.checked)}
              className="rounded accent-indigo-500 w-3.5 h-3.5"
            />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              Handovers ({handovers.length})
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
            <input
              type="checkbox"
              checked={showRoutes}
              onChange={(e) => setShowRoutes(e.target.checked)}
              className="rounded accent-amber-500 w-3.5 h-3.5"
            />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Transit Corridors
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
            <input
              type="checkbox"
              checked={showServiceRadius}
              onChange={(e) => setShowServiceRadius(e.target.checked)}
              className="rounded accent-cyan-500 w-3.5 h-3.5"
            />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Service Radius
            </span>
          </label>
        </div>

        {/* Map Style Selector & Fullscreen Toggle */}
        <div className="flex items-center gap-2">
          {/* Style Buttons */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setMapStyle('tactical')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                mapStyle === 'tactical'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tactical
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                mapStyle === 'satellite'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapStyle('blueprint')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                mapStyle === 'blueprint'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Blueprint
            </button>
          </div>

          {/* Scroll-to-Zoom Toggle */}
          <button
            onClick={() => setScrollZoomEnabled(!scrollZoomEnabled)}
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-1.5 ${
              scrollZoomEnabled
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title={
              scrollZoomEnabled
                ? 'Wheel scroll is zooming the map. Click to allow page scrolling.'
                : 'Wheel scroll is scrolling the page. Click to enable direct wheel zooming.'
            }
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>{scrollZoomEnabled ? 'Wheel: Zoom Map' : 'Wheel: Scroll Page'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quick Landmark Teleport Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          Jump To Hub:
        </span>
        {PRESET_LOCATIONS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => focusOnCoordinates(preset.lat, preset.lon, 2.2)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-emerald-950/40 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-white transition-all whitespace-nowrap flex items-center gap-1.5 active:scale-95 shrink-0"
          >
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span className="font-semibold">{preset.name}</span>
            <span className="text-[10px] text-slate-400 bg-slate-900/80 px-1.5 py-0.2 rounded">
              {preset.tag}
            </span>
          </button>
        ))}
      </div>

      {/* Main Map Viewport & Integrated Entity Drawer */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-4 gap-4 ${
          isFullscreen ? 'flex-1 min-h-0' : 'min-h-[560px]'
        }`}
      >
        {/* Interactive Map Canvas Container (Col-Span 3) */}
        <div
          ref={containerRef}
          className={`lg:col-span-3 relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl select-none ${
            mapStyle === 'tactical'
              ? 'bg-slate-950'
              : mapStyle === 'satellite'
              ? 'bg-[#09151f]'
              : 'bg-[#061325]'
          } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${
            isFullscreen ? 'h-full min-h-[480px]' : 'h-[560px]'
          }`}
          style={{ touchAction: 'none' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleDoubleClick}
        >
          {/* Animated SVG Map Layer */}
          <div
            className="w-full h-full transition-transform duration-75 origin-center will-change-transform"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '400px 260px',
            }}
          >
            <svg
              ref={mapSvgRef}
              viewBox="0 0 800 520"
              className="w-full h-full pointer-events-auto"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Pattern Definitions */}
              <defs>
                <pattern id="grid-tactical" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.6" />
                </pattern>
                <pattern id="grid-blueprint" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0e3a5a" strokeWidth="0.5" />
                </pattern>
                <radialGradient id="ocean-glow" cx="40%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#0b1b2b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#030712" stopOpacity="1" />
                </radialGradient>
              </defs>

              {/* Background Map Canvas */}
              <rect
                width="800"
                height="520"
                fill={
                  mapStyle === 'tactical'
                    ? 'url(#grid-tactical)'
                    : mapStyle === 'blueprint'
                    ? 'url(#grid-blueprint)'
                    : 'url(#ocean-glow)'
                }
              />

              {/* Arabian Sea / Mumbai Coastline & Thane Creek Landmasses */}
              <g id="landmass" className="transition-opacity duration-300">
                {/* Mumbai Peninsula (South Mumbai to Borivali / Dahisar) */}
                <path
                  d="M 120 20 Q 150 100 170 180 T 160 300 Q 140 380 120 440 L 90 490 L 30 490 L 30 20 Z"
                  fill={mapStyle === 'satellite' ? '#17283c' : '#0f172a'}
                  stroke="#334155"
                  strokeWidth="2"
                />

                {/* Salsette Island Central & Eastern Suburbs (Kurla, Dharavi, Chembur, Ghatkopar) */}
                <path
                  d="M 170 180 Q 220 170 290 200 T 320 320 Q 250 360 160 300 Z"
                  fill={mapStyle === 'satellite' ? '#1a2e40' : '#111e33'}
                  stroke="#334155"
                  strokeWidth="1.5"
                />

                {/* Thane Creek & Navi Mumbai Mainland (Vashi, Nerul, Belapur, Taloja, MIDC) */}
                <path
                  d="M 360 40 Q 420 120 480 200 T 560 320 Q 640 380 770 420 L 770 40 Z"
                  fill={mapStyle === 'satellite' ? '#152538' : '#0f172a'}
                  stroke="#334155"
                  strokeWidth="2"
                />

                {/* Mithi River & Waterways */}
                <path
                  d="M 175 190 Q 200 220 180 250 T 165 290"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.7"
                />

                {/* Thane Creek Waterbody */}
                <path
                  d="M 290 200 Q 340 250 360 350 T 400 480"
                  fill="none"
                  stroke="#0369a1"
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity="0.4"
                />
              </g>

              {/* Major Highway Corridors across Mumbai MMR */}
              {showRoutes && (
                <g id="transport-corridors" opacity="0.6">
                  {/* Western Express Highway (WEH) */}
                  <path
                    d="M 140 30 L 160 140 L 175 220 L 155 350 L 130 450"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeDasharray="4,4"
                  />
                  {/* Eastern Express Highway (EEH) */}
                  <path
                    d="M 330 80 L 270 180 L 230 250 L 190 320"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeDasharray="4,4"
                  />
                  {/* Sion-Panvel Expressway connecting Dharavi/Kurla to Vashi & Taloja MIDC */}
                  <path
                    d="M 180 230 Q 280 260 380 270 T 520 290 Q 620 310 680 340"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Mumbai Trans Harbour Link (MTHL / Atal Setu) */}
                  <path
                    d="M 180 340 Q 320 330 460 325 T 530 330"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    strokeDasharray="3,3"
                  />
                </g>
              )}

              {/* Geographic Region Text Labels */}
              <text x="70" y="240" fill="#64748b" fontSize="12" fontWeight="800" opacity="0.7">
                MUMBAI ISLAND CITY
              </text>
              <text x="180" y="215" fill="#10b981" fontSize="11" fontWeight="700">
                📍 Dharavi Hub (19.04°N)
              </text>
              <text x="210" y="175" fill="#38bdf8" fontSize="11" fontWeight="700">
                📍 Kurla Aggregator (19.06°N)
              </text>
              <text x="320" y="90" fill="#64748b" fontSize="12" fontWeight="800" opacity="0.7">
                THANE METROPOLITAN ZONE
              </text>
              <text x="440" y="270" fill="#2dd4bf" fontSize="11" fontWeight="700">
                🏭 Navi Mumbai MIDC (19.03°N)
              </text>
              <text x="540" y="325" fill="#818cf8" fontSize="11" fontWeight="700">
                ⚡ Taloja Hazardous Cluster (19.08°N)
              </text>

              {/* Active Traceability Handover Connector Vectors (Dotted paths from Lots to Destination Facilities) */}
              {showRoutes &&
                lots.slice(0, 5).map((lot, idx) => {
                  const lotPos = projectToSvg(lot.latitude, lot.longitude);
                  // Find destination recycler
                  const targetRec =
                    recyclers.find((r) => r.id === lot.selected_recycler_id) || recyclers[idx % recyclers.length];
                  if (!targetRec) return null;
                  const recPos = projectToSvg(targetRec.latitude, targetRec.longitude);

                  return (
                    <g key={`route-${lot.id}`} className="transition-all">
                      <line
                        x1={lotPos.x}
                        y1={lotPos.y}
                        x2={recPos.x}
                        y2={recPos.y}
                        stroke="#10b981"
                        strokeWidth="1.5"
                        strokeDasharray="4,4"
                        strokeOpacity="0.7"
                      />
                      {/* Pulse token moving along route */}
                      <circle
                        cx={(lotPos.x + recPos.x) / 2}
                        cy={(lotPos.y + recPos.y) / 2}
                        r="3.5"
                        fill="#34d399"
                        className="animate-pulse"
                      />
                    </g>
                  );
                })}

              {/* Recycler Facilities & Service Radius Circles */}
              {showRecyclers &&
                recyclers.map((rec) => {
                  const { x, y } = projectToSvg(rec.latitude, rec.longitude);
                  const isSelected = selectedEntity?.title === rec.company_name;

                  return (
                    <g
                      key={rec.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntity({
                          type: 'recycler',
                          title: rec.company_name,
                          details: `${rec.facility_address} • Authorized Capacity: ${rec.capacity_per_month_mt} MT/month • Radius: ${rec.service_radius_km} km`,
                          lat: rec.latitude,
                          lon: rec.longitude,
                          extraBadge: rec.authorization_status.toUpperCase(),
                          metrics: {
                            'License No': rec.spcb_license_number || 'Valid Form 6',
                            Capacity: `${rec.capacity_per_month_mt} MT/mo`,
                            Pickup: rec.pickup_available ? 'Digital Scale Vehicle' : 'Depot Only',
                            Radius: `${rec.service_radius_km} km`,
                          },
                        });
                      }}
                      className="cursor-pointer group"
                    >
                      {/* Service radius circle */}
                      {showServiceRadius && (
                        <circle
                          cx={x}
                          cy={y}
                          r={rec.service_radius_km * 2.2}
                          fill="#0d9488"
                          fillOpacity={isSelected ? '0.18' : '0.07'}
                          stroke="#0d9488"
                          strokeWidth={isSelected ? '2' : '1'}
                          strokeDasharray="4,4"
                        />
                      )}

                      {/* Ping ring */}
                      <circle
                        cx={x}
                        cy={y}
                        r="18"
                        fill="#0d9488"
                        fillOpacity="0.25"
                        className="animate-ping"
                      />

                      {/* Center facility marker */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? '12' : '9'}
                        fill="#14b8a6"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        className="transition-all filter drop-shadow-md"
                      />
                      <circle cx={x} cy={y} r="3" fill="#ffffff" />

                      {/* Facility label */}
                      <text
                        x={x + 14}
                        y={y + 4}
                        fill="#5eead4"
                        fontSize="11"
                        fontWeight="bold"
                        className="filter drop-shadow"
                      >
                        {rec.company_name.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}

              {/* Collection Lots Hotspots */}
              {showHotspots &&
                lots.map((lot) => {
                  const { x, y } = projectToSvg(lot.latitude, lot.longitude);
                  const isSelected = selectedEntity?.title.startsWith(lot.lot_code);

                  return (
                    <g
                      key={lot.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntity({
                          type: 'lot',
                          title: `${lot.lot_code} - ${lot.category?.name_en || 'E-Waste'}`,
                          details: `${lot.approx_weight_kg} kg • Est: ₹${lot.estimated_value_inr} • Location: ${lot.location_name}`,
                          lat: lot.latitude,
                          lon: lot.longitude,
                          extraBadge: lot.status.toUpperCase(),
                          metrics: {
                            Weight: `${lot.approx_weight_kg} kg`,
                            Material: lot.category?.name_en || 'Scrap Lot',
                            EstValue: `₹${lot.estimated_value_inr}`,
                            Status: lot.status,
                          },
                        });
                      }}
                      className="cursor-pointer group"
                    >
                      {isSelected && (
                        <circle
                          cx={x}
                          cy={y}
                          r="16"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                          strokeDasharray="2,2"
                          className="animate-spin"
                        />
                      )}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? '8' : '6'}
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all filter drop-shadow"
                      />
                      <text
                        x={x + 10}
                        y={y + 3}
                        fill="#6ee7b7"
                        fontSize="9.5"
                        fontWeight="600"
                        className="filter drop-shadow"
                      >
                        {lot.lot_code.slice(-6)}
                      </text>
                    </g>
                  );
                })}

              {/* Handover Completed Checkpoints */}
              {showHandovers &&
                handovers.map((hnd) => {
                  const { x, y } = projectToSvg(hnd.latitude, hnd.longitude);
                  const isSelected = selectedEntity?.title.includes(hnd.handover_code);

                  return (
                    <g
                      key={hnd.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntity({
                          type: 'handover',
                          title: `Handover ${hnd.handover_code}`,
                          details: `Verified Weight: ${hnd.verified_weight_kg} kg • Paid: ₹${hnd.final_amount_inr} • Handover Point: ${hnd.location_name}`,
                          lat: hnd.latitude,
                          lon: hnd.longitude,
                          extraBadge: 'COMPLETED & PAID',
                          metrics: {
                            'Final Payout': `₹${hnd.final_amount_inr}`,
                            'Verified Wt': `${hnd.verified_weight_kg} kg`,
                            Timestamp: new Date(hnd.created_at).toLocaleTimeString(),
                            Location: hnd.location_name,
                          },
                        });
                      }}
                      className="cursor-pointer group"
                    >
                      <polygon
                        points={`${x},${y - 10} ${x + 8},${y + 7} ${x - 8},${y + 7}`}
                        fill="#6366f1"
                        stroke="#ffffff"
                        strokeWidth={isSelected ? '2.5' : '1.5'}
                        className="transition-all filter drop-shadow"
                      />
                    </g>
                  );
                })}
            </svg>
          </div>

          {/* D-Pad & Navigation Controls (Top-Right Overlay) */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            {/* Zoom Controls */}
            <div className="flex flex-col items-center bg-slate-900/95 border border-slate-700/80 rounded-2xl p-1.5 shadow-2xl backdrop-blur-md">
              <button
                onClick={() => setZoom((z) => Math.min(4.5, Math.round((z + 0.3) * 10) / 10))}
                className="w-8 h-8 hover:bg-emerald-600 rounded-xl text-slate-200 hover:text-white transition-colors active:scale-95 flex items-center justify-center font-bold"
                title="Zoom In (+)"
                aria-label="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-mono font-bold text-emerald-400 py-1 select-none">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.max(0.6, Math.round((z - 0.3) * 10) / 10))}
                className="w-8 h-8 hover:bg-emerald-600 rounded-xl text-slate-200 hover:text-white transition-colors active:scale-95 flex items-center justify-center font-bold"
                title="Zoom Out (-)"
                aria-label="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="w-full h-px bg-slate-800 my-1" />
              <button
                onClick={handleResetView}
                className="w-8 h-8 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors active:scale-95 flex items-center justify-center"
                title="Reset View"
                aria-label="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Directional Arrow Panning Controls (N, S, E, W) */}
            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-1.5 shadow-2xl backdrop-blur-md grid grid-cols-3 gap-1 w-24">
              <div />
              <button
                onClick={() => panBy(0, 60)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center active:scale-95"
                title="Pan North"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <div />

              <button
                onClick={() => panBy(60, 0)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center active:scale-95"
                title="Pan West"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPan({ x: 0, y: 0 })}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-emerald-400 flex items-center justify-center active:scale-95"
                title="Center Pan"
              >
                <Crosshair className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => panBy(-60, 0)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center active:scale-95"
                title="Pan East"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div />
              <button
                onClick={() => panBy(0, -60)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center active:scale-95"
                title="Pan South"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <div />
            </div>
          </div>

          {/* Bottom Coordinates & Compass HUD Bar */}
          <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2">
            {/* Real-time GPS Tracker HUD */}
            <div className="px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-700 text-xs shadow-2xl backdrop-blur-md flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-slate-300 text-[11px]">
                {hoverCoords
                  ? `${hoverCoords.lat.toFixed(4)}°N, ${hoverCoords.lon.toFixed(4)}°E`
                  : '19.0435°N, 72.8567°E'}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold border-l border-slate-700 pl-2">
                Mumbai MMR GIS
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-2xl bg-slate-900/80 border border-slate-700 text-[11px] text-slate-400 flex items-center gap-1.5 hidden sm:flex">
              <span>Drag to Pan</span>
              <span>•</span>
              <span>Scroll to Zoom</span>
            </div>
          </div>

          {/* Active Entity Inspector Popup Card */}
          {selectedEntity && (
            <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-md p-4 rounded-3xl bg-slate-900/95 border-2 border-emerald-500/50 shadow-2xl backdrop-blur-md text-xs space-y-3 z-30 animate-in fade-in">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {selectedEntity.extraBadge || selectedEntity.type.toUpperCase()}
                  </span>
                  <h4 className="font-black text-slate-100 text-sm mt-1">
                    {selectedEntity.title}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <p className="text-slate-300 leading-relaxed text-xs">{selectedEntity.details}</p>

              {/* Key Metrics Strip */}
              {selectedEntity.metrics && (
                <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                  {Object.entries(selectedEntity.metrics).map(([key, val]) => (
                    <div key={key}>
                      <span className="text-slate-400 block text-[10px]">{key}:</span>
                      <span className="font-bold text-slate-200">{val}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                <span>
                  {selectedEntity.lat.toFixed(4)}°N, {selectedEntity.lon.toFixed(4)}°E
                </span>
                <button
                  onClick={() => focusOnCoordinates(selectedEntity.lat, selectedEntity.lon, 2.5)}
                  className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  <Crosshair className="w-3 h-3" />
                  Center Camera
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Searchable Entity Directory & Quick Locator Sidebar (Col-Span 1) */}
        <div
          className={`rounded-3xl bg-slate-800/80 border border-slate-700 p-4 flex flex-col gap-3 shadow-xl backdrop-blur-md overflow-hidden ${
            isFullscreen ? 'h-full' : 'h-[560px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-emerald-400" />
              Live Entity Finder
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-slate-400 border border-slate-700">
              {filteredEntities.length} Total
            </span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Lot, Recycler, or Area..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="grid grid-cols-4 gap-1 text-[10px] font-bold">
            {(['all', 'lots', 'recyclers', 'handovers'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-1 rounded-lg uppercase transition-all ${
                  activeTab === tab
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Scrollable Entity List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
            {filteredEntities.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No matching markers found in MMR zone.
              </div>
            ) : (
              filteredEntities.map((ent) => (
                <div
                  key={`${ent.type}-${ent.id}`}
                  onClick={() => {
                    focusOnCoordinates(ent.lat, ent.lon, 2.4);
                    setSelectedEntity({
                      type: ent.type,
                      title: ent.title,
                      details: ent.subtitle,
                      lat: ent.lat,
                      lon: ent.lon,
                      extraBadge: ent.badge,
                    });
                  }}
                  className="p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-750 hover:border-emerald-500/50 transition-all cursor-pointer text-xs space-y-1 group active:scale-98"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-slate-200 group-hover:text-emerald-300 transition-colors truncate">
                      {ent.title}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold border ${ent.color}`}
                    >
                      {ent.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{ent.subtitle}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                    <span>
                      {ent.lat.toFixed(3)}°N, {ent.lon.toFixed(3)}°E
                    </span>
                    <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                      Locate →
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
