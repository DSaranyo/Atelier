import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { ItemUploader } from './components/ItemUploader';
import { ItemAnalysisCard } from './components/ItemAnalysisCard';
import { OutfitDetailView } from './components/OutfitDetailView';
import { LookbookModal } from './components/LookbookModal';
import { StylistResult, OutfitOption, SavedLook } from './types/stylist';
import { SAMPLE_ITEMS } from './data/sampleItems';
import { Sparkles, Palette, Layers, Compass, CheckCircle2, AlertCircle, ArrowUp } from 'lucide-react';

export default function App() {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [stylistResult, setStylistResult] = useState<StylistResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('Deconstructing item anatomy...');
  const [activeOutfitIndex, setActiveOutfitIndex] = useState<number>(0);
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [isLookbookOpen, setIsLookbookOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load initial sample automatically so page has full visual richness from first second
  useEffect(() => {
    const defaultSample = SAMPLE_ITEMS[0];
    if (defaultSample && defaultSample.preloadedData) {
      setActiveImage(defaultSample.imagePath);
      setStylistResult(defaultSample.preloadedData);
    }

    // Load saved looks from localStorage
    try {
      const stored = localStorage.getItem('atelier_saved_looks');
      if (stored) {
        setSavedLooks(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not load saved looks from storage', e);
    }
  }, []);

  // Save looks to localStorage
  const handleSaveLook = (outfit: OutfitOption) => {
    if (!stylistResult || !activeImage) return;

    const existingIdx = savedLooks.findIndex((l) => l.outfit.id === outfit.id && l.itemName === stylistResult.itemAnalysis.name);
    let updated: SavedLook[];

    if (existingIdx !== -1) {
      // Toggle off / remove
      updated = savedLooks.filter((_, i) => i !== existingIdx);
    } else {
      const newLook: SavedLook = {
        id: `${outfit.id}-${Date.now()}`,
        savedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        itemImage: activeImage,
        itemName: stylistResult.itemAnalysis.name,
        outfit: { ...outfit },
      };
      updated = [newLook, ...savedLooks];
    }

    setSavedLooks(updated);
    try {
      localStorage.setItem('atelier_saved_looks', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  };

  const handleRemoveSavedLook = (id: string) => {
    const updated = savedLooks.filter((l) => l.id !== id);
    setSavedLooks(updated);
    try {
      localStorage.setItem('atelier_saved_looks', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  };

  const isLookSaved = (outfitId: string): boolean => {
    return savedLooks.some((l) => l.outfit.id === outfitId && l.itemName === stylistResult?.itemAnalysis.name);
  };

  const handleUpdateOutfitImage = (outfitId: string, imageUrl: string) => {
    if (!stylistResult) return;
    const updatedOutfits = stylistResult.outfits.map((o) => {
      if (o.id === outfitId) {
        return { ...o, generatedImageUrl: imageUrl };
      }
      return o;
    });
    setStylistResult({ ...stylistResult, outfits: updatedOutfits });
  };

  const handleAnalyze = async (
    imageBase64: string,
    mimeType: string,
    notes?: string,
    fitPreference?: string,
    preloadedData?: StylistResult
  ) => {
    setActiveImage(imageBase64);
    setErrorMessage(null);

    // If already precomputed sample data was passed, load immediately
    if (preloadedData) {
      setStylistResult(preloadedData);
      setActiveOutfitIndex(0);
      window.scrollTo({ top: 380, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);
    setStylistResult(null);

    const steps = [
      'Deconstructing chromatic palette and undertones...',
      'Analyzing weave, texture, and silhouette volume...',
      'Calculating 3 balanced outfit formulas...',
      'Styling Casual, Business, and Night Out ensembles...',
    ];
    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setLoadingStep(steps[stepIdx]);
    }, 2200);

    try {
      const response = await fetch('/api/stylist/analyze-and-outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          userNotes: notes,
          genderOrFitPreference: fitPreference,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to curate outfits for this garment.');
      }

      setStylistResult(data.data);
      setActiveOutfitIndex(0);
      setTimeout(() => {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Styling analysis failed:', err);
      setErrorMessage(err.message || 'Garment analysis encountered an error. Please try another photo or pick a sample.');
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  const handleSelectSavedLook = (look: SavedLook) => {
    setActiveImage(look.itemImage);
    setStylistResult({
      itemAnalysis: {
        name: look.itemName,
        category: look.outfit.pieces.find((p) => p.isAnchor)?.category || 'Statement Piece',
        styleArchetype: 'Curated Ensemble',
        silhouette: 'Proportioned match',
        materialsDetected: look.outfit.pieces.find((p) => p.isAnchor)?.material || 'Fine textile',
        patternOrTexture: look.outfit.pieces.find((p) => p.isAnchor)?.details || 'Custom',
        stylingChallenge: 'Previously saved favorite silhouette',
        goldenRule: look.outfit.colorHarmony.explanation,
        primaryColors: look.outfit.colorHarmony.swatches.map((hex, i) => ({
          name: `Tone 0${i + 1}`,
          hex,
          role: i === 0 ? 'dominant' : 'accent',
        })),
      },
      outfits: [look.outfit],
    });
    setActiveOutfitIndex(0);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#171717] font-sans flex flex-col justify-between">
      {/* 3-Zone Top Bar Contract */}
      <TopBar
        savedCount={savedLooks.length}
        onOpenLookbook={() => setIsLookbookOpen(true)}
        onReset={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onScrollToSamples={() => scrollToSection('samples')}
        onScrollToPhilosophy={() => scrollToSection('philosophy')}
      />

      {/* Main Experience Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 lg:py-14 space-y-12">
        {/* Editorial Hero Header */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.25em] text-stone-600">
            <span>Atelier Haute Intelligence</span>
            <span aria-hidden="true">·</span>
            <span>Wardrobe Solution</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 text-balance leading-[1.15]">
            What to wear with that one piece you can never style.
          </h1>

          <p className="text-sm sm:text-base text-stone-600 text-balance max-w-2xl mx-auto leading-relaxed">
            Upload any tricky statement item—that bold patterned skirt, rich emerald velvet blazer, or metallic shoes. Atelier analyzes its color palette, texture, and silhouette to compose 3 complete, distinct flat-lay outfits: Casual, Business, and Night Out.
          </p>
        </section>

        {/* Garment Uploader Module */}
        <ItemUploader
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          activeImage={activeImage}
          onClearActive={() => {
            setActiveImage(null);
            setStylistResult(null);
          }}
        />

        {/* Error notification */}
        {errorMessage && (
          <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-700 hover:text-rose-900 font-bold ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="bg-white rounded-lg border border-[#E8E4DF] p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.03)] my-8">
            <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 mx-auto flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">
              The Stylist is in Session
            </h3>
            <p className="font-mono text-xs text-stone-500 uppercase tracking-widest max-w-md mx-auto">
              {loadingStep}
            </p>
            <div className="w-48 h-1 bg-stone-100 rounded-full mx-auto mt-6 overflow-hidden">
              <div className="h-full bg-stone-900 rounded-full animate-[shimmer_1.5s_infinite] w-2/3" />
            </div>
          </div>
        )}

        {/* Curated Results: Garment Deconstruction + 3 Flat-Lay Outfits */}
        {!isLoading && stylistResult && activeImage && (
          <div className="space-y-8 animate-fade-in">
            {/* 1. Item Analysis Breakdown */}
            <ItemAnalysisCard
              analysis={stylistResult.itemAnalysis}
              itemImage={activeImage}
            />

            {/* 2. 3 Complete Outfits & Flat-Lay Visualizer */}
            <OutfitDetailView
              outfits={stylistResult.outfits}
              activeOutfitIndex={activeOutfitIndex}
              onSelectOutfitIndex={setActiveOutfitIndex}
              itemImage={activeImage}
              itemName={stylistResult.itemAnalysis.name}
              onSaveLook={handleSaveLook}
              isSaved={isLookSaved}
              onUpdateOutfitImage={handleUpdateOutfitImage}
            />
          </div>
        )}

        {/* The Atelier Styling Methodology */}
        <section id="philosophy" className="pt-10 border-t border-[#E8E4DF]">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-stone-500 block mb-1">
              Curatorial Philosophy
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              The Atelier Flat-Lay Method
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2">
              Three styling disciplines that turn closet enigmas into signature looks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-white border border-[#E8E4DF] shadow-xs">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-800 mb-4 font-serif text-lg font-bold">
                01
              </div>
              <h3 className="font-serif text-lg font-semibold text-stone-900 mb-2">
                Secondary Hue Extraction
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                When pairing busy prints or bold saturations, never match the dominant color. Instead, extract a quiet secondary or tertiary pigment (like the dusty sage in a floral or the horn button tone on a blazer) to choose the companion knitwear or trousers.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-white border border-[#E8E4DF] shadow-xs">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-800 mb-4 font-serif text-lg font-bold">
                02
              </div>
              <h3 className="font-serif text-lg font-semibold text-stone-900 mb-2">
                Volume & Texture Counterweight
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                A voluminous fluid piece requires structured tailoring on the opposite hemisphere. A heavy double-breasted velvet demands crisp poplin or fluid silk beneath. Tension between tactile textures is what creates quiet luxury.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-white border border-[#E8E4DF] shadow-xs">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-800 mb-4 font-serif text-lg font-bold">
                03
              </div>
              <h3 className="font-serif text-lg font-semibold text-stone-900 mb-2">
                Overhead Knolling Vision
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Viewing an ensemble organized flat on neutral travertine or linen strips away distraction. You see color balance, shoe weight, and metal hardware cohesiveness before you ever step in front of a mirror.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Lookbook Drawer Modal */}
      <LookbookModal
        isOpen={isLookbookOpen}
        onClose={() => setIsLookbookOpen(false)}
        savedLooks={savedLooks}
        onRemoveLook={handleRemoveSavedLook}
        onSelectLook={handleSelectSavedLook}
      />

      {/* Editorial Footer */}
      <footer className="border-t border-[#E8E4DF] bg-white py-8 px-6 mt-16 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-900 text-sm">Atelier</span>
            <span>—</span>
            <span>Virtual Stylist for Statement Garments</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Powered by Gemini 3.8 Flash & Nano Banana</span>
            <span>·</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-stone-900 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
