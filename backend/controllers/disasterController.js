import supabase from "../config/supabase.js";
import GeminiService from "../services/geminiService.js";
import GeocodingService from "../services/geocodingService.js";
import WebScrapingService from "../services/webScrapingService.js";
import CacheService from "../services/cacheService.js";

const DISASTER_TYPES = [
  "hurricane",
  "earthquake",
  "flood",
  "wildfire",
  "tornado",
  "tsunami",
  "volcano",
  "drought",
];

export const listDisasters = async (req, res) => {
  try {
    const { tag, lat, lng, radius = 10000 } = req.query;
    let query = supabase.from("disasters").select("*");

    if (tag) query = query.contains("tags", [tag]);
    if (lat && lng) {
      query = query.rpc("disasters_within_radius", {
        center_lat: parseFloat(lat),
        center_lng: parseFloat(lng),
        radius_meters: parseInt(radius),
      });
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw error;

    res.json({ success: true, data: data || [], count: data?.length || 0 });
  } catch (error) {
    console.error("Get disasters error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch disasters" });
  }
};

export const getDisasterById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.rpc("get_disaster_with_coords", {
      disaster_uuid: id,
    });
    if (error || !data || data.length === 0)
      return res
        .status(404)
        .json({ success: false, error: "Disaster not found" });
    res.json({ success: true, data: data[0] });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const getOfficialUpdates = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10, disasterType } = req.query;
    const cacheKey = `official_updates_${id}_${limit}_${disasterType || "all"}`;

    const cachedData = await CacheService.get(cacheKey);
    if (
      cachedData?.last_updated &&
      new Date(cachedData.last_updated).getTime() > Date.now() - 60 * 60 * 1000
    ) {
      return res.json({
        success: true,
        data: cachedData,
        cached: true,
        cache_key: cacheKey,
        last_updated: cachedData.last_updated,
      });
    }

    const { data: disaster, error } = await supabase
      .from("disasters")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !disaster)
      return res
        .status(404)
        .json({ success: false, error: "Disaster not found" });

    let updates = [];
    if (disasterType) {
      updates = await WebScrapingService.getUpdatesByDisasterType(
        disasterType,
        parseInt(limit)
      );
    } else {
      const disasterText = `${disaster.title} ${
        disaster.description
      } ${disaster.tags?.join(" ")}`.toLowerCase();
      const matchedType = DISASTER_TYPES.find((type) =>
        disasterText.includes(type)
      );
      updates = matchedType
        ? await WebScrapingService.getUpdatesByDisasterType(
            matchedType,
            parseInt(limit)
          )
        : await WebScrapingService.getAllOfficialUpdates(parseInt(limit));
    }

    const responseData = {
      disaster: {
        id: disaster.id,
        title: disaster.title,
        location_name: disaster.location_name,
        tags: disaster.tags,
      },
      official_updates: updates,
      total_updates: updates.length,
      sources: [...new Set(updates.map((update) => update.source))],
      last_updated: new Date().toISOString(),
    };

    await CacheService.set(cacheKey, responseData, 60);
    res.json({
      success: true,
      data: responseData,
      cached: false,
      cache_key: cacheKey,
      cache_ttl_minutes: 60,
    });
  } catch (error) {
    console.error("Get official updates error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch official updates" });
  }
};

export const createDisaster = async (req, res) => {
  try {
    const { title, location_name, description, tags } = req.body;
    if (!title || !description)
      return res
        .status(400)
        .json({ success: false, error: "Title and description are required" });

    let finalLocationName = location_name;
    let coordinates = null;

    if (!location_name && description) {
      const extracted = await GeminiService.extractLocation(description);
      finalLocationName = extracted.location_name;
    }

    if (finalLocationName) {
      const geoData = await GeocodingService.geocodeLocationOSM(
        finalLocationName
      );
      if (geoData) coordinates = `POINT(${geoData.lng} ${geoData.lat})`;
    }

    const auditEntry = {
      action: "create",
      user_id: req.user.id,
      timestamp: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("disasters")
      .insert([
        {
          title,
          location_name: finalLocationName,
          location: coordinates,
          description,
          tags: tags || [],
          owner_id: req.user.id,
          audit_trail: [auditEntry],
        },
      ])
      .select()
      .single();

    if (error) throw error;
    req.io.emit("disaster_updated", { action: "create", disaster: data });
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error("Create disaster error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create disaster" });
  }
};

export const updateDisaster = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, location_name, description, tags } = req.body;

    const { data: existing, error: fetchError } = await supabase
      .from("disasters")
      .select("*")
      .eq("id", id)
      .single();
    if (fetchError || !existing)
      return res
        .status(404)
        .json({ success: false, error: "Disaster not found" });

    if (req.user.role !== "admin" && existing.owner_id !== req.user.id)
      return res.status(403).json({ success: false, error: "Unauthorized" });

    let coordinates = existing.location;
    if (location_name && location_name !== existing.location_name) {
      const geoData = await GeocodingService.geocodeLocationOSM(location_name);
      if (geoData) coordinates = `POINT(${geoData.lng} ${geoData.lat})`;
    }

    const auditEntry = {
      action: "update",
      user_id: req.user.id,
      timestamp: new Date().toISOString(),
      changes: {
        title:
          title !== existing.title
            ? { old: existing.title, new: title }
            : undefined,
        location_name:
          location_name !== existing.location_name
            ? { old: existing.location_name, new: location_name }
            : undefined,
      },
    };

    const updatedAuditTrail = [...(existing.audit_trail || []), auditEntry];

    const { data, error } = await supabase
      .from("disasters")
      .update({
        title: title || existing.title,
        location_name: location_name || existing.location_name,
        location: coordinates,
        description: description || existing.description,
        tags: tags || existing.tags,
        updated_at: new Date().toISOString(),
        audit_trail: updatedAuditTrail,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    req.io.emit("disaster_updated", { action: "update", disaster: data });
    res.json({ success: true, data });
  } catch (error) {
    console.error("Update disaster error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update disaster" });
  }
};

export const deleteDisaster = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: existing, error: fetchError } = await supabase
      .from("disasters")
      .select("owner_id, title")
      .eq("id", id)
      .single();

    if (fetchError || !existing)
      return res
        .status(404)
        .json({ success: false, error: "Disaster not found" });
    if (req.user.role !== "admin" && existing.owner_id !== req.user.id)
      return res.status(403).json({ success: false, error: "Unauthorized" });

    const { error } = await supabase.from("disasters").delete().eq("id", id);
    if (error) throw error;

    req.io.emit("disaster_updated", { action: "delete", disaster_id: id });
    res.json({ success: true, message: "Disaster deleted successfully" });
  } catch (error) {
    console.error("Delete disaster error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete disaster" });
  }
};
