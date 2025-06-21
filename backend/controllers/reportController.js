import supabase from "../config/supabase.js";

export const createReport = async (req, res) => {
  try {
    const { id: disasterId } = req.params;
    const { user_id, content, image_url } = req.body;
    if (!user_id || !content) {
      return res.status(400).json({ success: false, error: "user_id and content are required" });
    }

    // Check disaster exists
    const { data: disaster, error: disasterError } = await supabase
      .from("disasters")
      .select("id")
      .eq("id", disasterId)
      .single();
    if (disasterError || !disaster) {
      return res.status(404).json({ success: false, error: "Disaster not found" });
    }

    const reportData = {
      disaster_id: disasterId,
      user_id,
      content,
      ...(image_url && { image_url }),
    };

    const { data, error } = await supabase
      .from("reports")
      .insert([reportData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error("Create report error:", error);
    res.status(500).json({ success: false, error: "Failed to create report" });
  }
};

export const getReportsByDisasterId = async (req, res) => {
  try {
    const { id: disasterId } = req.params;
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("disaster_id", disasterId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: data || [], count: data?.length || 0 });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch reports" });
  }
};

export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { verification_status } = req.body;

    if (verification_status === undefined) {
      return res
        .status(400)
        .json({ success: false, error: "Verification status is required" });
    }

    const { data, error } = await supabase
      .from("reports")
      .update({ verification_status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data)
      return res.status(404).json({ success: false, error: "Report not found" });

    res.json({ success: true, data });
  } catch (error) {
    console.error("Update report error:", error);
    res.status(500).json({ success: false, error: "Failed to update report" });
  }
}; 