 

import { useState } from "react";

const GeocodeTest = ({ apiBase }) => {
  const [input, setInput] = useState({
    description: "",
    location_name: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testGeocode = async (e) => {
    e.preventDefault();
    if (!input.description && !input.location_name) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/geocode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const result = await response.json();

      if (result.success) {
        setResult(result.data);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert("Failed to geocode");
    } finally {
      setLoading(false);
    }
  };

  const sampleInputs = [
    {
      description:
        "Heavy flooding reported in downtown Manhattan near Times Square. Multiple streets are underwater and emergency services are responding.",
      location_name: "",
    },
    {
      description:
        "Earthquake damage assessment needed urgently. Buildings collapsed and residents evacuated.",
      location_name: "San Francisco, CA",
    },
    {
      description: "",
      location_name: "Brooklyn Bridge, New York",
    },
  ];

  const loadSample = (sample) => {
    setInput(sample);
    setResult(null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="max-w-4xl mx-auto mt-10 px-4">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-gray-800">
            🗺️ Geocoding Test
          </h2>
          <p className="text-gray-600">
            Test AI location extraction and coordinate conversion
          </p>
        </div>

        <form
          onSubmit={testGeocode}
          className="bg-white p-6 rounded-lg shadow space-y-4 mb-8"
        >
          <div>
            <label
              htmlFor="description"
              className="block font-medium text-gray-700 mb-1"
            >
              Description (for AI extraction)
            </label>
            <textarea
              id="description"
              rows={4}
              value={input.description}
              onChange={(e) =>
                setInput({ ...input, description: e.target.value })
              }
              placeholder="Describe a disaster situation with location details..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="location_name"
              className="block font-medium text-gray-700 mb-1"
            >
              Or Direct Location Name
            </label>
            <input
              id="location_name"
              value={input.location_name}
              onChange={(e) =>
                setInput({ ...input, location_name: e.target.value })
              }
              placeholder="e.g., Manhattan, NYC"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={(!input.description && !input.location_name) || loading}
            className={`w-full py-3 px-6 font-semibold rounded-lg text-white transition ${
              loading || (!input.description && !input.location_name)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing..." : "Extract & Geocode"}
          </button>
        </form>

        <div className="mb-10">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            Sample Inputs:
          </h4>
          <div className="grid gap-4">
            {sampleInputs.map((sample, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col sm:flex-row justify-between gap-4"
              >
                <div>
                  {sample.description && (
                    <p>
                      <strong>Description:</strong> {sample.description}
                    </p>
                  )}
                  {sample.location_name && (
                    <p>
                      <strong>Location:</strong> {sample.location_name}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => loadSample(sample)}
                  className="self-start sm:self-center px-4 py-1 rounded bg-blue-100 text-blue-800 text-sm hover:bg-blue-200"
                >
                  Use This Sample
                </button>
              </div>
            ))}
          </div>
        </div>

        {result && (
          <div className="bg-green-50 border border-green-200 p-6 rounded-lg shadow mb-10">
            <h3 className="text-xl font-bold text-green-800 mb-4">
              ✅ Geocoding Result
            </h3>

            {result.location_name ? (
              <>
                <div className="mb-4">
                  <h4 className="font-semibold">📍 Extracted Location:</h4>
                  <p className="text-gray-800">{result.location_name}</p>
                </div>

                {result.coordinates ? (
                  <div className="mb-4">
                    <h4 className="font-semibold">🌐 Coordinates:</h4>
                    <p>
                      <strong>Latitude:</strong> {result.coordinates.lat}
                    </p>
                    <p>
                      <strong>Longitude:</strong> {result.coordinates.lng}
                    </p>

                    {result.formatted_address && (
                      <p className="mt-2 text-gray-700">
                        <strong>Formatted Address:</strong>{" "}
                        {result.formatted_address}
                      </p>
                    )}

                    <div className="mt-4 flex gap-4 flex-wrap">
                      <a
                        href={`https://www.google.com/maps?q=${result.coordinates.lat},${result.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        📍 View on Google Maps
                      </a>
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${result.coordinates.lat}&mlon=${result.coordinates.lng}&zoom=15`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        🗺️ View on OpenStreetMap
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-600">
                    ❌ Could not convert to coordinates
                  </p>
                )}
              </>
            ) : (
              <p className="text-red-600">
                ❌ {result.message || "No location found"}
              </p>
            )}

            <div className="text-xs text-gray-500 mt-4">
              Processed at:{" "}
              {new Date(result.geocoded_at || Date.now()).toLocaleString()}
            </div>
          </div>
        )}

        <div className="bg-gray-100 p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">
            🔧 How Geocoding Works:
          </h4>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div>
              <h5 className="font-medium text-gray-800">
                1. AI Location Extraction
              </h5>
              <p className="text-sm text-gray-600">
                Google Gemini API analyzes text to identify location names.
              </p>
            </div>
            <div>
              <h5 className="font-medium text-gray-800">
                2. Geocoding Service
              </h5>
              <p className="text-sm text-gray-600">
                OpenStreetMap Nominatim converts location names to coordinates.
              </p>
            </div>
            <div>
              <h5 className="font-medium text-gray-800">
                3. Coordinate Storage
              </h5>
              <p className="text-sm text-gray-600">
                Results stored as PostGIS POINT geometry for spatial queries.
              </p>
            </div>
          </div>

          <h5 className="font-medium text-gray-800 mb-2">
            Supported Location Formats:
          </h5>
          <ul className="list-disc list-inside text-sm text-gray-600">
            <li>City, State (e.g., "New York, NY")</li>
            <li>Neighborhood (e.g., "Manhattan")</li>
            <li>Landmarks (e.g., "Times Square")</li>
            <li>Addresses (e.g., "123 Main St, NYC")</li>
            <li>Natural language (e.g., "downtown area near the river")</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GeocodeTest;
