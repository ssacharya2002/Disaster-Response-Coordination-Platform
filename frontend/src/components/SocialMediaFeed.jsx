 

import { useState, useEffect } from "react";

const SocialMediaFeed = ({ apiBase, disasters, selectedDisaster }) => {
  const [socialData, setSocialData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDisasterId, setSelectedDisasterId] = useState("");
  const [filters, setFilters] = useState({
    keywords: "",
    priority: "",
    limit: 10,
  });

  const fetchSocialMedia = async (disasterId) => {
    if (!disasterId) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.keywords) params.append("keywords", filters.keywords);
      if (filters.priority) params.append("priority", filters.priority);
      params.append("limit", filters.limit);

      const response = await fetch(
        `${apiBase}/social-media/disasters/${disasterId}/social-media?${params}`
      );
      const result = await response.json();

      if (result.success) {
        setSocialData(result.data);
      } else {
        console.error("Social media fetch error:", result.error);
      }
    } catch (error) {
      console.error("Social media fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMockData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.keywords) params.append("keywords", filters.keywords);
      if (filters.priority === "critical" || filters.priority === "high") {
        params.append("urgent_only", "true");
      }

      const response = await fetch(
        `${apiBase}/social-media/mock-social-media?${params}`
      );
      const result = await response.json();

      if (result.success) {
        setSocialData(result.data);
      }
    } catch (error) {
      console.error("Mock social media fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDisaster) {
      setSelectedDisasterId(selectedDisaster.id);
    }
  }, [selectedDisaster]);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "critical":
        return "text-red-600";
      case "high":
        return "text-orange-500";
      case "medium":
        return "text-yellow-500";
      default:
        return "text-green-600";
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case "critical":
        return "\ud83d\udea8";
      case "high":
        return "\u26a0\ufe0f";
      case "medium":
        return "\ud83d\udce2";
      default:
        return "\u2139\ufe0f";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">
              📱 Social Media Monitoring
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <select
              value={selectedDisasterId}
              onChange={(e) => setSelectedDisasterId(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              <option value="">Select Disaster</option>
              {disasters.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} - {d.location_name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Keywords"
              value={filters.keywords}
              onChange={(e) =>
                setFilters({ ...filters, keywords: e.target.value })
              }
              className="border px-3 py-2 rounded"
            />

            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value })
              }
              className="border px-3 py-2 rounded"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <input
              type="number"
              min="1"
              max="50"
              value={filters.limit}
              onChange={(e) =>
                setFilters({ ...filters, limit: e.target.value })
              }
              className="border px-3 py-2 rounded"
              placeholder="Limit"
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={() => fetchSocialMedia(selectedDisasterId)}
              disabled={!selectedDisasterId || loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Loading..." : "Fetch Real Data"}
            </button>

            <button
              onClick={fetchMockData}
              disabled={loading}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Load Mock Data
            </button>
          </div>
        </div>

        {socialData.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold">
              Reports ({socialData.length})
            </h3>
            <div className="grid gap-4 mt-4">
              {socialData.map((post) => (
                <div
                  key={post.id}
                  className="border-l-4 p-4 bg-white shadow rounded"
                  style={{
                    borderColor: getUrgencyColor(post.urgency).replace(
                      "text-",
                      ""
                    ),
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <strong>@{post.user}</strong>
                      <span className="ml-2 text-sm text-gray-500">
                        {post.platform}
                      </span>
                    </div>
                    <div
                      className={`text-sm font-semibold ${getUrgencyColor(
                        post.urgency
                      )}`}
                    >
                      {getUrgencyIcon(post.urgency)} {post.urgency}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{post.post}</p>
                  <div className="text-sm text-gray-500 flex flex-wrap gap-2">
                    <span>{new Date(post.timestamp).toLocaleString()}</span>
                    {post.keywords?.length > 0 && (
                      <span>
                        {post.keywords.map((k) => (
                          <span key={k} className="mr-1 text-blue-600">
                            #{k}
                          </span>
                        ))}
                      </span>
                    )}
                    {post.engagement && (
                      <span>
                        👍 {post.engagement}{" "}
                        {post.retweets && <>🔄 {post.retweets}</>}{" "}
                        {post.location_mentioned && <>📍 Location</>}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && socialData.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p>
              No data loaded yet. Select a disaster and fetch data or load mock
              data.
            </p>
            <ul className="list-disc list-inside mt-4 text-left max-w-md mx-auto">
              <li>🚨 Critical alerts (SOS, trapped, emergency)</li>
              <li>⚠️ High priority needs (food, water, medical)</li>
              <li>📢 Medium priority updates (shelter availability)</li>
              <li>Real-time timestamps and engagement metrics</li>
            </ul>
          </div>
        )}

        {loading && (
          <div className="text-center text-blue-600 mt-6">
            Loading social media data...
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaFeed;
