import React from 'react';
import { Bookmark, Sparkles, UploadCloud } from 'lucide-react';

interface TopBarProps {
  savedCount: number;
  onOpenLookbook: () => void;
  onReset: () => void;
  onScrollToSamples: () => void;
  onScrollToPhilosophy: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  savedCount,
  onOpenLookbook,
  onReset,
  onScrollToSamples,
  onScrollToPhilosophy,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-[#E8E4DF] transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={onReset}
          className="text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 rounded-sm"
        >
          <span className="font-serif text-2xl tracking-tight text-[#171717] group-hover:text-stone-700 transition-colors whitespace-nowrap shrink-0">
            Atelier
          </span>
          <span className="text-xs font-sans uppercase tracking-[0.2em] text-stone-500 ml-2 hidden sm:inline">
            Virtual Stylist
          </span>
        </button>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs uppercase tracking-widest font-medium text-stone-600">
          <button
            onClick={onReset}
            className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Studio
          </button>
          <button
            onClick={onScrollToSamples}
            className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Wardrobe Samples
          </button>
          <button
            onClick={onScrollToPhilosophy}
            className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Styling Method
          </button>
          <button
            onClick={onOpenLookbook}
            className="hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>Saved Looks</span>
            {savedCount > 0 && (
              <span className="text-[11px] font-mono tabular-nums text-stone-900 bg-stone-200/80 px-1.5 py-0.2 rounded-sm">
                {savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenLookbook}
            className="px-4 py-2 text-xs font-medium uppercase tracking-wider text-stone-900 bg-[#EFECE6] hover:bg-[#E5DFD7] border border-[#DDD7CD] rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2"
          >
            <Bookmark className="w-3.5 h-3.5 text-stone-700" />
            <span>Lookbook</span>
            {savedCount > 0 && (
              <span className="font-mono tabular-nums text-stone-700">({savedCount})</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
