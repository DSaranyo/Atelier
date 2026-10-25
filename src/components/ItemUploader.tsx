import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Sparkles, X, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { SAMPLE_ITEMS } from '../data/sampleItems';
import { SampleItem } from '../types/stylist';

interface ItemUploaderProps {
  onAnalyze: (image: string, mimeType: string, notes?: string, fitPreference?: string, preloadedData?: any) => void;
  isLoading: boolean;
  activeImage: string | null;
  onClearActive: () => void;
}

export const ItemUploader: React.FC<ItemUploaderProps> = ({
  onAnalyze,
  isLoading,
  activeImage,
  onClearActive,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(activeImage);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [userNotes, setUserNotes] = useState<string>('');
  const [fitPreference, setFitPreference] = useState<string>('Contemporary / Fluid');
  const [selectedSample, setSelectedSample] = useState<SampleItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(activeImage);
  }, [activeImage]);

  // Support pasting image directly from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, or WEBP).');
      return;
    }
    setMimeType(file.type);
    setSelectedSample(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSelectSample = async (sample: SampleItem) => {
    setSelectedSample(sample);
    setPreviewUrl(sample.imagePath);
    setMimeType(sample.mimeType);

    // If sample already has preloaded rich data, we can invoke directly or user can click Style
    if (sample.preloadedData) {
      onAnalyze(sample.imagePath, sample.mimeType, userNotes, fitPreference, sample.preloadedData);
    } else {
      // Convert sample image path to base64 so backend can analyze via Gemini
      try {
        const resp = await fetch(sample.imagePath);
        const blob = await resp.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          onAnalyze(base64Data, sample.mimeType, userNotes, fitPreference);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error('Failed to convert sample image:', err);
      }
    }
  };

  const handleStartStyling = () => {
    if (!previewUrl) return;
    if (selectedSample?.preloadedData) {
      onAnalyze(previewUrl, mimeType, userNotes, fitPreference, selectedSample.preloadedData);
    } else {
      onAnalyze(previewUrl, mimeType, userNotes, fitPreference);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setSelectedSample(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClearActive();
  };

  return (
    <div className="w-full">
      {/* Upload & Sample Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Upload Box (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-[#E8E4DF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-xl text-stone-900 font-semibold tracking-tight">
                Upload That Tricky Item
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Drop in a photo, take a snapshot, or paste an image from your clipboard
              </p>
            </div>
            {previewUrl && (
              <button
                onClick={handleClear}
                className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {!previewUrl ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-lg p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[260px] ${
                dragActive
                  ? 'border-stone-800 bg-stone-50/80 scale-[0.99]'
                  : 'border-[#DDD7CD] hover:border-stone-400 bg-[#FBFBFA]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-full bg-white border border-[#E8E4DF] flex items-center justify-center shadow-xs mb-4 text-stone-700">
                <Upload className="w-6 h-6 stroke-[1.5]" />
              </div>
              <p className="font-serif text-lg text-stone-800">
                Choose a photo or drag & drop here
              </p>
              <p className="text-xs text-stone-500 mt-1 max-w-sm">
                Single garment on neutral floor, hanger, or worn. Supports JPG, PNG, WEBP.
              </p>
              <div className="flex items-center gap-4 mt-6 text-xs text-stone-600">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white rounded border border-[#E8E4DF]">
                  <Camera className="w-3.5 h-3.5 text-stone-500" />
                  <span>Camera or file</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white rounded border border-[#E8E4DF]">
                  <span>⌘+V / Ctrl+V Paste</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-stone-100 border border-[#E8E4DF] flex items-center justify-center max-h-[360px]">
                <img
                  src={previewUrl}
                  alt="Uploaded clothing item"
                  referrerPolicy="no-referrer"
                  className="max-h-[340px] w-auto object-contain mx-auto py-2"
                />
                {selectedSample && (
                  <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded tracking-wide font-medium">
                    Sample: {selectedSample.category}
                  </div>
                )}
              </div>

              {/* Context inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-stone-600 mb-1">
                    Occasion / Season Context (Optional)
                  </label>
                  <input
                    type="text"
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="e.g. Fall transition, outdoor garden party, office capsule"
                    className="w-full text-xs px-3 py-2 bg-[#FBFBFA] border border-[#DDD7CD] rounded focus:outline-none focus:border-stone-700 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-medium text-stone-600 mb-1">
                    Styling Vibe Direction
                  </label>
                  <select
                    value={fitPreference}
                    onChange={(e) => setFitPreference(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#FBFBFA] border border-[#DDD7CD] rounded focus:outline-none focus:border-stone-700 transition-colors"
                  >
                    <option value="Contemporary / Fluid">Contemporary / Fluid (Editorial)</option>
                    <option value="Classic Tailored & Structured">Classic Tailored & Structured</option>
                    <option value="Relaxed Minimalist & Neutral">Relaxed Minimalist & Neutral</option>
                    <option value="High-Impact Avant-Garde">High-Impact Avant-Garde</option>
                  </select>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleStartStyling}
                disabled={isLoading}
                className="w-full mt-3 py-3 px-6 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white font-serif text-base tracking-wide rounded transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-stone-300" />
                    <span>Styling in Progress...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Style This Piece: Generate 3 Flat-Lay Outfits</span>
                    <ArrowRight className="w-4 h-4 text-stone-300" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Sample Items Showcase (5 cols) */}
        <div id="samples" className="lg:col-span-5 bg-white rounded-lg border border-[#E8E4DF] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="mb-4">
            <h3 className="font-serif text-xl text-stone-900 font-semibold tracking-tight">
              Test with Tricky Wardrobe Items
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Select one of these statement pieces notoriously difficult to pair
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {SAMPLE_ITEMS.map((sample) => {
              const isSelected = selectedSample?.id === sample.id;
              return (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  disabled={isLoading}
                  className={`text-left group rounded-lg overflow-hidden border p-2 transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900'
                      : 'border-[#E8E4DF] hover:border-stone-400 hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="aspect-[4/3] rounded overflow-hidden bg-stone-100 mb-2 relative">
                    <img
                      src={sample.imagePath}
                      alt={sample.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 bg-stone-900 text-white p-1 rounded-full shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 block">
                      {sample.category}
                    </span>
                    <h4 className="font-serif text-xs font-semibold text-stone-900 line-clamp-1 mt-0.5">
                      {sample.title}
                    </h4>
                    <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                      {sample.difficultyVibe}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#E8E4DF] text-xs text-stone-500">
            <span className="font-medium text-stone-700">Stylist Note:</span> Each item demonstrates a different wardrobe challenge: print balance, jewel-tone velvet tailoring, metallic footwear, or high-saturation electric color.
          </div>
        </div>
      </div>
    </div>
  );
};
