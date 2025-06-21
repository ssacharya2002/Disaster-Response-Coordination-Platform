import supabase from "../config/supabase.js";

class CacheService {
  static async get(key) {
    try {
      const { data, error } = await supabase
        .from("cache")
        .select("value")
        .eq("key", key)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (error || !data) return null;
      return data.value;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  static async set(key, value, ttlMinutes = 60) {
    try {
      const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

      const { data, error } = await supabase.from("cache").upsert(
        {
          key,
          value,
          expires_at: expiresAt.toISOString(),
        },
        { onConflict: "key" }
      );

      return !error;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  }

  static async delete(key) {
    try {
      const { error } = await supabase.from("cache").delete().eq("key", key);

      return !error;
    } catch (error) {
      console.error("Cache delete error:", error);
      return false;
    }
  }

  static async cleanup() {
    try {
      const { error } = await supabase
        .from("cache")
        .delete()
        .lt("expires_at", new Date().toISOString());

      return !error;
    } catch (error) {
      console.error("Cache cleanup error:", error);
      return false;
    }
  }
}

export default CacheService;
