import { GoogleGenerativeAI } from "@google/generative-ai";
import CacheService from "./cacheService.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiService {
  static async extractLocation(description) {
    const cacheKey = `location_extract_${Buffer.from(description).toString(
      "base64"
    )}`;

    // Check cache first
    const cached = await CacheService.get(cacheKey);
    if (cached) return cached;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Extract the location name from this disaster description. Return only the location name (city, state/country format if available), or "UNKNOWN" if no location is found: "${description}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const locationName = response.text().trim();

      const result_data = {
        location_name: locationName === "UNKNOWN" ? null : locationName,
        extracted_at: new Date().toISOString(),
      };

      // Cache for 1 hour
      await CacheService.set(cacheKey, result_data, 60);

      return result_data;
    } catch (error) {
      console.error("Gemini location extraction error:", error);
      return { location_name: null, extracted_at: new Date().toISOString() };
    }
  }

  static async verifyImage(imageUrl) {
    const cacheKey = `image_verify_${Buffer.from(imageUrl).toString("base64")}`;

    // Check cache
    const cached = await CacheService.get(cacheKey);
    if (cached) return cached;

    try {
      // Fetch the image as a blob
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString("base64");

      // Use Gemini Pro Vision
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: blob.type || "image/jpeg",
            data: base64Image,
          },
        },
        {
          text: "Analyze this image for signs of manipulation or verify if it shows disaster-related content. Provide a confidence score (0-100) and a brief explanation.",
        },
      ]);

      const response = await result.response;
      const analysis = await response.text();

      // Extract confidence score (if mentioned in the response)
      const confidenceMatch = analysis.match(/confidence.*?(\d{1,3})/i);
      const confidence = confidenceMatch
        ? Math.min(parseInt(confidenceMatch[1]), 100)
        : 50;

      // Use confidence score to determine verification status
      const result_data = {
        verification_status: confidence >= 70 ? "verified" : "suspicious",
        confidence_score: confidence,
        analysis,
        verified_at: new Date().toISOString(),
      };

      // Cache for 24 hours
      await CacheService.set(cacheKey, result_data, 1440);

      return result_data;
    } catch (error) {
      console.error("Gemini image verification error:", error);
      return {
        verification_status: "error",
        confidence_score: 0,
        analysis: "Unable to verify image",
        verified_at: new Date().toISOString(),
      };
    }
  }
}

export default GeminiService;
