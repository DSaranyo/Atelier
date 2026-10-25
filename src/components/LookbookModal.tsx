import React, { useState } from 'react';
import { SavedLook } from '../types/stylist';
import { X, Trash2, ExternalLink, Bookmark, Download, Copy, Check } from 'lucide-react';

interface LookbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedLooks: SavedLook[];
  onRemoveLook: (id: string) => void;
  onSelectLook: (look: SavedLook) => void;
}

export const LookbookModal: React.FC<LookbookModalProps> = ({
  isOpen,
  onClose,
  savedLooks,
  onRemoveLook,
  onSelectLook,
}) => {
  const [filter, setFilter] = useState<'all' | 'Casual' | 'Business' | 'Night Out'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredLooks = filter === 'all'
    ? savedLooks
    : savedLooks.filter((l) => l.outfit.occasion === filter);

  const handleCopyFormula = (look: SavedLook) => {
    const text = `Atelier Styling Formula: ${look.outfit.title} (${look.outfit.occasion})\n\nAnchor Piece: ${look.itemName}\nRole: ${look.outfit.anchorRole}\n\nPieces:\n${look.outfit.pieces
      .map((p) => `- ${p.category}: ${p.name} in ${p.color}`)
      .join('\n')}\n\nStyling Pro-Tips:\n${look.outfit.stylingTips.join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopiedId(look.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-[#E8E4DF] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#E8E4DF] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-stone-500">
              Personal Wardrobe Archive
            </span>
            <h3 className="font-serif text-2xl text-stone-900 font-bold tracking-tight mt-0.5">
              Saved Lookbook
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 bg-[#FAF8F5] border-b border-[#E8E4DF] flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            {(['all', 'Casual', 'Business', 'Night Out'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  filter === cat
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                {cat === 'all' ? 'All Looks' : cat}
              </button>
            ))}
          </div>
          <span className="text-xs text-stone-500 font-mono tabular-nums">
            {filteredLooks.length} saved
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {filteredLooks.length === 0 ? (
            <div className="py-16 text-center text-stone-500">
              <Bookmark className="w-8 h-8 text-stone-300 mx-auto mb-3" />
              <p className="font-serif text-lg text-stone-700">No saved looks in this category</p>
              <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                Click "Save to Lookbook" on any generated outfit to curate your personal style archive.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLooks.map((look) => (
                <div
                  key={look.id}
                  className="rounded-lg border border-[#E8E4DF] bg-[#FAF8F5] p-4 flex flex-col justify-between hover:border-stone-400 transition-all shadow-xs"
                >
                  <div>
                    {/* Top Meta */}
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                      <span className="font-mono uppercase tracking-wider text-[10px] text-stone-700 font-semibold px-2 py-0.5 rounded bg-stone-200/60">
                        {look.outfit.occasion}
                      </span>
                      <span className="text-[11px] font-mono tabular-nums">{look.savedAt}</span>
                    </div>

                    {/* Image / Flat-Lay Preview */}
                    <div className="aspect-[16/9] rounded bg-stone-200 overflow-hidden mb-3 relative group">
                      <img
                        src={look.outfit.generatedImageUrl || look.itemImage}
                        alt={look.outfit.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          onSelectLook(look);
                          onClose();
                        }}
                        className="absolute inset-0 bg-stone-900/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs font-medium cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View in Studio</span>
                      </button>
                    </div>

                    <h4 className="font-serif text-base font-bold text-stone-900 line-clamp-1">
                      {look.outfit.title}
                    </h4>
                    <p className="text-xs text-stone-600 line-clamp-2 mt-1">
                      {look.outfit.vibeDesc}
                    </p>

                    {/* Palette Bar */}
                    <div className="flex items-center gap-1 mt-3">
                      {look.outfit.colorHarmony.swatches.map((hex, i) => (
                        <span
                          key={i}
                          className="w-4 h-4 rounded-xs border border-black/10"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Bottom Controls */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E8E4DF] text-xs">
                    <button
                      onClick={() => handleCopyFormula(look)}
                      className="text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === look.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === look.id ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => onRemoveLook(look.id)}
                      className="text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
