import React, { useState } from 'react';
import { ItemAnalysis } from '../types/stylist';
import { Palette, Sparkles, AlertCircle, Compass, Check, Copy } from 'lucide-react';

interface ItemAnalysisCardProps {
  analysis: ItemAnalysis;
  itemImage: string;
}

export const ItemAnalysisCard: React.FC<ItemAnalysisCardProps> = ({ analysis, itemImage }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  return (
    <section className="bg-white rounded-lg border border-[#E8E4DF] p-6 lg:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] my-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left: Thumbnail & Badges */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col items-center sm:items-start">
          <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-stone-100 border border-[#E8E4DF] shadow-xs">
            <img
              src={itemImage}
              alt={analysis.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain p-2"
            />
          </div>
          <div className="mt-3 w-full">
            <span className="text-[11px] font-mono uppercase tracking-widest text-stone-500 block">
              Item Archetype
            </span>
            <p className="font-serif text-base font-semibold text-stone-900 mt-0.5">
              {analysis.styleArchetype}
            </p>
            <p className="text-xs text-stone-500 mt-1">
              {analysis.category} · {analysis.silhouette}
            </p>
          </div>
        </div>

        {/* Right: Detailed Analysis Breakdown */}
        <div className="flex-1 w-full space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-stone-500 mb-1">
              <span>Atelier Garment Deconstruction</span>
              <span aria-hidden="true">·</span>
              <span>100% Tailored Harmony</span>
            </div>
            <h2 className="font-serif text-2xl lg:text-3xl text-stone-900 font-bold tracking-tight">
              {analysis.name}
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Fabric / Weave: <span className="text-stone-900 font-medium">{analysis.materialsDetected}</span> · Motif: <span className="text-stone-900 font-medium">{analysis.patternOrTexture}</span>
            </p>
          </div>

          {/* Color Palette Swatches */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-mono tracking-wider text-stone-600 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-stone-500" />
                <span>Extracted Chromatic Palette</span>
              </span>
              <span className="text-[11px] text-stone-400">Click swatch to copy hex</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {analysis.primaryColors.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCopyHex(color.hex)}
                  className="group p-2 rounded border border-[#E8E4DF] hover:border-stone-400 bg-[#FAF8F5] transition-all text-left flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="w-6 h-6 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: color.hex }}
                    />
                    {copiedHex === color.hex ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-stone-500 block truncate">
                      {color.role}
                    </span>
                    <span className="text-xs font-medium text-stone-900 block truncate">
                      {color.name}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400 block tabular-nums">
                      {color.hex}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dilemma & Golden Rule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-stone-50 border border-stone-200/70">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-stone-700 mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>Why This Piece Puzzles Closets</span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                {analysis.stylingChallenge}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#F5F2EA] border border-[#DDD6C5]">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-stone-800 mb-1">
                <Compass className="w-3.5 h-3.5 text-stone-700" />
                <span>The Golden Styling Rule</span>
              </div>
              <p className="text-xs text-stone-800 leading-relaxed font-medium">
                {analysis.goldenRule}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
