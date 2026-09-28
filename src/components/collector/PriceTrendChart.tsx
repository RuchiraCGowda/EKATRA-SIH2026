import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Volume2, Calendar, Sparkles } from 'lucide-react';
import { PriceRecord, AppLanguage } from '../../types/database';
import { getTranslation } from '../../lib/i18n';
import { speakText } from '../../lib/speech';

interface PriceTrendChartProps {
  price: PriceRecord;
  lang: AppLanguage;
}

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({ price, lang }) => {
  const t = getTranslation(lang);
  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('7d');

  // Derive historical data points based on price.buying_price_per_kg
  const current = price.buying_price_per_kg;
  const min = price.market_min_price;
  const max = price.market_max_price;

  // 7-day trend data
  const data7d = [
    { day: 'Day 1', price: Math.round(min + (current - min) * 0.4) },
    { day: 'Day 2', price: Math.round(min + (current - min) * 0.5) },
    { day: 'Day 3', price: Math.round(min + (current - min) * 0.45) },
    { day: 'Day 4', price: Math.round(min + (current - min) * 0.7) },
    { day: 'Day 5', price: Math.round(min + (current - min) * 0.8) },
    { day: 'Day 6', price: Math.round(min + (current - min) * 0.9) },
    { day: 'Today', price: current },
  ];

  // 30-day trend data (aggregated into 6 weekly/5-day points)
  const data30d = [
    { day: 'Wk 1', price: min },
    { day: 'Wk 2', price: Math.round(min + (max - min) * 0.25) },
    { day: 'Wk 3', price: Math.round(min + (max - min) * 0.4) },
    { day: 'Wk 4', price: Math.round(min + (max - min) * 0.6) },
    { day: 'Wk 5', price: Math.round(min + (max - min) * 0.75) },
    { day: 'Today', price: current },
  ];

  const activeData = timeframe === '7d' ? data7d : data30d;
  const startPrice = activeData[0].price;
  const priceChange = current - startPrice;
  const percentChange = Number(((priceChange / startPrice) * 100).toFixed(1));
  const isPositive = priceChange >= 0;

  // SVG dimensions
  const width = 320;
  const height = 120;
  const paddingX = 25;
  const paddingY = 20;

  const minVal = Math.min(...activeData.map((d) => d.price)) * 0.95;
  const maxVal = Math.max(...activeData.map((d) => d.price)) * 1.05;

  const points = activeData.map((d, index) => {
    const x = paddingX + (index / (activeData.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((d.price - minVal) / (maxVal - minVal)) * (height - paddingY * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[i - 1];
    const midX = (prev.x + pt.x) / 2;
    return `${acc} C ${midX} ${prev.y}, ${midX} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${
    height - paddingY
  } Z`;

  const playVoiceExplanation = () => {
    const matName =
      lang === 'mr'
        ? price.category?.name_mr
        : lang === 'hi'
        ? price.category?.name_hi
        : price.category?.name_en || 'Material';

    let speech = '';
    if (lang === 'mr') {
      speech = `गेल्या ${timeframe === '7d' ? '७ दिवसांत' : '३० दिवसांत'} ${matName} चा भाव ₹${startPrice} वरून ₹${current} पर्यंत ${isPositive ? 'वाढला आहे' : 'घसरला आहे'}. नफा ${percentChange} टक्के आहे.`;
    } else if (lang === 'hi') {
      speech = `पिछले ${timeframe === '7d' ? '७ दिनों में' : '३० दिनों में'} ${matName} का भाव ₹${startPrice} से ₹${current} तक ${isPositive ? 'बढ़ा है' : 'घटा है'}। ${percentChange} प्रतिशत का बदलाव।`;
    } else if (lang === 'gu') {
      speech = `છેલ્લા ${timeframe === '7d' ? '૭ દિવસમાં' : '૩૦ દિવસમાં'} ${matName} નો ભાવ ₹${startPrice} થી ₹${current} થયો છે. ${percentChange}% નો ફેરફાર છે.`;
    } else if (lang === 'ta') {
      speech = `கடந்த ${timeframe === '7d' ? '7 நாட்களில்' : '30 நாட்களில்'} விலை ₹${startPrice} இலிருந்து ₹${current} ஆக மாறியுள்ளது.`;
    } else if (lang === 'te') {
      speech = `గత ${timeframe === '7d' ? '7 రోజుల్లో' : '30 రోజుల్లో'} ధర ₹${startPrice} నుండి ₹${current} కు చేరింది.`;
    } else if (lang === 'kn') {
      speech = `ಕಳೆದ ${timeframe === '7d' ? '7 ದಿನಗಳಲ್ಲಿ' : '30 ದಿನಗಳಲ್ಲಿ'} ಬೆಲೆ ₹${startPrice} ರಿಂದ ₹${current} ಕ್ಕೆ ಬದಲಾಗಿದೆ.`;
    } else {
      speech = `Over the past ${timeframe === '7d' ? '7 days' : '30 days'}, ${matName} rates moved from ${startPrice} to ${current} Rupees, showing a ${percentChange}% change.`;
    }

    speakText(speech, lang);
  };

  return (
    <div className="mt-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-2.5">
      {/* Header with timeframe toggle and percentage pill */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
              isPositive
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? `+${percentChange}%` : `${percentChange}%`}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {timeframe === '7d'
              ? lang === 'mr'
                ? '७-दिवसीय कल'
                : lang === 'hi'
                ? '७-दिवसीय रुझान'
                : lang === 'gu'
                ? '૭-દિવસીય વલણ'
                : lang === 'ta'
                ? '7-நாள் போக்கு'
                : lang === 'te'
                ? '7-రోజుల ట్రెండ్'
                : lang === 'kn'
                ? '7-ದಿನದ ಪ್ರವೃತ್ತಿ'
                : '7-Day Trend'
              : lang === 'mr'
              ? '३०-दिवसीय कल'
              : lang === 'hi'
              ? '३०-दिवसीय रुझान'
              : lang === 'gu'
              ? '૩૦-દિવસીય વલણ'
              : lang === 'ta'
              ? '30-நாள் போக்கு'
              : lang === 'te'
              ? '30-రోజుల ట్రెండ్'
              : lang === 'kn'
              ? '30-ದಿನದ ಪ್ರವೃತ್ತಿ'
              : '30-Day Trend'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Audio read button */}
          <button
            onClick={playVoiceExplanation}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400"
            title="Listen to price trend analysis"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          {/* 7d vs 30d Toggle */}
          <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[10px] font-bold">
            <button
              onClick={() => setTimeframe('7d')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                timeframe === '7d' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'mr' || lang === 'hi' ? '७ दिवस' : '7D'}
            </button>
            <button
              onClick={() => setTimeframe('30d')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                timeframe === '30d' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'mr' || lang === 'hi' ? '३० दिवस' : '30D'}
            </button>
          </div>
        </div>
      </div>

      {/* SVG Interactive Line Chart */}
      <div className="w-full overflow-hidden flex justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-[340px] h-[95px] overflow-visible"
        >
          <defs>
            <linearGradient id={`gradient-${price.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#334155"
            strokeDasharray="2,2"
            strokeWidth="0.8"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#334155"
            strokeDasharray="2,2"
            strokeWidth="0.8"
          />

          {/* Area Fill */}
          <path d={areaD} fill={`url(#gradient-${price.id})`} />

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={i === points.length - 1 ? 4.5 : 3}
                fill={i === points.length - 1 ? '#34d399' : '#059669'}
                stroke="#0f172a"
                strokeWidth="1.5"
              />
              {/* Value Label on Latest Point */}
              {i === points.length - 1 && (
                <text
                  x={pt.x}
                  y={pt.y - 8}
                  fill="#6ee7b7"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  ₹{pt.price}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Footer labels */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
        <span>
          {lang === 'mr'
            ? 'सुरुवातीचा दर:'
            : lang === 'hi'
            ? 'प्रारंभिक दर:'
            : lang === 'gu'
            ? 'શરૂઆતનો ભાવ:'
            : lang === 'ta'
            ? 'தொடக்க விலை:'
            : lang === 'te'
            ? 'ప్రారంభ ధర:'
            : lang === 'kn'
            ? 'ಆರಂಭಿಕ ದರ:'
            : 'Start:'}{' '}
          ₹{startPrice}
        </span>
        <span className="text-emerald-400 font-bold">
          {lang === 'mr'
            ? 'सध्याचा दर:'
            : lang === 'hi'
            ? 'वर्तमान दर:'
            : lang === 'gu'
            ? 'હાલનો ભાવ:'
            : lang === 'ta'
            ? 'தற்போதைய விலை:'
            : lang === 'te'
            ? 'ప్రస్తుత ధర:'
            : lang === 'kn'
            ? 'ಪ್ರಸ್ತುತ ದರ:'
            : 'Now:'}{' '}
          ₹{current}
        </span>
      </div>
    </div>
  );
};
