import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Generates a short blog post content based on title
export const generateBlogContent = async (title: string): Promise<{ content: string; excerpt: string; tags: string[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a creative and engaging blog post body (approx 150-200 words) for a blog titled "${title}". 
      Also provide a short excerpt (1 sentence) and 3 relevant tags. 
      Format the output as JSON with keys: "content", "excerpt", "tags".
      Do not include markdown code blocks. Just raw JSON string.`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Content Gen Error:", error);
    return {
      content: "Could not generate content at this time. Please try writing it yourself!",
      excerpt: "AI generation failed.",
      tags: ["Error"]
    };
  }
};

// Generates a cover image based on the title
export const generateBlogImage = async (title: string): Promise<string> => {
  try {
    // Using gemini-2.5-flash-image for generation as requested
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [
          { text: `Generate a high quality, artistic, futuristic digital art cover image for a blog post titled: "${title}". Use 16:9 aspect ratio.` }
        ]
      },
    });

    // Iterate through parts to find image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    // Fallback if no image generated
    return `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`;

  } catch (error) {
    console.error("AI Image Gen Error:", error);
    return `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`;
  }
};

// Generates speech from text using Gemini TTS
export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    // Truncate text if it's too long to avoid token limits for this demo
    // We remove any simple markdown symbols for better speech
    const cleanText = text.replace(/[*#_]/g, '');
    const safeText = cleanText.length > 2000 ? cleanText.substring(0, 2000) + "..." : cleanText;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: safeText }] }],
      config: {
        responseModalities: ["AUDIO"], 
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};