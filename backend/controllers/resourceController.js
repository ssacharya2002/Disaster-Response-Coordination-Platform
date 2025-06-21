import supabase from "../config/supabase.js";
import GeocodingService from "../services/geocodingService.js";
import GeminiService from "../services/geminiService.js";

// GET resources
export const getResources = async (req, res) => {
  try {
    const { id: disasterId } = req.params;
    const { lat, lng, radius = 10000, type } = req.query;

    if (lat && lng) {
      const { data, error } = await supabase.rpc("get_nearby_resources", {
        target_disaster_id: disasterId,
        lat: parseFloat(lat),
        lon: parseFloat(lng),
        radius_meters: parseInt(radius),
      });

      if (error) throw error;

      const filtered = type ? data.filter((r) => r.type === type) : data;

      const enriched = filtered.map((r) => ({
        ...r,
        distance_km: parseFloat((r.distance_meters / 1000).toFixed(2)),
      }));

      return res.json({
        success: true,
        data: enriched,
        count: enriched.length,
        query_params: { lat, lng, radius, type },
      });
    }

    let query = supabase
      .from("resources")
      .select("*")
      .eq("disaster_id", disasterId);
    if (type) query = query.eq("type", type);

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;

    res.json({ success: true, data: data || [], count: data?.length || 0 });
  } catch (error) {
    console.error("Get resources error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch resources" });
  }
};

// POST resource
export const createResource = async (req, res) => {
  try {
    const { id: disasterId } = req.params;
    const { name, location_name, type, lat, lng } = req.body;

    if (!name || !type) {
      return res
        .status(400)
        .json({ success: false, error: "Name and type are required" });
    }

    const { data: disaster, error: disasterError } = await supabase
      .from("disasters")
      .select("id")
      .eq("id", disasterId)
      .single();

    if (disasterError || !disaster) {
      return res
        .status(404)
        .json({ success: false, error: "Disaster not found" });
    }

    let coordinates = null;
    let finalLocationName = location_name;

    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      if (
        isNaN(latitude) ||
        isNaN(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid coordinates provided" });
      }
      coordinates = `POINT(${longitude} ${latitude})`;
    } else if (location_name) {
      const geoData = await GeocodingService.geocodeLocationOSM(location_name);
      coordinates = `POINT(${geoData.lng} ${geoData.lat})`;
    } else {
      const extracted = await GeminiService.extractLocation(`name: ${name}`);
      if (extracted?.location_name) {
        finalLocationName = extracted.location_name;
        const geoData = await GeocodingService.geocodeLocationOSM(
          finalLocationName
        );
        coordinates = `POINT(${geoData.lng} ${geoData.lat})`;
      } else {
        return res.status(400).json({
          success: false,
          error: "Please provide either coordinates or a location name",
        });
      }
    }

    const resourceData = {
      disaster_id: disasterId,
      name: name.trim(),
      type,
      ...(finalLocationName && { location_name: finalLocationName.trim() }),
      ...(coordinates && { location: coordinates }),
    };

    const { data, error } = await supabase
      .from("resources")
      .insert([resourceData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
      message: `Resource "${name}" mapped successfully`,
    });
  } catch (error) {
    console.error("Create resource error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create resource. Please try again.",
    });
  }
};

// DELETE resource
export const deleteResource = async (req, res) => {
  try {
    const { id: disasterId, resourceId } = req.params;

    const { data, error } = await supabase
      .from("resources")
      .delete()
      .eq("id", resourceId)
      .eq("disaster_id", disasterId)
      .select()
      .single();

    if (error?.code === "PGRST116") {
      return res
        .status(404)
        .json({ success: false, error: "Resource not found" });
    }

    if (error) throw error;

    res.json({
      success: true,
      message: "Resource deleted successfully",
      data,
    });
  } catch (error) {
    console.error("Delete resource error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete resource" });
  }
};
