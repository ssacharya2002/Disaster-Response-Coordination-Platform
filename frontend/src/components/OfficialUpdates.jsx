import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

const OfficialUpdates = ({ disasterId }) => {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const apiBase = import.meta.env.VITE_REACT_APP_API_URL;
  
    useEffect(() => {
      if (!disasterId) return;
      setLoading(true);
      setError(null);
      fetch(
        `${apiBase}/disasters/${disasterId}/official-updates?limit=3`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data && data.data.official_updates) {
            setUpdates(data.data.official_updates);
          } else {
            setUpdates([]);
            setError("No official updates found.");
          }
        })
        .catch(() => setError("Failed to fetch official updates."))
        .finally(() => setLoading(false));
    }, [disasterId]);
  
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-blue-200 mt-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-700">
          <AlertTriangle className="h-5 w-5 text-blue-500" />
          Official Updates
        </h2>
        {loading ? (
          <div className="text-gray-500">Loading official updates...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : updates.length === 0 ? (
          <div className="text-gray-500">No official updates available.</div>
        ) : (
          <ul className="space-y-4">
            {updates.map((update, idx) => (
              <li
                key={update.link || update.timestamp || idx}
                className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50 rounded"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase text-blue-600">
                    {update.source}
                  </span>
                  <span className="text-xs text-gray-400">
                    {update.date ||
                      (update.timestamp &&
                        new Date(update.timestamp).toLocaleDateString())}
                  </span>
                </div>
                <a
                  href={update.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-800 hover:underline"
                >
                  {update.title}
                </a>
                <p className="text-sm text-gray-700 mt-1">{update.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  export default OfficialUpdates