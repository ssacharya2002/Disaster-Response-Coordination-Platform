import { useState, useEffect } from "react";

import ResourceCard from "./ResourceCard";

const ResourceMap = ({ apiBase, disasters, selectedDisaster }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDisasterId, setSelectedDisasterId] = useState("");
  const [createDisasterId, setCreateDisasterId] = useState("");
  const [coordinates, setCoordinates] = useState({
    lat: "40.7128",
    lng: "-74.0060",
  });
  const [radius, setRadius] = useState(10000);
  const [resourceType, setResourceType] = useState("");
  const [newResource, setNewResource] = useState({
    name: "",
    location_name: "",
    type: "shelter",
    lat: "",
    lng: "",
  });
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    if (selectedDisaster) {
      setSelectedDisasterId(selectedDisaster.id);
      setCreateDisasterId(selectedDisaster.id);
    }
  }, [selectedDisaster]);

  const fetchResources = async () => {
    if (!selectedDisasterId) {
      alert("Please select a disaster first");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (coordinates.lat && coordinates.lng) {
        params.append("lat", coordinates.lat);
        params.append("lng", coordinates.lng);
        params.append("radius", radius);
      }
      if (resourceType) params.append("type", resourceType);

      const url = `${apiBase}/resources/disasters/${selectedDisasterId}/resources?${params}`;
      console.log("Fetching resources from:", url);

      const res = await fetch(url);
      const result = await res.json();

      console.log("Fetch response:", result);

      if (result.success) {
        setResources(result.data || []);
      } else {
        console.error("Fetch error:", result.error);
        alert(`Error fetching resources: ${result.error}`);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to fetch resources");
    } finally {
      setLoading(false);
    }
  };

  const addResource = async (e) => {
    e.preventDefault();

    if (!createDisasterId) {
      alert("Please select a disaster first");
      return;
    }

    if (!newResource.name.trim()) {
      alert("Please enter a resource name");
      return;
    }

    // Validate coordinates if provided
    if (
      (newResource.lat && !newResource.lng) ||
      (!newResource.lat && newResource.lng)
    ) {
      alert("Please provide both latitude and longitude, or leave both empty");
      return;
    }

    const payload = {
      name: newResource.name.trim(),
      location_name: newResource.location_name.trim() || undefined,
      type: newResource.type,
    };

    // Only add coordinates if both are provided and valid
    if (newResource.lat && newResource.lng) {
      const lat = parseFloat(newResource.lat);
      const lng = parseFloat(newResource.lng);

      if (isNaN(lat) || isNaN(lng)) {
        alert("Please enter valid numeric coordinates");
        return;
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        alert(
          "Please enter valid coordinate ranges (lat: -90 to 90, lng: -180 to 180)"
        );
        return;
      }

      payload.lat = lat;
      payload.lng = lng;
    }

    console.log("Adding resource with disaster ID:", createDisasterId);
    console.log("Payload:", payload);

    try {
      const url = `${apiBase}/resources/disasters/${createDisasterId}/resources`;
      console.log("POST URL:", url);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log("Add resource response:", result);

      if (result.success) {
        // Reset form
        setNewResource({
          name: "",
          location_name: "",
          type: "shelter",
          lat: "",
          lng: "",
        });

        // Refresh resources if we're viewing the same disaster
        if (selectedDisasterId === createDisasterId) {
          fetchResources();
        }

        alert("Resource added successfully!");
      } else {
        console.error("API error:", result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error("Network error:", err);
      alert(
        "Failed to add resource. Please check your connection and try again."
      );
    }
  };

  const getCurrentLocation = (target = "search") => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setGettingLocation(true);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // Cache for 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);

        if (target === "search") {
          setCoordinates({ lat, lng });
          alert(`Location updated!\nLatitude: ${lat}\nLongitude: ${lng}`);
        } else if (target === "resource") {
          setNewResource((prev) => ({ ...prev, lat, lng }));
          alert(
            `Resource location updated!\nLatitude: ${lat}\nLongitude: ${lng}`
          );
        }

        setGettingLocation(false);
      },
      (error) => {
        setGettingLocation(false);
        let errorMsg = "Unable to get location. ";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += "Location access denied by user.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMsg += "Location request timed out.";
            break;
          default:
            errorMsg += "An unknown error occurred.";
            break;
        }

        alert(errorMsg + " Please enter coordinates manually.");
      },
      options
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="p-6 space-y-6">
        <div className="bg-white shadow-md p-4 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">🏥 Resource Mapping</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Select Disaster</label>
              <select
                value={selectedDisasterId}
                onChange={(e) => setSelectedDisasterId(e.target.value)}
                className="w-full border px-3 py-2 rounded-md mt-1"
              >
                <option value="">Choose a disaster...</option>
                {disasters.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} - {d.location_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-medium">Coordinates (Search Center)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={coordinates.lat}
                  onChange={(e) =>
                    setCoordinates({ ...coordinates, lat: e.target.value })
                  }
                  className="w-1/2 border px-3 py-2 rounded-md"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={coordinates.lng}
                  onChange={(e) =>
                    setCoordinates({ ...coordinates, lng: e.target.value })
                  }
                  className="w-1/2 border px-3 py-2 rounded-md"
                />
              </div>
              <button
                type="button"
                onClick={() => getCurrentLocation("search")}
                disabled={gettingLocation}
                className="text-sm px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition disabled:bg-gray-400 flex items-center justify-center gap-1"
              >
                {gettingLocation ? (
                  <>🔄 Getting Location...</>
                ) : (
                  <>📍 Use My Location</>
                )}
              </button>
            </div>

            <div>
              <label className="block font-medium">Radius (meters)</label>
              <input
                type="number"
                min="100"
                max="50000"
                step="100"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="w-full border px-3 py-2 rounded-md mt-1"
              />
            </div>

            <div>
              <label className="block font-medium">Resource Type</label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="w-full border px-3 py-2 rounded-md mt-1"
              >
                <option value="">All Types</option>
                <option value="shelter">Shelter</option>
                <option value="hospital">Hospital</option>
                <option value="food">Food</option>
                <option value="water">Water</option>
                <option value="medical">Medical</option>
                <option value="evacuation">Evacuation</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                onClick={fetchResources}
                disabled={!selectedDisasterId || loading}
                className="w-full md:w-auto px-6 py-2 mt-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {loading ? "Loading..." : "Find Resources"}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md p-4 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">➕ Add Resource</h3>
          <form onSubmit={addResource} className="space-y-3">
            <div>
              <label className="block font-medium mb-1">
                Select Disaster for New Resource
              </label>
              <select
                value={createDisasterId}
                onChange={(e) => setCreateDisasterId(e.target.value)}
                className="w-full border px-3 py-2 rounded-md"
                required
              >
                <option value="">Choose a disaster...</option>
                {disasters.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} - {d.location_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <input
                required
                placeholder="Resource Name *"
                className="flex-1 border px-3 py-2 rounded-md"
                value={newResource.name}
                onChange={(e) =>
                  setNewResource({ ...newResource, name: e.target.value })
                }
              />
              <select
                className="w-full md:w-48 border px-3 py-2 rounded-md"
                value={newResource.type}
                onChange={(e) =>
                  setNewResource({ ...newResource, type: e.target.value })
                }
              >
                <option value="shelter">Shelter</option>
                <option value="hospital">Hospital</option>
                <option value="food">Food</option>
                <option value="water">Water</option>
                <option value="medical">Medical</option>
                <option value="evacuation">Evacuation</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Location name (optional - will be geocoded if coordinates not provided)"
              className="w-full border px-3 py-2 rounded-md"
              value={newResource.location_name}
              onChange={(e) =>
                setNewResource({
                  ...newResource,
                  location_name: e.target.value,
                })
              }
            />

            <div className="flex flex-col md:flex-row gap-2">
              <input
                type="number"
                step="any"
                placeholder="Latitude (optional)"
                className="w-full border px-3 py-2 rounded-md"
                value={newResource.lat}
                onChange={(e) =>
                  setNewResource({ ...newResource, lat: e.target.value })
                }
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude (optional)"
                className="w-full border px-3 py-2 rounded-md"
                value={newResource.lng}
                onChange={(e) =>
                  setNewResource({ ...newResource, lng: e.target.value })
                }
              />
            </div>

            <button
              type="button"
              onClick={() => getCurrentLocation("resource")}
              disabled={gettingLocation}
              className="w-full md:w-auto text-sm px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition disabled:bg-gray-400 flex items-center justify-center gap-1"
            >
              {gettingLocation ? (
                <>🔄 Getting Location...</>
              ) : (
                <>📍 Use My Current Location</>
              )}
            </button>

            <div className="text-sm text-gray-600">
              <p>* Either provide coordinates OR location name (or both)</p>
              <p>
                * If no coordinates provided, location name will be geocoded
                automatically
              </p>
              <p>
                * Use the "📍 Use My Current Location" button to automatically
                fill coordinates
              </p>
            </div>

            <button
              type="submit"
              disabled={!createDisasterId}
              className="w-full md:w-auto px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:bg-gray-400"
            >
              Add Resource
            </button>
          </form>
        </div>

        <div>
          <h3 className="text-lg font-semibold mt-6 mb-2">
            📦 Found Resources ({resources.length})
          </h3>

          {resources.length === 0 ? (
            <p className="text-gray-500 italic">
              No resources found.{" "}
              {selectedDisasterId
                ? "Adjust filters or try again."
                : "Please select a disaster first."}
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((r) => (
                <ResourceCard resource={r} key={r.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceMap;
