import { useEffect, useState, useRef } from "react";
import {
  MapPin,
  Calendar,
  User,
  Tag,
  Clock,
  AlertTriangle,
  ChevronLeft,
} from "lucide-react";
import { useParams } from "react-router-dom";
import ResourceCard from "./ResourceCard";
import OfficialUpdates from "./OfficialUpdates";
import UserReports from "./UserReports";

const DisasterDetail = ({ currentUser: currentUserId }) => {
  const id = useParams().id || null;
  const [disasterDetail, setDisasterDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapboxMap, setMapboxMap] = useState(null);
  const mapContainer = useRef(null);
  const [resources, setResources] = useState([]);

  // Mock users object, similar to backend
  const users = {
    netrunnerX: { id: "netrunnerX", role: "admin" },
    reliefAdmin: { id: "reliefAdmin", role: "admin" },
    citizen1: { id: "citizen1", role: "contributor" },
  };

  const currentUser = users[currentUserId] || users["citizen1"];
  const isAdmin = currentUser.role === "admin";

  const [coordinates, setCoordinates] = useState({
    lat: "40.7128",
    lng: "-74.0060",
  });
  const [gettingLocation, setGettingLocation] = useState(false);

  const apiBase = import.meta.env.VITE_REACT_APP_API_URL;

  const fetchDisasterDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${apiBase}/disasters/${id}`);
      if (!response.ok) {
        setError(
          response.status === 404
            ? "Disaster not found"
            : "Failed to fetch disaster details"
        );
        return;
      }
      const data = await response.json();
      if (data.success && data.data) {
        setDisasterDetail(data.data);
      } else {
        setError("Disaster not found");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error fetching disaster details");
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (!mapContainer.current || !disasterDetail || mapboxMap) return;

    if (!document.getElementById("mapbox-css")) {
      const link = document.createElement("link");
      link.id = "mapbox-css";
      link.href = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }

    if (!window.mapboxgl) {
      const script = document.createElement("script");
      script.src = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js";
      script.onload = () => createMap();
      document.head.appendChild(script);
    } else {
      createMap();
    }
  };

  const createMap = () => {
    if (!window.mapboxgl || !disasterDetail) return;
    window.mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    const map = new window.mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v10",
      center: [disasterDetail.lng, disasterDetail.lat],
      zoom: 13,
    });

    map.on("load", () => {
      new window.mapboxgl.Marker({ color: "#ef4444" })
        .setLngLat([disasterDetail.lng, disasterDetail.lat])
        .setPopup(
          new window.mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="p-2"><strong>${disasterDetail.title}</strong><br/>${disasterDetail.location_name}</div>`
          )
        )
        .addTo(map);
    });

    setMapboxMap(map);
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
          // setNewResource((prev) => ({ ...prev, lat, lng }));
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

  const fetchResources = async () => {
    if (!id) {
      return;
    }

    const apiBase = import.meta.env.VITE_REACT_APP_API_URL;

    const url = `${apiBase}/resources/disasters/${id}/resources?lat=${coordinates.lat}&lng=${coordinates.lng}&radius=10000`;

    try {
      const res = await fetch(url);
      const result = await res.json();
      if (result.success) {
        setResources(result.data || []);
      } else {
        console.error("Fetch error:", result.error);
        alert(`Error fetching resources: ${result.error}`);
      }

      console.log("Resources fetched:", result.data);
    } catch (err) {
      console.error("Error:", err);
      alert("Error fetching resources");
    }
  };

  useEffect(() => {
    if (id) {
      fetchDisasterDetail();
    }
  }, [id]);

  useEffect(() => {
    if (disasterDetail && !mapboxMap) initializeMap();
  }, [disasterDetail, mapboxMap]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getTagColor = (tag) => {
    const colors = {
      urgent: "bg-red-100 text-red-700",
      flood: "bg-blue-100 text-blue-700",
      fire: "bg-orange-100 text-orange-700",
      earthquake: "bg-yellow-100 text-yellow-800",
      food: "bg-green-100 text-green-700",
      medical: "bg-purple-100 text-purple-700",
      default: "bg-gray-200 text-gray-700",
    };
    return colors[tag.toLowerCase()] || colors.default;
  };

  if (!id || loading || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-700 text-lg">
                Loading disaster details...
              </p>
            </>
          ) : (
            <>
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Disaster Not Found
              </h2>
              <p className="text-gray-500">{error}</p>
              <button
                onClick={() => window.history.back()}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <ChevronLeft className="h-4 w-4 mr-2" /> Go Back
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-start justify-between flex-wrap">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {disasterDetail.title}
              </h1>
              <div className="flex items-center text-gray-500 mb-2">
                <MapPin className="h-5 w-5 mr-2 text-red-500" />
                <span>{disasterDetail.location_name}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {disasterDetail.tags?.map((tag, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getTagColor(
                    tag
                  )}`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left - Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                Description
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                {disasterDetail.description}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Quick Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <InfoRow
                  icon={<User className="text-green-500" />}
                  label="Reported by"
                  value={disasterDetail.owner_id}
                />
                <InfoRow
                  icon={<Calendar className="text-purple-500" />}
                  label="Created"
                  value={formatDate(disasterDetail.created_at)}
                />
                <InfoRow
                  icon={<Clock className="text-yellow-500" />}
                  label="Updated"
                  value={formatDate(disasterDetail.updated_at)}
                />
                <InfoRow
                  icon={<MapPin className="text-red-500" />}
                  label="Location"
                  value={disasterDetail.location_name}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2 text-indigo-500" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {disasterDetail.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getTagColor(
                      tag
                    )}`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {disasterDetail.audit_trail?.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-500" />
                  Activity Timeline
                </h2>
                <div className="space-y-4">
                  {disasterDetail.audit_trail.map((entry, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="capitalize font-medium">
                            {entry.action}
                          </span>
                          <span className="text-gray-500">
                            by {entry.user_id}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDate(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right - Map */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-red-500" />
                Location Map
              </h3>
              <div className="space-y-4 text-sm text-gray-600">
                <p>
                  <strong>Address:</strong> {disasterDetail.location_name}
                </p>
                <p>
                  <strong>Coordinates:</strong> {disasterDetail.lat},{" "}
                  {disasterDetail.lng}
                </p>
                <div
                  ref={mapContainer}
                  className="w-full h-96 rounded-lg border border-gray-200"
                  style={{ minHeight: "400px" }}
                />
                <p className="text-xs text-gray-400 text-center">
                  Red marker indicates disaster location
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Official Updates */}
        <OfficialUpdates disasterId={id} />

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mt-8">
          <h1 className="text-2xl font-bold">Resources</h1>

          <div className="mt-4 space-y-4">
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

            <div className="md:col-span-2">
              <button
                onClick={fetchResources}
                disabled={!id || loading}
                className="w-full md:w-auto px-6 py-2 mt-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {loading ? "Loading..." : "Find Resources"}
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.length
              ? resources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))
              : "No resources found for this disaster. use your location to find resources."}
          </div>
        </div>

        <UserReports disasterId={id} currentUser={currentUserId} />
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1">{icon}</div>
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="text-gray-800 font-medium">{value}</p>
    </div>
  </div>
);

export default DisasterDetail;
