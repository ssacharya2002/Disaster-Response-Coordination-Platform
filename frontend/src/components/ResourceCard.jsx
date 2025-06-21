import React from "react";

function ResourceCard({ resource, key }) {

  console.log("ResourceCard", resource);
  
  const getResourceIcon = (type) => {
    switch (type) {
      case "shelter":
        return "🏠";
      case "hospital":
        return "🏥";
      case "food":
        return "🍽️";
      case "water":
        return "💧";
      case "medical":
        return "⚕️";
      case "evacuation":
        return "🚌";
      default:
        return "📍";
    }
  };

  const getResourceColor = (type) => {
    switch (type) {
      case "shelter":
        return "border-green-500";
      case "hospital":
        return "border-red-500";
      case "food":
        return "border-orange-500";
      case "water":
        return "border-blue-500";
      case "medical":
        return "border-purple-500";
      case "evacuation":
        return "border-gray-600";
      default:
        return "border-gray-400";
    }
  };

  return (
    <div
    key={key}
      className={`border-l-4 ${getResourceColor(
        resource.type
      )} bg-white shadow p-5 rounded-xl transition hover:shadow-md flex flex-col gap-2`}
      style={{
        background:
          "linear-gradient(135deg, #fff 80%, rgba(245,245,245,0.7) 100%)",
      }}
    >
      <div className="flex items-center gap-3 mb-1">
        <span
          className={`text-2xl p-2 rounded-full bg-opacity-10 ${
            resource.type === "shelter"
              ? "bg-green-100 text-green-600"
              : resource.type === "hospital"
              ? "bg-red-100 text-red-600"
              : resource.type === "food"
              ? "bg-orange-100 text-orange-600"
              : resource.type === "water"
              ? "bg-blue-100 text-blue-600"
              : resource.type === "medical"
              ? "bg-purple-100 text-purple-600"
              : resource.type === "evacuation"
              ? "bg-gray-200 text-gray-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {getResourceIcon(resource.type)}
        </span>
        <div>
          <h4 className="font-bold text-lg text-gray-800">{resource.name}</h4>
          <span
            className={`text-xs font-semibold uppercase tracking-wide ${
              resource.type === "shelter"
                ? "text-green-600"
                : resource.type === "hospital"
                ? "text-red-600"
                : resource.type === "food"
                ? "text-orange-600"
                : resource.type === "water"
                ? "text-blue-600"
                : resource.type === "medical"
                ? "text-purple-600"
                : resource.type === "evacuation"
                ? "text-gray-700"
                : "text-gray-500"
            }`}
          >
            {resource.type}
          </span>
        </div>
      </div>
      {resource.location_name && (
        <p className="text-sm text-gray-700 flex items-center gap-1">
          <span>📍</span>
          <span>{resource.location_name}</span>
        </p>
      )}
      {resource.distance_km !== undefined && (
        <p className="text-sm text-blue-700 flex items-center gap-1">
          <span>📏</span>
          <span>{resource.distance_km} km away</span>
        </p>
      )}
      <p className="text-xs text-gray-400 mt-1">
        Added: {new Date(resource.created_at).toLocaleDateString()}
      </p>
    </div>
  );
}

export default ResourceCard;
