
import { useState, useEffect } from "react"

const DisasterForm = ({ apiBase, currentUser, onDisasterCreated, selectedDisaster, onClearSelection }) => {
  const [formData, setFormData] = useState({
    title: "",
    location_name: "",
    description: "",
    tags: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (selectedDisaster) {
      setFormData({
        title: selectedDisaster.title || "",
        location_name: selectedDisaster.location_name || "",
        description: selectedDisaster.description || "",
        tags: selectedDisaster.tags ? selectedDisaster.tags.join(", ") : "",
      })
      setIsEditing(true)
    } else {
      setFormData({
        title: "",
        location_name: "",
        description: "",
        tags: "",
      })
      setIsEditing(false)
    }
  }, [selectedDisaster])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }

      const url = isEditing ? `${apiBase}/disasters/${selectedDisaster.id}` : `${apiBase}/disasters`
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": currentUser,
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        onDisasterCreated()
        if (!isEditing) {
          setFormData({
            title: "",
            location_name: "",
            description: "",
            tags: "",
          })
        }
        if (isEditing) {
          onClearSelection()
        }
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error("Submit error:", error)
      alert("Failed to save disaster")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onClearSelection()
    setFormData({
      title: "",
      location_name: "",
      description: "",
      tags: "",
    })
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white shadow-xl rounded-xl p-8 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditing ? "Edit Disaster" : "Create New Disaster"}
        </h2>
        {isEditing && (
          <button
            onClick={handleCancel}
            className="text-red-500 hover:underline text-sm"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., NYC Flood Emergency"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="location_name" className="block font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            id="location_name"
            value={formData.location_name}
            onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
            placeholder="e.g., Manhattan, NYC"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the disaster situation..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block font-medium text-gray-700 mb-1">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="e.g., flood, urgent, evacuation"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Common tags: flood, earthquake, fire, hurricane, evacuation, urgent, medical, shelter
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-6 text-white font-semibold rounded-lg transition duration-300 ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Disaster" : "Create Disaster"}
        </button>
      </form>

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">ℹ️ How it works:</h3>
        <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
          <li>If you don't specify a location, it will be extracted from the description using AI</li>
          <li>Locations are automatically geocoded to coordinates for mapping</li>
          <li>Real-time updates are broadcast to all connected users</li>
          <li>All changes are tracked in an audit trail</li>
        </ul>
      </div>
    </div>
  )
}

export default DisasterForm
