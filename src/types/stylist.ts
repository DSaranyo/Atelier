export interface ColorSwatch {
  name: string;
  hex: string;
  role: 'dominant' | 'secondary' | 'accent' | 'neutral' | string;
  percentage?: number;
}

export interface ItemAnalysis {
  name: string;
  category: string;
  styleArchetype: string;
  silhouette: string;
  materialsDetected: string;
  patternOrTexture: string;
  stylingChallenge: string;
  goldenRule: string;
  primaryColors: ColorSwatch[];
}

export interface OutfitPiece {
  category: string;
  name: string;
  color: string;
  colorHex: string;
  material: string;
  details: string;
  isAnchor: boolean;
  placement: 'top' | 'center' | 'bottom' | 'left' | 'right' | 'accent' | string;
}

export interface ColorHarmony {
  title: string;
  explanation: string;
  swatches: string[];
}

export interface OutfitOption {
  id: 'casual' | 'business' | 'night_out';
  occasion: 'Casual' | 'Business' | 'Night Out';
  title: string;
  vibeDesc: string;
  anchorRole: string;
  pieces: OutfitPiece[];
  colorHarmony: ColorHarmony;
  stylingTips: string[];
  flatLayPrompt: string;
  flatLayTheme: string;
  generatedImageUrl?: string;
}

export interface StylistResult {
  itemAnalysis: ItemAnalysis;
  outfits: OutfitOption[];
}

export interface SampleItem {
  id: string;
  title: string;
  category: string;
  difficultyVibe: string;
  description: string;
  imagePath: string;
  mimeType: string;
  preloadedData?: StylistResult;
}

export interface SavedLook {
  id: string;
  savedAt: string;
  itemImage: string;
  itemName: string;
  outfit: OutfitOption;
}
