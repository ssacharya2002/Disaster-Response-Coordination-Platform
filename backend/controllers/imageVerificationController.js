import GeminiService from "../services/geminiService.js";
import supabase from "../config/supabase.js";

export const verifyImageForDisaster = async (req, res) => {
  try {
    const { id: disasterId } = req.params;
    const { image_url, report_id } = req.body;

    if (!image_url) {
      return res.status(400).json({
        success: false,
        error: "Image URL is required",
      });
    }

    // Verify image using Gemini
    const verification = await GeminiService.verifyImage(image_url);

    // Optionally update the related report
    if (report_id) {
      const { error } = await supabase
        .from("reports")
        .update({
          verification_status: verification.verification_status,
        })
        .eq("id", report_id)
        .eq("disaster_id", disasterId);

      if (error) {
        console.error("Update report verification error:", error);
      }
    }

    console.log(
      `Image verified: ${verification.verification_status} (confidence: ${verification.confidence_score}%)`
    );

    res.json({
      success: true,
      data: verification,
    });
  } catch (error) {
    console.error("Image verification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify image",
    });
  }
};
