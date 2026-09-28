import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Info,
  CheckCheck,
  Paperclip,
  RefreshCw,
  Camera,
  Image as ImageIcon,
  Zap,
  Pickaxe,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { AppLanguage } from '../../types/database';
import { ChannelMessage } from '../../lib/channels/channelTypes';
import { ChannelService } from '../../lib/channels/channelService';
import { getTranslation } from '../../lib/i18n';
import { compressImageFile } from '../../lib/imageUtils';
import { MetallurgyCard } from '../common/MetallurgyCard';
import { LiveCameraModal } from '../common/LiveCameraModal';

interface WhatsAppDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  onDataChanged?: () => void;
  onNavigateToLots?: () => void;
}

export const WhatsAppDemoModal: React.FC<WhatsAppDemoModalProps> = ({
  isOpen,
  onClose,
  lang,
  onDataChanged,
  onNavigateToLots,
}) => {
  const t = getTranslation(lang);
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [quickOptions, setQuickOptions] = useState<string[]>([]);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const sessionKey = 'whatsapp_demo_user';

  // Curated High-Definition SIH Scrap Samples for 1-click test
  const sampleScrapPhotos = [
    {
      title: 'Server PCB Motherboard',
      category: 'PCB',
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
      badge: 'High Gold & Copper',
    },
    {
      title: 'Heavy Copper Cable',
      category: 'CABLE',
      url: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=600&q=80',
      badge: '99% Pure Cu',
    },
    {
      title: 'Inverter Battery',
      category: 'BATTERY',
      url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
      badge: 'Cobalt & Lithium',
    },
    {
      title: 'Smartphones Scrap',
      category: 'PCB',
      url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
      badge: 'Precious Metals',
    },
    {
      title: 'CRT Deflection Coils',
      category: 'CRT',
      url: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=600&q=80',
      badge: 'Lead & Copper',
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Start session with welcome message
      handleSendMessage('hi', true);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isAnalyzingPhoto]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string, isInitial = false) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    // Check if the quick option is one of the SIH sample photos
    const sampleMatch = sampleScrapPhotos.find(
      (s) =>
        s.title.toLowerCase().includes(text.toLowerCase()) ||
        s.category.toLowerCase() === text.toUpperCase() ||
        text.toLowerCase().includes(s.category.toLowerCase()) ||
        text.toLowerCase().includes('motherboard') ||
        (text.toLowerCase().includes('copper') && s.category === 'CABLE') ||
        (text.toLowerCase().includes('battery') && s.category === 'BATTERY')
    );

    if (!isInitial && sampleMatch && (text.includes('PCB') || text.includes('Cable') || text.includes('Battery') || text.includes('CRT') || text.includes('Motherboard'))) {
      handlePhotoSelected(sampleMatch.url, `Scanned scrap photo: ${sampleMatch.title}`);
      return;
    }

    if (!isInitial && text.toLowerCase().includes('photo') && (text.includes('AI') || text.includes('📸'))) {
      setShowAttachmentMenu(true);
      return;
    }

    if (!isInitial) {
      const userMsg: ChannelMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: 'whatsapp',
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputText('');
    }

    setIsTyping(true);
    setQuickOptions([]);

    setTimeout(async () => {
      try {
        const response = await ChannelService.processWhatsAppMessage(sessionKey, text, lang);
        const botMsg: ChannelMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: response.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          channel: 'whatsapp',
          metadata: {
            lotCode: response.createdLot?.lot_code,
            options: response.options,
          },
        };

        setMessages((prev) => [...prev, botMsg]);
        if (response.options) {
          setQuickOptions(response.options);
        }

        if (response.createdLot) {
          onDataChanged?.();
        }
      } catch (e) {
        console.error('WhatsApp Channel Error:', e);
      } finally {
        setIsTyping(false);
      }
    }, 600);
  };

  // Handle Photo Upload / Capture in WhatsApp
  const handlePhotoSelected = async (imageUrl: string, caption = 'Scrap photo for AI valuation') => {
    setShowAttachmentMenu(false);

    // 1. Post user's outgoing image message
    const userImgMsg: ChannelMessage = {
      id: `user-img-${Date.now()}`,
      sender: 'user',
      text: caption,
      imageUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: 'whatsapp',
    };

    setMessages((prev) => [...prev, userImgMsg]);
    setIsAnalyzingPhoto(true);
    setIsTyping(true);
    setQuickOptions([]);

    // 2. Call ChannelService to run AI recognition & metallurgical analysis
    try {
      const response = await ChannelService.processWhatsAppImageMessage(sessionKey, imageUrl, lang);
      const botMsg: ChannelMessage = {
        id: `bot-analysis-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: 'whatsapp',
        metadata: {
          metallurgy: response.metallurgy,
          options: response.options,
        },
      };

      setMessages((prev) => [...prev, botMsg]);
      if (response.options) {
        setQuickOptions(response.options);
      }
    } catch (e) {
      console.error('WhatsApp Image Processing Error:', e);
    } finally {
      setIsAnalyzingPhoto(false);
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file);
      handlePhotoSelected(compressed, 'E-waste scrap photo from device');
    } catch (err) {
      console.error('Error compressing WhatsApp photo:', err);
    } finally {
      e.target.value = '';
    }
  };

  const handleResetChat = () => {
    ChannelService.resetSession(sessionKey);
    setMessages([]);
    setQuickOptions([]);
    setIsAnalyzingPhoto(false);
    setTimeout(() => {
      handleSendMessage('hi', true);
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0b141a] border border-[#222d34] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[92vh] max-h-[800px] relative">
        {/* Hidden File Inputs for Device Gallery and Camera */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* WhatsApp Header */}
        <div className="px-4 py-3 bg-[#202c33] flex items-center justify-between border-b border-[#2a3942]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold shadow">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#202c33]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white tracking-wide truncate">
                  EKATRA AI Assistant
                </h3>
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
              <p className="text-[11px] text-emerald-400 font-medium truncate">
                CPCB Form 6 Verified • Real-Time AI Vision
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 text-slate-300 shrink-0">
            <button
              onClick={handleResetChat}
              className="p-1.5 hover:bg-[#374248] rounded-full text-slate-400 hover:text-white transition-colors"
              title="Reset Chat"
              aria-label="Reset Chat"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#374248] rounded-full text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Body with WhatsApp Background */}
        <div
          className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#0b141a]"
          style={{
            backgroundImage:
              'radial-gradient(#1f2c34 1px, transparent 1px), radial-gradient(#1f2c34 1px, #0b141a 1px)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        >
          <div className="flex justify-center">
            <span className="bg-[#182229] border border-[#222d34] text-[10px] text-slate-400 px-3 py-1 rounded-lg text-center shadow">
              🔒 End-to-end verified with CPCB/SPCB portal • Direct Database Link
            </span>
          </div>

          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm shadow leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-[#005c4b] text-emerald-50 rounded-tr-none'
                      : 'bg-[#202c33] text-slate-100 rounded-tl-none border border-[#2a3942]'
                  }`}
                >
                  {/* Photo Preview inside WhatsApp Bubble */}
                  {msg.imageUrl && (
                    <div className="mb-2 rounded-xl overflow-hidden border border-black/30 max-w-[280px] bg-black/50 shadow-md">
                      <img
                        src={msg.imageUrl}
                        alt="Uploaded Scrap"
                        className="w-full h-44 object-cover"
                      />
                      <div className="p-1.5 bg-[#0b141a]/95 text-[10px] text-slate-300 flex items-center justify-between">
                        <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>AI Scanned Image</span>
                        </span>
                        <span className="text-amber-400 text-[9px] font-mono font-bold bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/30">
                          HD Vision
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Message Text */}
                  <div>{msg.text}</div>

                  {/* VISUAL METALLURGICAL PERCENTAGE CARD INSIDE WHATSAPP MESSAGE */}
                  {msg.metadata?.metallurgy && (
                    <div className="mt-3">
                      <MetallurgyCard
                        metallurgy={msg.metadata.metallurgy}
                        approxWeightKg={15}
                        lang={lang}
                        compact={true}
                      />
                    </div>
                  )}

                  {/* Lot code reference with direct jump to Dashboard */}
                  {msg.metadata?.lotCode && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-amber-300">
                        📦 Lot: {msg.metadata.lotCode}
                      </span>
                      {onNavigateToLots && (
                        <button
                          onClick={() => {
                            onClose();
                            onNavigateToLots();
                          }}
                          className="text-[11px] text-emerald-400 hover:underline font-bold flex items-center gap-1"
                        >
                          <span>Open Lot & Track GPS</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    {isUser && <CheckCheck className="w-3.5 h-3.5 text-sky-400" />}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Real-time AI Vision Scanning HUD Animation */}
          {isAnalyzingPhoto && (
            <div className="bg-[#202c33] border-2 border-emerald-500/50 rounded-2xl p-3.5 max-w-[88%] text-xs shadow-xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>AI Vision Analyzing Scrap Photo...</span>
                </span>
                <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-500/20 px-1.5 py-0.5 rounded">
                  Inference Active
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Directly recognizing material, calculating exact percentage of metals & urban mines (Gold Au, Silver Ag, Palladium Pd, Copper Cu), and evaluating CPCB benchmark price...
              </p>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 via-amber-400 to-teal-400 h-full w-3/4 animate-pulse rounded-full" />
              </div>
            </div>
          )}

          {isTyping && !isAnalyzingPhoto && (
            <div className="flex items-center gap-1.5 bg-[#202c33] border border-[#2a3942] rounded-2xl px-3.5 py-2 w-20 text-slate-400 text-xs shadow">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Attachment Sheet / Photo Upload Popover */}
        {showAttachmentMenu && (
          <div className="bg-[#1f2c34] border-t border-[#2a3942] p-3 space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between text-xs text-slate-200 font-bold">
              <span>Send E-Waste Photo for AI Metal & Mine Percentage Scan</span>
              <button
                onClick={() => setShowAttachmentMenu(false)}
                className="text-slate-400 hover:text-white p-1 text-xs"
              >
                ✕
              </button>
            </div>

            {/* Camera & File Upload Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAttachmentMenu(false);
                  setIsLiveCameraOpen(true);
                }}
                className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Take Live Photo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAttachmentMenu(false);
                  fileInputRef.current?.click();
                }}
                className="p-2.5 rounded-2xl bg-[#2a3942] hover:bg-[#374248] text-slate-100 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 shadow-md active:scale-95 transition-all"
              >
                <ImageIcon className="w-4 h-4 text-teal-400" />
                <span>Upload from Gallery</span>
              </button>
            </div>

            {/* Quick Sample Photos Strip */}
            <div className="pt-2 border-t border-[#2a3942] space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-amber-300 font-mono font-bold">
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Quick Scrap Samples (Tap to Scan):</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Tap to scan</span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {sampleScrapPhotos.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePhotoSelected(s.url, `Scanned scrap photo: ${s.title}`)}
                    className="p-1 rounded-xl bg-[#2a3942] hover:bg-[#374248] border border-slate-700 text-center flex flex-col items-center gap-1 hover:border-emerald-500/50 transition-all group"
                  >
                    <img
                      src={s.url}
                      alt={s.title}
                      className="w-10 h-10 object-cover rounded-lg group-hover:scale-105 transition-transform"
                    />
                    <span className="text-[9px] text-slate-300 font-medium truncate w-full block">
                      {s.title.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Interactive Quick Reply Suggestions */}
        {quickOptions.length > 0 && (
          <div className="px-3 py-2 bg-[#182229] border-t border-[#222d34] flex gap-2 overflow-x-auto no-scrollbar">
            {quickOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(opt)}
                className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-[#202c33] hover:bg-[#005c4b] border border-[#2a3942] hover:border-emerald-500/50 text-emerald-300 font-medium transition-all shadow-sm active:scale-95"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-2.5 bg-[#202c33] border-t border-[#2a3942] flex items-center gap-1.5 sm:gap-2">
          {/* Attachment Paperclip Button */}
          <button
            type="button"
            onClick={() => setShowAttachmentMenu((prev) => !prev)}
            className={`p-2.5 rounded-xl transition-all shadow shrink-0 ${
              showAttachmentMenu
                ? 'bg-emerald-600 text-white'
                : 'bg-[#2a3942] text-slate-300 hover:text-white hover:bg-[#374248]'
            }`}
            title="Attach e-waste photo or sample"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Camera Quick Button */}
          <button
            type="button"
            onClick={() => setIsLiveCameraOpen(true)}
            className="p-2.5 rounded-xl bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all shadow shrink-0 border border-emerald-500/40"
            title="Take live photo with camera"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Gallery Quick Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-[#2a3942] text-teal-400 hover:text-white hover:bg-[#374248] transition-all shadow shrink-0 border border-slate-700"
            title="Upload photo from gallery"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={
              lang === 'mr'
                ? 'संदेश लिहा किंवा फोटो जोडा...'
                : lang === 'hi'
                ? 'संदेश लिखें या फोटो जोड़ें...'
                : 'Type message or attach photo...'
            }
            className="flex-1 bg-[#2a3942] text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400 min-w-0"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold transition-all shadow active:scale-95 shrink-0"
            title="Send WhatsApp message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Educational Caption */}
        <div className="bg-[#111b21] px-3 py-1.5 text-center text-[10px] text-slate-400 flex items-center justify-between border-t border-[#1f2c34]">
          <span className="truncate">MeitY & CPCB Aligned Omni-Channel Bridge</span>
          <span className="text-emerald-400 font-mono shrink-0 ml-2">Shared EkatraDB</span>
        </div>
      </div>

      {/* Live Camera Viewfinder Modal */}
      <LiveCameraModal
        isOpen={isLiveCameraOpen}
        onClose={() => setIsLiveCameraOpen(false)}
        onCapture={(dataUrl) => {
          setIsLiveCameraOpen(false);
          handlePhotoSelected(dataUrl, 'Live camera capture of e-waste scrap');
        }}
        lang={lang}
      />
    </div>
  );
};
