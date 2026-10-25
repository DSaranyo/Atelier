import React, { useState } from 'react';
import { OutfitOption, OutfitPiece } from '../types/stylist';
import { Sparkles, Wand2, RefreshCw, ZoomIn, Download, SlidersHorizontal, Layers, Check, Image as ImageIcon } from 'lucide-react';

interface FlatLayVisualizerProps {
  outfit: OutfitOption;
  itemImage: string;
  onUpdateOutfitImage: (outfitId: string, imageUrl: string) => void;
}

export const FlatLayVisualizer: React.FC<FlatLayVisualizerProps> = ({
  outfit,
  itemImage,
  onUpdateOutfitImage,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'knolling'>('visual');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Surface background styling based on theme
  const getThemeBg = () => {
    if (outfit.id === 'night_out') {
      return 'bg-[#18181A] text-stone-200 border-stone-800';
    }
    if (outfit.id === 'business') {
      return 'bg-[#F2EFE9] text-stone-900 border-[#DDD7CD]';
    }
    return 'bg-[#F9F7F2] text-stone-900 border-[#E8E4DF]';
  };

  const handleGenerateImage = async (editPrompt?: string) => {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const endpoint = editPrompt && outfit.generatedImageUrl
        ? '/api/stylist/edit-flatlay'
        : '/api/stylist/generate-flatlay';

      const body = editPrompt && outfit.generatedImageUrl
        ? {
            existingImageBase64: outfit.generatedImageUrl,
            userEditPrompt: editPrompt,
          }
        : {
            outfitTitle: outfit.title,
            occasion: outfit.occasion,
            promptDescription: `${outfit.flatLayPrompt}. ${editPrompt || ''}`,
            surface: outfit.flatLayTheme,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate flat-lay visual.');
      }

      if (data.imageUrl) {
        onUpdateOutfitImage(outfit.id, data.imageUrl);
        setCustomPrompt('');
      }
    } catch (err: any) {
      console.error('Flat-lay generation error:', err);
      setErrorMessage(err.message || 'Image generation unavailable. You can interact with the knolling board below.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!outfit.generatedImageUrl) return;
    const a = document.createElement('a');
    a.href = outfit.generatedImageUrl;
    a.download = `Atelier-${outfit.occasion}-${outfit.title.replace(/\s+/g, '_')}.jpg`;
    a.click();
  };

  // Group pieces for clean knolling layout
  const anchorPiece = outfit.pieces.find((p) => p.isAnchor);
  const otherPieces = outfit.pieces.filter((p) => !p.isAnchor);

  return (
    <div className="w-full">
      {/* Visualizer Frame */}
      <div className={`relative rounded-xl border p-4 sm:p-6 transition-all shadow-sm ${getThemeBg()}`}>
        {/* Top Control Bar inside frame */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-black/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest opacity-75">
              Flat-Lay Composition · {outfit.occasion}
            </span>
            <span className="text-xs opacity-50">/</span>
            <span className="text-xs opacity-80 italic">{outfit.flatLayTheme}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher: AI Visual vs Knolled Pieces */}
            <div className="flex items-center bg-black/5 dark:bg-white/10 rounded p-0.5 text-xs font-medium">
              <button
                onClick={() => setActiveTab('visual')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === 'visual'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                Editorial View
              </button>
              <button
                onClick={() => setActiveTab('knolling')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === 'knolling'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                Knolling Board
              </button>
            </div>

            {/* Prompt toggle */}
            <button
              onClick={() => setShowPromptEditor(!showPromptEditor)}
              className="px-2.5 py-1 text-xs rounded border border-black/15 hover:border-black/30 dark:border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Edit image prompt with Gemini nano banana"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Prompt & Remix</span>
            </button>
          </div>
        </div>

        {/* Prompt Editor Drawer */}
        {showPromptEditor && (
          <div className="mb-4 p-4 rounded-lg bg-white/90 dark:bg-stone-900/90 border border-black/10 dark:border-white/10 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Prompt-Guided Flat-Lay Styling (gemini-nano-banana-2.1)</span>
              </span>
              <span className="text-[11px] text-stone-400">Add props, textures, or adjustments</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Add tortoiseshell sunglasses and a fresh espresso cup, morning sunbeam..."
                className="flex-1 text-xs px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded focus:outline-none focus:ring-1 focus:ring-stone-600 text-stone-900 dark:text-stone-100"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerateImage(customPrompt);
                }}
              />
              <button
                onClick={() => handleGenerateImage(customPrompt)}
                disabled={isGenerating}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>{outfit.generatedImageUrl ? 'Remix Image' : 'Generate'}</span>
              </button>
            </div>

            {/* Quick Inspiration Pills for prompts */}
            <div className="flex flex-wrap items-center gap-2 mt-2 pt-1 text-[11px]">
              <span className="text-stone-400">Quick additions:</span>
              {[
                'Add espresso cup & art magazine',
                'Add vintage gold watch & signet ring',
                'Morning window shadow patterns',
                'Minimalist travertine stone surface',
              ].map((pill, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const newPrompt = customPrompt ? `${customPrompt}, ${pill}` : pill;
                    setCustomPrompt(newPrompt);
                  }}
                  className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
                >
                  + {pill}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error notification if any */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-amber-700 hover:text-amber-900 font-bold ml-2 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Main Canvas Display */}
        {activeTab === 'visual' ? (
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-stone-200/50 dark:bg-stone-950/50 border border-black/10 flex items-center justify-center">
            {outfit.generatedImageUrl ? (
              <>
                <img
                  src={outfit.generatedImageUrl}
                  alt={`${outfit.title} flat-lay`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <button
                    onClick={() => setIsZoomed(true)}
                    className="p-2 rounded bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors cursor-pointer"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 rounded bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors cursor-pointer"
                    title="Download flat-lay photograph"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              /* Fallback / Initial State: High-aesthetic Knolled Visual Composition with Anchor Item */
              <div className="w-full h-full p-6 flex flex-col justify-between relative overflow-hidden">
                {/* Visual Backdrop Details */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#999_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Overhead Knolling Layout Preview */}
                <div className="grid grid-cols-12 gap-3 h-full items-center relative z-10">
                  {/* Left Column: Outerwear & Tops */}
                  <div className="col-span-4 flex flex-col justify-between h-full py-2">
                    {otherPieces
                      .filter((p) => ['Top', 'Outerwear'].includes(p.category))
                      .map((piece, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-lg bg-white/80 dark:bg-stone-800/80 backdrop-blur-xs border border-black/10 dark:border-white/10 shadow-xs"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/10"
                              style={{ backgroundColor: piece.colorHex }}
                            />
                            <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">
                              {piece.category}
                            </span>
                          </div>
                          <p className="font-serif text-xs font-semibold line-clamp-1">{piece.name}</p>
                          <p className="text-[10px] opacity-70 line-clamp-1">{piece.material}</p>
                        </div>
                      ))}
                  </div>

                  {/* Center Column: The Star Anchor Item */}
                  <div className="col-span-4 flex flex-col items-center justify-center h-full">
                    <div className="w-full max-w-[220px] p-3 rounded-xl bg-white dark:bg-stone-800 border-2 border-stone-800 dark:border-stone-200 shadow-md flex flex-col items-center text-center">
                      <div className="w-full aspect-[4/3] rounded bg-stone-100 overflow-hidden mb-2">
                        <img
                          src={itemImage}
                          alt="Anchor item"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                      <span className="text-[9px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 mb-1">
                        ★ Anchor Piece
                      </span>
                      <p className="font-serif text-xs font-semibold line-clamp-1">
                        {anchorPiece?.name || 'Your Statement Piece'}
                      </p>
                      <p className="text-[10px] opacity-70 line-clamp-1">{anchorPiece?.color}</p>
                    </div>
                  </div>

                  {/* Right Column: Shoes, Bags & Accessories */}
                  <div className="col-span-4 flex flex-col justify-between h-full py-2">
                    {otherPieces
                      .filter((p) => ['Footwear', 'Bag', 'Jewelry', 'Accessories', 'Bottom'].includes(p.category))
                      .slice(0, 3)
                      .map((piece, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-lg bg-white/80 dark:bg-stone-800/80 backdrop-blur-xs border border-black/10 dark:border-white/10 shadow-xs"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/10"
                              style={{ backgroundColor: piece.colorHex }}
                            />
                            <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">
                              {piece.category}
                            </span>
                          </div>
                          <p className="font-serif text-xs font-semibold line-clamp-1">{piece.name}</p>
                          <p className="text-[10px] opacity-70 line-clamp-1">{piece.material}</p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Floating Generate Action Center */}
                <div className="absolute inset-x-0 bottom-6 flex justify-center z-20">
                  <button
                    onClick={() => handleGenerateImage()}
                    disabled={isGenerating}
                    className="px-5 py-2.5 bg-stone-900/95 hover:bg-stone-800 text-white backdrop-blur-md rounded-full shadow-lg text-xs font-medium flex items-center gap-2 border border-white/20 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                        <span>Rendering Editorial Flat-Lay...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Generate Photorealistic Flat-Lay Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Knolling Board: Detailed Grid of Every Piece in the Outfit */
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-2">
            {outfit.pieces.map((piece, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between ${
                  piece.isAnchor
                    ? 'bg-amber-50/70 dark:bg-stone-800 border-amber-300 dark:border-amber-700/60 shadow-xs'
                    : 'bg-white dark:bg-stone-900 border-black/10 dark:border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">
                      {piece.category}
                    </span>
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: piece.colorHex }}
                      title={`${piece.color} (${piece.colorHex})`}
                    />
                  </div>
                  <h5 className="font-serif text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-2">
                    {piece.name}
                  </h5>
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                    {piece.material} · <span className="font-mono text-[11px] opacity-75">{piece.color}</span>
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/5 text-[11px] text-stone-500 dark:text-stone-400">
                  {piece.details}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Caption below visualizer */}
        <div className="mt-3 flex items-center justify-between text-xs opacity-75">
          <span>
            {outfit.pieces.length} Pieces Coordinated · Palette: {outfit.colorHarmony.title}
          </span>
          <span className="font-mono text-[11px]">
            {outfit.occasion === 'Casual' ? 'Effortless Balance' : outfit.occasion === 'Business' ? 'Structured Elegance' : 'Dusk-to-Dawn Contrast'}
          </span>
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomed && outfit.generatedImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <img
              src={outfit.generatedImageUrl}
              alt="Zoomed flat-lay"
              referrerPolicy="no-referrer"
              className="max-h-[80vh] w-auto rounded-lg shadow-2xl object-contain"
            />
            <div className="flex items-center gap-3 mt-4 text-white text-xs">
              <span>{outfit.title} · {outfit.occasion}</span>
              <span>·</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                className="underline hover:text-stone-300 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download full resolution</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
