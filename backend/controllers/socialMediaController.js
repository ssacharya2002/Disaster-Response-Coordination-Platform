import CacheService from "../services/cacheService.js";
import supabase from "../config/supabase.js";
import axios from "axios";

// Mock data
const mockSocialMediaData = [
  {
    id: "1",
    post: "#floodrelief Need food and water in Lower Manhattan. Urgent help needed!",
    user: "citizen1",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    platform: "twitter",
    urgency: "high",
    keywords: ["food", "water", "urgent"],
  },
  {
    id: "2",
    post: "Red Cross shelter available at 123 Main St. #disasterrelief",
    user: "redcross_ny",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    platform: "twitter",
    urgency: "medium",
    keywords: ["shelter", "available"],
  },
  {
    id: "3",
    post: "SOS! Trapped in building on 5th Avenue. Need immediate rescue! #emergency",
    user: "emergency_user",
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    platform: "twitter",
    urgency: "critical",
    keywords: ["SOS", "trapped", "rescue", "emergency"],
  },
];

export const getSocialMediaPosts = async (req, res) => {
  try {
    const { id: disasterId } = req.params;
    const { keywords, limit = 10, priority } = req.query;
    const cacheKey = `social_media_${disasterId}_${keywords || "all"}_${
      priority || "all"
    }`;

    const cachedData = await CacheService.get(cacheKey);
    if (
      cachedData &&
      cachedData.last_updated &&
      new Date(cachedData.last_updated) > new Date(Date.now() - 60 * 60 * 1000)
    ) {
      return res.json({
        success: true,
        data: cachedData.posts,
        cached: true,
        last_updated: cachedData.last_updated,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 500)); // simulate delay

    let filteredData = [...mockSocialMediaData];

    if (keywords) {
      const keywordList = keywords
        .split(",")
        .map((k) => k.trim().toLowerCase());
      filteredData = filteredData.filter((post) =>
        keywordList.some(
          (k) =>
            post.post.toLowerCase().includes(k) ||
            post.keywords.some((kw) => kw.toLowerCase().includes(k))
        )
      );
    }

    if (priority) {
      filteredData = filteredData.filter((post) => post.urgency === priority);
    }

    filteredData = filteredData.slice(0, parseInt(limit));

    const randomizedData = filteredData.map((post) => ({
      ...post,
      engagement: Math.floor(Math.random() * 100) + 10,
      retweets: Math.floor(Math.random() * 50),
      location_mentioned: Math.random() > 0.5,
    }));

    const resultData = {
      posts: randomizedData,
      last_updated: new Date().toISOString(),
      total_count: randomizedData.length,
    };

    await CacheService.set(cacheKey, resultData, 60);

    res.json({
      success: true,
      data: resultData.posts,
      cached: false,
      last_updated: resultData.last_updated,
    });
  } catch (error) {
    console.error("Social media fetch error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch social media data" });
  }
};

export const fetchTwitterPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `social-media:${id}`;

    const { data: cached } = await supabase
      .from("cache")
      .select("value, expires_at")
      .eq("key", cacheKey)
      .maybeSingle();

    if (cached) return res.json(cached.value);

    const { data: disaster, error: disasterError } = await supabase
      .from("disasters")
      .select("tags, location_name")
      .eq("id", id)
      .maybeSingle();

    if (!disaster || disasterError) {
      return res.status(404).json({ error: "Disaster not found" });
    }

    const keywords = [...(disaster.tags || []), disaster.location_name || ""]
      .filter(Boolean)
      .map((k) => `"${k}"`)
      .join(" OR ");

    const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

    const twitterRes = await axios.get(
      "https://api.twitter.com/2/tweets/search/recent",
      {
        headers: {
          Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
        },
        params: {
          query: keywords,
          max_results: 2,
          "tweet.fields": "created_at,author_id,text",
        },
      }
    );

    const tweets = twitterRes.data.data || [];

    await supabase.from("cache").upsert({
      key: cacheKey,
      value: tweets,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });

    return res.json(tweets);
  } catch (err) {
    console.error("Twitter API error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to fetch from Twitter API" });
  }
};

export const getMockSocialMedia = async (req, res) => {
  try {
    const { keywords, urgent_only } = req.query;
    let data = [...mockSocialMediaData];

    if (urgent_only === "true") {
      data = data.filter(
        (post) => post.urgency === "critical" || post.urgency === "high"
      );
    }

    if (keywords) {
      const keywordList = keywords
        .split(",")
        .map((k) => k.trim().toLowerCase());
      data = data.filter((post) =>
        keywordList.some((k) => post.post.toLowerCase().includes(k))
      );
    }

    res.json({
      success: true,
      data,
      source: "mock_api",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Mock social media error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch mock social media data",
    });
  }
};
