import GeminiService from "../services/geminiService.js";
import GeocodingService from "../services/geocodingService.js";

export const geocodeLocation = async (req, res) => {
  try {
    const { description, location_name } = req.body;

    if (!description && !location_name) {
      return res.status(400).json({
        success: false,
        error: "Either description or location_name is required",
      });
    }

    let finalLocationName = location_name;

    // Extract location from description if not provided
    if (!location_name && description) {
      const extracted = await GeminiService.extractLocation(`${description}`);
      finalLocationName = extracted?.location_name || null;
    }

    console.log(`Final location name to geocode: ${finalLocationName}`);

    if (!finalLocationName) {
      return res.json({
        success: true,
        data: {
          location_name: null,
          coordinates: null,
          message: "No location found in description",
        },
      });
    }

    const geoData = await GeocodingService.geocodeLocationOSM(
      finalLocationName
    );

    res.json({
      success: true,
      data: {
        location_name: finalLocationName,
        coordinates: geoData ? { lat: geoData.lat, lng: geoData.lng } : null,
        formatted_address: geoData?.formatted_address,
        geocoded_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Geocoding error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to geocode location",
    });
  }
};
