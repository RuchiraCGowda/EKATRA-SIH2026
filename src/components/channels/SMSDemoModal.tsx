import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Smartphone,
  Info,
  RefreshCw,
  Hash,
  Terminal,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { AppLanguage, Lot } from '../../types/database';
import { ChannelMessage } from '../../lib/channels/channelTypes';
import { ChannelService } from '../../lib/channels/channelService';
import { getTranslation } from '../../lib/i18n';

interface SMSDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  onDataChanged?: () => void;
  onNavigateToLots?: () => void;
}

export const SMSDemoModal: React.FC<SMSDemoModalProps> = ({
  isOpen,
  onClose,
  lang,
  onDataChanged,
  onNavigateToLots,
}) => {
  const t = getTranslation(lang);
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial SMS greeting
      setMessages([
        {
          id: 'sms-welcome',
          sender: 'bot',
          text: `EKATRA Demo Gateway (567678):\nWelcome! Text PRICE, STATUS, or HELP. Free SMS service for informal e-waste collectors.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          channel: 'sms',
        },
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  const handleSendSMS = async (commandToSend?: string) => {
    const text = (commandToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChannelMessage = {
      id: `sms-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: 'sms',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(async () => {
      try {
        const response = await ChannelService.processSMSMessage(text, lang);
        const botMsg: ChannelMessage = {
          id: `sms-bot-${Date.now()}`,
          sender: 'bot',
          text: response.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          channel: 'sms',
          metadata: {
            lotCode: response.createdLot?.lot_code,
          },
        };

        setMessages((prev) => [...prev, botMsg]);

        if (response.createdLot) {
          onDataChanged?.();
        }
      } catch (e) {
        console.error('SMS Channel Error:', e);
      }
    }, 450);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'sms-welcome-reset',
        sender: 'bot',
        text: `EKATRA Demo Gateway (567678):\nWelcome! Text PRICE, STATUS, or HELP. Free SMS service for informal e-waste collectors.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: 'sms',
      },
    ]);
  };

  const sampleCommands = [
    'PRICE PCB',
    'PRICE BATTERY',
    'MY LOTS',
    'STATUS',
    'SELL PCB 20',
    'HELP',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[88vh] max-h-[720px]">
        {/* Prototype Simulation Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 py-1.5 flex items-center justify-between text-[11px] text-amber-300">
          <div className="flex items-center gap-1.5 font-medium">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>SMS Demo — Prototype Simulation</strong> (Feature Phone Access)
            </span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors"
            title="Reset SMS history"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Feature Phone / SMS App Header */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-100">EKATRA-SMS</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                  567678
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Short Code Service • Shared DB</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Command Toolbar for SIH Jury & Testing */}
        <div className="px-3 py-2 bg-slate-800/60 border-b border-slate-700/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Terminal className="w-3 h-3 text-emerald-400" />
            Try:
          </span>
          {sampleCommands.map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleSendSMS(cmd)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-700/80 hover:bg-emerald-600 text-slate-200 hover:text-white font-mono text-[11px] border border-slate-600 transition-all active:scale-95"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* SMS Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950 font-sans">
          <div className="text-center">
            <span className="text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
              Standard SMS rates waived • Gov E-Waste Gateway
            </span>
          </div>

          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm shadow-md whitespace-pre-wrap ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none font-mono'
                      : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700 font-mono'
                  }`}
                >
                  {msg.text}

                  {msg.metadata?.lotCode && (
                    <div className="mt-2 pt-2 border-t border-slate-700/80 flex items-center justify-between gap-2 font-sans">
                      <span className="text-[10px] text-amber-300 font-bold">
                        Linked: {msg.metadata.lotCode}
                      </span>
                      {onNavigateToLots && (
                        <button
                          onClick={() => {
                            onClose();
                            onNavigateToLots();
                          }}
                          className="text-[10px] text-emerald-400 hover:underline font-bold"
                        >
                          View in App &rarr;
                        </button>
                      )}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400/80 text-right mt-1 font-sans">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendSMS();
            }}
            placeholder="Type command (e.g. PRICE PCB or STATUS)..."
            className="flex-1 bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm font-mono px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />

          <button
            onClick={() => handleSendSMS()}
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold transition-all shadow"
            title="Send SMS"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Educational Disclaimer */}
        <div className="bg-slate-950 px-3 py-1.5 text-center text-[10px] text-slate-500 border-t border-slate-800">
          Simulation — no real SMS sent • Linked directly to EKATRA Database.
        </div>
      </div>
    </div>
  );
};
