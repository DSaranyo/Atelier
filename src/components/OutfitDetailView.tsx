import React, { useState } from 'react';
import { OutfitOption, SavedLook } from '../types/stylist';
import { FlatLayVisualizer } from './FlatLayVisualizer';
import { Bookmark, BookmarkCheck, Copy, Check, Lightbulb, Palette, Sparkles, Layers, Share2 } from 'lucide-react';

interface OutfitDetailViewProps {
  outfits: OutfitOption[];
  activeOutfitIndex: number;
  onSelectOutfitIndex: (index: number) => void;
  itemImage: string;
  itemName: string;
  onSaveLook: (outfit: OutfitOption) => void;
  isSaved: (outfitId: string) => boolean;
  onUpdateOutfitImage: (outfitId: string, imageUrl: string) => void;
}

export const OutfitDetailView: React.FC<OutfitDetailViewProps> = ({
  outfits,
  activeOutfitIndex,
  onSelectOutfitIndex,
  itemImage,
  itemName,
  onSaveLook,
  isSaved,
  onUpdateOutfitImage,
}) => {
  const [copiedFormula, setCopiedFormula] = useState(false);
  const currentOutfit = outfits[activeOutfitIndex] || outfits[0];

  if (!currentOutfit) return null;

  const saved = isSaved(currentOutfit.id);

  const handleCopyFormula = () => {
    const text = `Atelier Styling Formula: ${currentOutfit.title} (${currentOutfit.occasion})\n\nAnchor Piece: ${itemName}\nAnchor Role: ${currentOutfit.anchorRole}\n\nPieces:\n${currentOutfit.pieces
      .map((p) => `- ${p.category}: ${p.name} in ${p.color} (${p.material})`)
      .join('\n')}\n\nColor Theory: ${currentOutfit.colorHarmony.explanation}\n\nStyling Pro-Tips:\n${currentOutfit.stylingTips
      .map((tip, i) => `${i + 1}. ${tip}`)
      .join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2000);
  };

  return (
    <section className="bg-white rounded-lg border border-[#E8E4DF] p-6 lg:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] my-8">
      {/* 3 Occasion Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E4DF] pb-5">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-stone-500 block mb-1">
            Generated Outfits · 3 Distinct Visions
          </span>
          <div className="flex items-center gap-2">
            {outfits.map((outfit, index) => {
              const active = index === activeOutfitIndex;
              return (
                <button
                  key={outfit.id}
                  onClick={() => onSelectOutfitIndex(index)}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center gap-2 ${
                    active
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'bg-[#F5F2EA] text-stone-700 hover:bg-[#EAE5D9]'
                  }`}
                >
                  <span>
                    {outfit.occasion === 'Casual'
                      ? '☕ 01. Casual'
                      : outfit.occasion === 'Business'
                      ? '💼 02. Business'
                      : '🍸 03. Night Out'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyFormula}
            className="px-3 py-1.5 text-xs text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded border border-[#E8E4DF] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Copy styling formula to clipboard"
          >
            {copiedFormula ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
            <span className="hidden sm:inline">{copiedFormula ? 'Copied Formula' : 'Copy Formula'}</span>
          </button>

          <button
            onClick={() => onSaveLook(currentOutfit)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
              saved
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-[#E8E4DF]'
            }`}
          >
            {saved ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-300" /> : <Bookmark className="w-3.5 h-3.5 text-stone-600" />}
            <span>{saved ? 'Saved in Lookbook' : 'Save to Lookbook'}</span>
          </button>
        </div>
      </div>

      {/* Outfit Title & Vibe */}
      <div className="my-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-500">
          <span>Look {activeOutfitIndex + 1} of 3</span>
          <span aria-hidden="true">·</span>
          <span>{currentOutfit.occasion} Silhouette</span>
        </div>
        <h3 className="font-serif text-2xl lg:text-3xl text-stone-900 font-bold tracking-tight mt-1">
          {currentOutfit.title}
        </h3>
        <p className="text-sm text-stone-600 mt-1.5 max-w-3xl leading-relaxed">
          {currentOutfit.vibeDesc}
        </p>

        {/* Anchor role callout */}
        <div className="mt-3 p-3 rounded-lg bg-[#FAF8F5] border border-[#E8E4DF] flex items-start gap-2.5">
          <span className="text-xs font-mono uppercase tracking-wider text-stone-500 shrink-0 mt-0.5">
            Role of Anchor:
          </span>
          <p className="text-xs text-stone-800 font-medium">
            {currentOutfit.anchorRole}
          </p>
        </div>
      </div>

      {/* Two Column Layout: Visualizer on Left (7 cols), Wardrobe Pieces on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-8">
        {/* Left: Flat-Lay Visualizer & Prompt Customizer */}
        <div className="lg:col-span-7">
          <FlatLayVisualizer
            outfit={currentOutfit}
            itemImage={itemImage}
            onUpdateOutfitImage={onUpdateOutfitImage}
          />
        </div>

        {/* Right: Curated Wardrobe Pieces List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-[#E8E4DF]">
            <span className="text-xs font-mono uppercase tracking-widest text-stone-600 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-stone-500" />
              <span>Coordinated Garment Lineup</span>
            </span>
            <span className="text-xs text-stone-400 tabular-nums">
              {currentOutfit.pieces.length} items
            </span>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {currentOutfit.pieces.map((piece, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-all ${
                  piece.isAnchor
                    ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-200'
                    : 'bg-[#FAF8F5] hover:bg-stone-50 border-[#E8E4DF]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-2xs"
                      style={{ backgroundColor: piece.colorHex }}
                      title={piece.color}
                    />
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block">
                        {piece.category} {piece.isAnchor && '★ (Your Item)'}
                      </span>
                      <h4 className="font-serif text-sm font-semibold text-stone-900 leading-snug">
                        {piece.name}
                      </h4>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-stone-400 shrink-0">
                    {piece.color}
                  </span>
                </div>
                <div className="mt-2 text-xs text-stone-600 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-stone-800 font-medium">{piece.material}</span>
                  <span className="text-stone-300">·</span>
                  <span className="text-stone-500">{piece.details}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Color Harmony Blueprint & Styling Pro-Tips Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#E8E4DF]">
        {/* Color Harmony Theory */}
        <div className="p-5 rounded-lg bg-[#FAF8F5] border border-[#E8E4DF]">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-stone-700 mb-2">
            <Palette className="w-3.5 h-3.5 text-stone-600" />
            <span>Color Harmony Blueprint</span>
          </div>
          <h4 className="font-serif text-base font-semibold text-stone-900 mb-1">
            {currentOutfit.colorHarmony.title}
          </h4>
          <p className="text-xs text-stone-600 leading-relaxed">
            {currentOutfit.colorHarmony.explanation}
          </p>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-[10px] font-mono uppercase text-stone-400">Palette:</span>
            <div className="flex items-center gap-1.5">
              {currentOutfit.colorHarmony.swatches.map((hex, i) => (
                <span
                  key={i}
                  className="w-5 h-5 rounded-sm border border-black/10 shadow-2xs"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Styling Pro-Tips */}
        <div className="p-5 rounded-lg bg-[#FAF8F5] border border-[#E8E4DF]">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-stone-700 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>Editorial Styling Directives</span>
          </div>
          <ul className="space-y-2.5">
            {currentOutfit.stylingTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 leading-relaxed">
                <span className="font-mono text-stone-400 font-semibold shrink-0 mt-0.5">
                  0{idx + 1}.
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
