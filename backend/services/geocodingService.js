import axios from "axios";
import CacheService from "./cacheService.js";

class GeocodingService {
  static async geocodeLocation(locationName) {
    if (!locationName) return null;

    const cacheKey = `geocode_${Buffer.from(locationName).toString("base64")}`;

    // Check cache first
    const cached = await CacheService.get(cacheKey);
    if (cached) return cached;

    try {
      // Using Google Maps Geocoding API
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {
          params: {
            address: locationName,
            key: process.env.GOOGLE_MAPS_API_KEY,
          },
        }
      );

      if (response.data.status === "OK" && response.data.results.length > 0) {
        const result = response.data.results[0];
        const location = result.geometry.location;

        const geoData = {
          lat: location.lat,
          lng: location.lng,
          formatted_address: result.formatted_address,
          geocoded_at: new Date().toISOString(),
        };

        // Cache for 24 hours
        await CacheService.set(cacheKey, geoData, 1440);

        return geoData;
      }

      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  }

  // Alternative: OpenStreetMap used in this project for geocoding it's free
  static async geocodeLocationOSM(locationName) {
    if (!locationName) return null;

    const cacheKey = `geocode_osm_${Buffer.from(locationName).toString(
      "base64"
    )}`;

    const cached = await CacheService.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: locationName,
            format: "json",
            limit: 1,
          },
          headers: {
            "User-Agent": "DisasterResponsePlatform/1.0",
          },
        }
      );

      if (response.data && response.data.length > 0) {
        const result = response.data[0];

        const geoData = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          formatted_address: result.display_name,
          geocoded_at: new Date().toISOString(),
        };

        await CacheService.set(cacheKey, geoData, 1440);
        return geoData;
      }

      return null;
    } catch (error) {
      console.error("OSM Geocoding error:", error);
      return null;
    }
  }
}

export default GeocodingService;