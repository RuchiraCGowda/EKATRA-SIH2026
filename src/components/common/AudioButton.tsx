import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speakText, stopSpeech } from '../../lib/speech';
import { AppLanguage } from '../../types/database';

interface AudioButtonProps {
  textToSpeak: string;
  lang: AppLanguage;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  textToSpeak,
  lang,
  label,
  className = '',
  size = 'md',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      // If this button was playing when unmounted, make sure state is clean
      if (isPlaying) {
        setIsPlaying(false);
      }
    };
  }, [isPlaying]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakText(textToSpeak, lang, {
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false),
      });
    }
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label || 'Listen to audio guidance'}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all ${
        isPlaying
          ? 'bg-amber-500 text-slate-950 animate-pulse shadow-lg shadow-amber-500/25 ring-2 ring-amber-300'
          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 active:scale-95'
      } ${sizeClasses[size]} ${className}`}
      title={label || 'Click to listen in chosen language'}
    >
      {isPlaying ? (
        <VolumeX className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} />
      ) : (
        <Volume2 className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} />
      )}
      {label && <span>{label}</span>}
    </button>
  );
};
