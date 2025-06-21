import { useState } from "react";
import { Link } from "react-router-dom";
import DisasterForm from "./DisasterForm";

const DisasterList = ({
  disasters,
  apiBase,
  currentUser,
  onDisasterUpdated,
}) => {
  const [filter, setFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [editingDisaster, setEditingDisaster] = useState(null);

  const handleDelete = async (disasterId) => {
    if (!window.confirm("Are you sure you want to delete this disaster?"))
      return;

    try {
      const response = await fetch(`${apiBase}/disasters/${disasterId}`, {
        method: "DELETE",
        headers: {
          "X-User-ID": currentUser,
        },
      });

      if (response.ok) {
        onDisasterUpdated();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete disaster");
    }
  };

  const handleEdit = (disaster) => {
    setEditingDisaster(disaster);
  };

  const handleEditComplete = () => {
    setEditingDisaster(null);
    onDisasterUpdated();
  };

  const handleCancelEdit = () => {
    setEditingDisaster(null);
  };

  const filteredDisasters = disasters.filter((disaster) => {
    const matchesTitle = disaster.title
      .toLowerCase()
      .includes(filter.toLowerCase());
    const matchesTag = !tagFilter || disaster.tags?.includes(tagFilter);
    return matchesTitle && matchesTag;
  });

  const allTags = [...new Set(disasters.flatMap((d) => d.tags || []))];

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Disasters ({filteredDisasters.length})
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search disasters..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-60"
          />
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredDisasters.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-700 px-4 py-3 rounded-lg">
          No disasters found. Create one to get started!
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredDisasters.map((disaster) => (
            <div
              key={disaster.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold text-gray-800">
                  <Link
                    to={`/disasters/${disaster.id}`}
                    className="text-blue-400 hover:underline"
                  >
                    {disaster.title}
                  </Link>
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(disaster)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(disaster.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-1">
                📍 {disaster.location_name || "No location"}
              </p>

              <p className="text-gray-700 mb-3">{disaster.description}</p>

              {disaster.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {disaster.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-xs text-gray-500 flex flex-col sm:flex-row justify-between gap-2">
                <span>Owner: {disaster.owner_id}</span>
                <span>
                  Created: {new Date(disaster.created_at).toLocaleDateString()}
                </span>
              </div>

              {disaster.audit_trail && disaster.audit_trail.length > 1 && (
                <details className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    Audit Trail ({disaster.audit_trail.length} entries)
                  </summary>
                  <div className="mt-2 space-y-2 text-sm">
                    {disaster.audit_trail.map((entry, index) => (
                      <div
                        key={index}
                        className="bg-white p-2 rounded border border-gray-100"
                      >
                        <p>
                          <strong>{entry.action}</strong> by {entry.user_id} at{" "}
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                        {entry.changes && (
                          <pre className="bg-gray-100 rounded p-2 mt-1 overflow-x-auto text-xs text-gray-700">
                            {JSON.stringify(entry.changes, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {editingDisaster && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <DisasterForm
              apiBase={apiBase}
              currentUser={currentUser}
              selectedDisaster={editingDisaster}
              onDisasterCreated={handleEditComplete}
              onClearSelection={handleCancelEdit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DisasterList;
