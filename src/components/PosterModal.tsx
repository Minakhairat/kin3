import React, { useState } from 'react';
import { COMPANY_INFO } from '../data/content';
import { Language } from '../types';
import { X, Download, MessageCircle, ExternalLink } from 'lucide-react';

interface PosterModalProps {
  initialType: 'podcasts' | 'reels';
  lang: Language;
  onClose: () => void;
}

export const PosterModal: React.FC<PosterModalProps> = ({
  initialType,
  lang,
  onClose,
}) => {
  const [currentType, setCurrentType] = useState<'podcasts' | 'reels'>(initialType);

  const posterSrc =
    currentType === 'podcasts'
      ? COMPANY_INFO.images.podcastPoster
      : COMPANY_INFO.images.reelsPoster;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div
        className="relative w-full max-w-3xl bg-[#141211] text-white rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase text-[#C82626] font-bold">
              {lang === 'ar' ? 'البوستر الرسمي' : 'Official Flyer'}
            </span>
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-lg text-xs">
              <button
                onClick={() => setCurrentType('podcasts')}
                className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
                  currentType === 'podcasts' ? 'bg-[#C82626] text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                {lang === 'ar' ? 'بودكاست ولقاءات' : 'Podcasts'}
              </button>
              <button
                onClick={() => setCurrentType('reels')}
                className={`px-3 py-1 rounded font-semibold transition-colors cursor-pointer ${
                  currentType === 'reels' ? 'bg-[#C82626] text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                {lang === 'ar' ? 'ريلز شهرية' : 'Monthly Reels'}
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Poster Image Container */}
        <div className="overflow-y-auto p-4 flex justify-center bg-black/80">
          <img
            src={posterSrc}
            alt={currentType === 'podcasts' ? 'KIN Podcasts Pricing Poster' : 'KIN Reels Pricing Poster'}
            className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl border border-white/10"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/60 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-white/70 font-mono">
            <span>KEEP IT NEAT · KIN MEDIA PRODUCTION</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={posterSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs font-semibold text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'عرض بالحجم الكامل' : 'Open Full Res'}</span>
            </a>

            <a
              href={`https://wa.me/${COMPANY_INFO.whatsappNumbers[0]}?text=${encodeURIComponent(
                lang === 'ar'
                  ? `مرحباً KIN Media Production، أود حجز إحدى الباقات الموضحة في بوستر ${currentType === 'podcasts' ? 'البودكاست' : 'الريلز'}`
                  : `Hello KIN Media Production, I would like to book a package from the ${currentType} pricing poster.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-bold text-white bg-[#C82626] hover:bg-[#a31d1d] rounded transition-colors flex items-center gap-1.5 shadow"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'حجز عبر واتساب' : 'Book on WhatsApp'}</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
