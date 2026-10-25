import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase payload limit for base64 images
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Server-side Gemini initialization with required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Primary stylist outfit curation schema
const stylistResponseSchema = {
  type: Type.OBJECT,
  properties: {
    itemAnalysis: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Descriptive title of the clothing/accessory item' },
        category: { type: Type.STRING, description: 'E.g., Skirt, Blazer, Trousers, Dress, Shoes, Bag, Knitwear' },
        styleArchetype: { type: Type.STRING, description: 'E.g., Romantic Bohemian, Architectural Tailoring, Neo-Classic' },
        silhouette: { type: Type.STRING, description: 'Cut, drape, and proportion description' },
        materialsDetected: { type: Type.STRING, description: 'Fabrics or textures visible or implied' },
        patternOrTexture: { type: Type.STRING, description: 'Pattern details or surface texture' },
        stylingChallenge: { type: Type.STRING, description: 'Why this piece intimidates or challenges people when styling' },
        goldenRule: { type: Type.STRING, description: 'Core aesthetic rule for pairing with this specific piece' },
        primaryColors: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              hex: { type: Type.STRING, description: 'Standard 6-digit hex code with #, e.g., #E8A87C' },
              role: { type: Type.STRING, description: 'dominant | secondary | accent | neutral' },
            },
            required: ['name', 'hex', 'role'],
          },
        },
      },
      required: ['name', 'category', 'styleArchetype', 'silhouette', 'materialsDetected', 'patternOrTexture', 'stylingChallenge', 'goldenRule', 'primaryColors'],
    },
    outfits: {
      type: Type.ARRAY,
      description: 'Exactly 3 distinct outfits: Casual, Business, and Night Out',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'casual | business | night_out' },
          occasion: { type: Type.STRING, description: 'Casual | Business | Night Out' },
          title: { type: Type.STRING, description: 'Editorial title for this ensemble' },
          vibeDesc: { type: Type.STRING, description: 'Atmospheric 1-2 sentence description of the look' },
          anchorRole: { type: Type.STRING, description: 'Specific role of the uploaded item in this look' },
          pieces: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING, description: 'Top, Bottom, Outerwear, Footwear, Bag, Jewelry, or Accessory' },
                name: { type: Type.STRING, description: 'Specific curated item name with cut and fabric' },
                color: { type: Type.STRING, description: 'Color description name' },
                colorHex: { type: Type.STRING, description: 'Hex code, e.g. #F5F0E6' },
                material: { type: Type.STRING, description: 'Fabric or metal material' },
                details: { type: Type.STRING, description: 'Key stylistic nuance or cut feature' },
                isAnchor: { type: Type.BOOLEAN, description: 'True if this is the user\'s uploaded item' },
                placement: { type: Type.STRING, description: 'top | center | bottom | left | right | accent' },
              },
              required: ['category', 'name', 'color', 'colorHex', 'material', 'details', 'isAnchor', 'placement'],
            },
          },
          colorHarmony: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Strategy name, e.g. Tonal Grounding with Warm Creams' },
              explanation: { type: Type.STRING, description: 'Why this color combination elevates the anchor piece' },
              swatches: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of 4-5 hex codes forming this outfit palette',
              },
            },
            required: ['title', 'explanation', 'swatches'],
          },
          stylingTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '2-3 actionable styling directives (cuffing, tucking, proportion balancing)',
          },
          flatLayPrompt: {
            type: Type.STRING,
            description: 'Photorealistic prompt for an overhead editorial flat-lay photograph of this exact ensemble',
          },
          flatLayTheme: {
            type: Type.STRING,
            description: 'E.g., Natural unbleached linen canvas, Warm honed travertine stone, or Dark charcoal slate',
          },
        },
        required: ['id', 'occasion', 'title', 'vibeDesc', 'anchorRole', 'pieces', 'colorHarmony', 'stylingTips', 'flatLayPrompt', 'flatLayTheme'],
      },
    },
  },
  required: ['itemAnalysis', 'outfits'],
};

// 1. Analyze item and generate 3 outfits
app.post('/api/stylist/analyze-and-outfits', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', userNotes, genderOrFitPreference } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Please provide an image of the clothing or accessory item.' });
    }

    // Clean base64 string
    const cleanedBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

    const promptText = `
You are a world-renowned haute couture and personal editorial stylist (with the taste of Vogue, The Gentlewoman, and Mr Porter).
A client has uploaded a single item from their wardrobe with the classic problem: "I don't know what to wear with this!"

Client Notes / Context: ${userNotes ? `"${userNotes}"` : 'None provided'}
Fit / Silhouette Preference: ${genderOrFitPreference || 'Versatile / Contemporary'}

TASKS:
1. Thoroughly analyze the uploaded item: identify its exact category, cut/silhouette, materials, pattern/texture, and exact color palette with realistic hex codes. Pinpoint precisely why this piece feels tricky to style (e.g., competing patterns, bold saturated color, unusual volume) and state the Golden Styling Rule that unlocks it.
2. Build EXACTLY 3 complete, distinct, masterclass outfits featuring this item as the star or foundational anchor:
   - Option 1: Casual (Effortless chic, elevated weekend, gallery visit, coffee, relaxed tailoring)
   - Option 2: Business / Smart Workwear (Polished, sharp, power-meeting ready, boardroom-friendly, elegant structure)
   - Option 3: Night Out / Evening (Glamour, moody or high-impact, cocktail party, dinner date, dinner party)
3. For each outfit:
   - Provide 4 to 6 specific, tangible complementary pieces (e.g. exact top, bottoms/skirt, outerwear/coat, footwear, bag, jewelry/accessories).
   - One piece MUST represent the uploaded anchor item itself with isAnchor: true.
   - Give realistic color hex codes for all pieces so the user can see the exact palette harmony.
   - Explain the Color Harmony Theory (e.g. how it balances the anchor's undertones).
   - Provide 2-3 precise editorial styling pro-tips (e.g. "Do an asymmetric French tuck to reveal the waistband hardware", "Roll sleeves once to expose the contrasting silk lining").
   - Craft an exact, high-end flat-lay photography prompt that arranges these items knolled neatly on a curated surface.

Ensure the 3 outfits feel entirely distinct in mood, silhouette, and footwear while respecting the integrity of the uploaded item.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanedBase64,
            },
          },
          { text: promptText },
        ],
      },
      config: {
        systemInstruction: 'You are an elite fashion director and wardrobe stylist. Always return valid, elegant JSON conforming strictly to the responseSchema.',
        responseMimeType: 'application/json',
        responseSchema: stylistResponseSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No styling response received from model.');
    }

    const parsedData = JSON.parse(text);
    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error analyzing item:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to analyze item. Please try again with a clear photo of the garment.',
    });
  }
});

// 2. Generate flat-lay visual for an outfit
app.post('/api/stylist/generate-flatlay', async (req: Request, res: Response) => {
  try {
    const { outfitTitle, occasion, promptDescription, surface = 'off-white textured travertine stone' } = req.body;

    const flatLayPrompt = `Professional high-fashion editorial overhead flat-lay knolling product photography.
Composition: Clean, perfectly organized overhead view on a luxurious ${surface}.
Items arranged: ${promptDescription || 'Complete coordinated fashion ensemble neatly folded and laid out flat with matching shoes, bag, and jewelry'}.
Style: Minimalist luxury catalog aesthetic, soft diffused natural studio lighting, crisp shadows, perfectly pressed fabrics, high-end magazine layout, top-down 90-degree flat angle, no people, no mannequins, realistic textures.`;

    // Generate image using gemini-nano-banana-2.1 or gemini-3.1-flash-lite-image
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-nano-banana-2.1',
      contents: {
        parts: [{ text: flatLayPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: '4:3',
          imageSize: '1K',
        },
      },
    });

    let generatedImageUrl: string | null = null;
    const candidates = imageResponse.candidates;
    if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/jpeg';
          generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (generatedImageUrl) {
      return res.json({ success: true, imageUrl: generatedImageUrl, prompt: flatLayPrompt });
    } else {
      // Fallback: try gemini-3.1-flash-lite-image if nano-banana didn't return an image part
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: flatLayPrompt }],
        },
      });

      if (fallbackResponse.candidates?.[0]?.content?.parts) {
        for (const part of fallbackResponse.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/jpeg';
            return res.json({
              success: true,
              imageUrl: `data:${mime};base64,${part.inlineData.data}`,
              prompt: flatLayPrompt,
            });
          }
        }
      }

      return res.status(500).json({ error: 'Could not generate visual flat-lay. Visual composition details remain available.' });
    }
  } catch (error: any) {
    console.error('Error generating flat-lay:', error);
    // If paid model or quota issue occurs, return descriptive message
    return res.status(500).json({
      error: error?.message || 'Image generation unavailable. You can view the full outfit blueprint and color canvas.',
    });
  }
});

// 3. Edit or remix flat-lay visual with custom user prompt
app.post('/api/stylist/edit-flatlay', async (req: Request, res: Response) => {
  try {
    const { existingImageBase64, userEditPrompt } = req.body;

    if (!userEditPrompt) {
      return res.status(400).json({ error: 'Please provide an edit instruction prompt.' });
    }

    const parts: any[] = [];
    if (existingImageBase64) {
      const cleanData = existingImageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanData,
        },
      });
    }

    parts.push({
      text: `Modify this high-fashion flat-lay photography according to the following instruction: ${userEditPrompt}. Maintain the overhead flat-lay knolling composition, pristine studio lighting, and high-end editorial luxury aesthetic without people.`,
    });

    const editResponse = await ai.models.generateContent({
      model: 'gemini-nano-banana-2.1',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: '4:3',
          imageSize: '1K',
        },
      },
    });

    let newImageUrl: string | null = null;
    if (editResponse.candidates?.[0]?.content?.parts) {
      for (const part of editResponse.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/jpeg';
          newImageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (newImageUrl) {
      return res.json({ success: true, imageUrl: newImageUrl });
    }

    return res.status(500).json({ error: 'Unable to edit flat-lay image.' });
  } catch (error: any) {
    console.error('Error editing flat-lay:', error);
    return res.status(500).json({ error: error?.message || 'Failed to edit flat-lay image.' });
  }
});

// Serve frontend in dev or prod
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Atelier Virtual Stylist server running at http://0.0.0.0:${PORT}`);
  });
}

setupServer();
