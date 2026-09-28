import { AppLanguage } from '../types/database';
import { SUPPORTED_LANGUAGES } from './i18n';

let cachedVoices: SpeechSynthesisVoice[] = [];
let currentAudio: HTMLAudioElement | null = null;
let currentAbortController: AbortController | null = null;
let activeEndCallbacks: Set<() => void> = new Set();
let activeStartCallbacks: Set<() => void> = new Set();
let isCurrentlySpeaking = false;

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

/**
 * Plays a subtle, pleasant chime to immediately confirm user interaction
 * and ensure browser audio hardware is unmuted/active.
 */
function playAudioChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch {
    // AudioContext fallback ignored
  }
}

export function isSpeechActive(): boolean {
  return isCurrentlySpeaking;
}

/**
 * Stops any ongoing audio playback or speech synthesis immediately.
 */
export function stopSpeech(): void {
  isCurrentlySpeaking = false;

  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.src = '';
    currentAudio = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  // Trigger all active end callbacks
  const callbacks = Array.from(activeEndCallbacks);
  activeEndCallbacks.clear();
  activeStartCallbacks.clear();
  callbacks.forEach((cb) => {
    try {
      cb();
    } catch {
      // ignore
    }
  });
}

export interface SpeechOptions {
  onStart?: () => void;
  onEnd?: () => void;
  playChime?: boolean;
}

/**
 * Primary Native Indic Speech Synthesizer
 * Uses high-fidelity server TTS engine for authentic Marathi, Hindi, English, Gujarati, Tamil, Telugu, and Kannada.
 * Gracefully falls back to browser SpeechSynthesis if offline.
 */
export function speakText(
  text?: string,
  lang: AppLanguage = 'mr',
  options?: SpeechOptions | (() => void)
): void {
  const onEnd = typeof options === 'function' ? options : options?.onEnd;
  const onStart = typeof options === 'object' ? options?.onStart : undefined;
  const shouldPlayChime = typeof options === 'object' ? options?.playChime ?? true : true;

  // Always halt any existing playback
  stopSpeech();

  const meta = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];
  const textToSpeak = text && text.trim().length > 0 ? text.trim() : meta.greetingVoice;

  if (!textToSpeak) return;

  if (shouldPlayChime) {
    playAudioChime();
  }

  isCurrentlySpeaking = true;
  if (onStart) activeStartCallbacks.add(onStart);
  if (onEnd) activeEndCallbacks.add(onEnd);

  // Notify start
  activeStartCallbacks.forEach((cb) => {
    try {
      cb();
    } catch {
      // ignore
    }
  });

  const abortCtrl = new AbortController();
  currentAbortController = abortCtrl;

  // 1. Primary Strategy: High-fidelity native Indic TTS route
  const ttsUrl = `/api/tts?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(textToSpeak)}`;
  const audio = new Audio();
  currentAudio = audio;

  let fallbackAttempted = false;

  const triggerFallback = () => {
    if (fallbackAttempted) return;
    fallbackAttempted = true;
    speakWithWebSpeechFallback(textToSpeak, lang, onEnd);
  };

  audio.onended = () => {
    isCurrentlySpeaking = false;
    currentAudio = null;
    currentAbortController = null;
    const callbacks = Array.from(activeEndCallbacks);
    activeEndCallbacks.clear();
    activeStartCallbacks.clear();
    callbacks.forEach((cb) => {
      try {
        cb();
      } catch {
        // ignore
      }
    });
  };

  audio.onerror = (e) => {
    console.warn('Native TTS audio load error, trying Web Speech fallback...', e);
    currentAudio = null;
    triggerFallback();
  };

  audio.src = ttsUrl;
  audio.load();

  audio
    .play()
    .catch((err) => {
      // If audio autoplay was prevented by browser or stream failed, try Web Speech fallback
      if (err.name !== 'AbortError') {
        console.warn('Audio play failed, falling back to Web Speech:', err.message);
        triggerFallback();
      }
    });
}

/**
 * Secondary Offline / Client-Side Fallback using Web Speech API
 */
function speakWithWebSpeechFallback(
  textToSpeak: string,
  lang: AppLanguage,
  onEnd?: () => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    isCurrentlySpeaking = false;
    onEnd?.();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const meta = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];
    if (cachedVoices.length === 0) {
      cachedVoices = window.speechSynthesis.getVoices();
    }
    const voices = cachedVoices;

    const langLocales: Record<AppLanguage, string[]> = {
      mr: ['mr-IN', 'mr_IN', 'mr', 'hi-IN', 'hi'],
      hi: ['hi-IN', 'hi_IN', 'hi'],
      en: ['en-IN', 'en-GB', 'en-US', 'en'],
      gu: ['gu-IN', 'gu_IN', 'gu', 'hi-IN'],
      ta: ['ta-IN', 'ta_IN', 'ta'],
      te: ['te-IN', 'te_IN', 'te'],
      kn: ['kn-IN', 'kn_IN', 'kn'],
    };

    const targetLocales = langLocales[lang] || ['en-IN', 'en'];

    // Search for matching voice
    const chosenVoice =
      voices.find((v) => {
        const vLang = v.lang.toLowerCase().replace('_', '-');
        return targetLocales.some((loc) => vLang.startsWith(loc.toLowerCase()));
      }) ||
      voices.find((v) => v.lang.toLowerCase().startsWith('hi')) ||
      voices.find((v) => v.lang.toLowerCase().startsWith('en-in')) ||
      voices[0];

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.lang = chosenVoice?.lang || targetLocales[0] || 'en-IN';

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    utterance.onend = () => {
      isCurrentlySpeaking = false;
      onEnd?.();
    };

    utterance.onerror = () => {
      isCurrentlySpeaking = false;
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('Web Speech fallback error:', error);
    isCurrentlySpeaking = false;
    onEnd?.();
  }
}
