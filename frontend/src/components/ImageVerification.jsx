 

import React, { useState, useEffect } from "react";

const ImageVerification = ({ apiBase, disasters, selectedDisaster }) => {
  const [selectedDisasterId, setSelectedDisasterId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [reportId, setReportId] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDisaster) {
      setSelectedDisasterId(selectedDisaster.id);
    }
  }, [selectedDisaster]);

  const verifyImage = async (e) => {
    e.preventDefault();
    if (!selectedDisasterId || !imageUrl) return;

    setLoading(true);
    try {
      const payload = {
        image_url: imageUrl,
        report_id: reportId || undefined,
      };

      const response = await fetch(
        `${apiBase}/verification/disasters/${selectedDisasterId}/verify-image`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      if (result.success) {
        setVerificationResult(result.data);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Verification error:", error);
      alert("Failed to verify image");
    } finally {
      setLoading(false);
    }
  };

  const getVerificationColor = (status) => {
    return (
      {
        verified: "text-green-600 bg-green-100",
        suspicious: "text-yellow-600 bg-yellow-100",
        fake: "text-red-600 bg-red-100",
      }[status] || "text-gray-600 bg-gray-100"
    );
  };

  const getVerificationIcon = (status) => {
    return (
      {
        verified: "✅",
        suspicious: "⚠️",
        fake: "❌",
      }[status] || "❓"
    );
  };

  const sampleImages = [
    {
      url: "https://www.assamtimes.org/sites/default/files/styles/718x440/public/field/image/14-08-17%20Kaziranga-%20NH%2037%20under%20flood%20%281%29.jpg",
      description: "Flood scene",
    },
    {
      url: "https://nawakara.com/wp-content/uploads/2022/12/profile-3121080017-01FJ1YT29TD80SE4C0B3JMKQP8.jpg",
      description: "Emergency response",
    },
    {
      url: "https://cdnuploads.aa.com.tr/uploads/Contents/2019/01/30/thumbs_b_c_0bd65f654aa9088aa3e7f41997cffea8.jpg",
      description: "Natural disaster",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">✅ Image Verification</h2>
          <p className="text-sm text-gray-600">
            Use AI to analyze disaster images for authenticity and context
          </p>
        </div>

        <form onSubmit={verifyImage} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              Select Disaster
            </label>
            <select
              value={selectedDisasterId}
              onChange={(e) => setSelectedDisasterId(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Choose a disaster...</option>
              {disasters.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} - {d.location_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Image URL *
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Report ID (optional)
            </label>
            <input
              type="text"
              value={reportId}
              onChange={(e) => setReportId(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedDisasterId || !imageUrl || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Verify Image"}
          </button>
        </form>

        <div>
          <h4 className="text-lg font-semibold mt-6">Sample Images</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
            {sampleImages.map((sample, i) => (
              <div key={i} className="border p-2 rounded text-center space-y-2">
                <img
                  src={sample.url}
                  alt={sample.description}
                  onClick={() => setImageUrl(sample.url)}
                  className="cursor-pointer rounded object-cover h-32 w-full"
                />
                <p className="text-sm">{sample.description}</p>
                <button
                  type="button"
                  onClick={() => setImageUrl(sample.url)}
                  className="text-blue-600 underline text-sm"
                >
                  Use This Image
                </button>
              </div>
            ))}
          </div>
        </div>

        {verificationResult && (
          <div className="border rounded p-4 space-y-4 bg-white shadow">
            <div className="flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded-full font-semibold ${getVerificationColor(
                  verificationResult.verification_status
                )}`}
              >
                {getVerificationIcon(verificationResult.verification_status)}{" "}
                {verificationResult.verification_status?.toUpperCase()}
              </span>
              {verificationResult.confidence_score && (
                <span className="text-sm text-gray-500">
                  Confidence: {verificationResult.confidence_score}%
                </span>
              )}
            </div>

            {verificationResult.analysis && (
              <div>
                <h4 className="font-semibold">AI Analysis</h4>
                <p>{verificationResult.analysis}</p>
              </div>
            )}

            {verificationResult.detected_elements?.length > 0 && (
              <div>
                <h4 className="font-semibold">Detected Elements</h4>
                <div className="flex flex-wrap gap-2">
                  {verificationResult.detected_elements.map((e, i) => (
                    <span
                      key={i}
                      className="text-xs bg-gray-100 px-2 py-1 rounded"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {verificationResult.flags?.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-600">⚠️ Flags</h4>
                <ul className="list-disc ml-5 text-sm">
                  {verificationResult.flags.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-xs text-gray-500">
              Verified at:{" "}
              {new Date(
                verificationResult.verified_at || Date.now()
              ).toLocaleString()}
              {reportId && <div>Report ID: {reportId}</div>}
            </div>

            {imageUrl && (
              <div>
                <h4 className="font-semibold">Analyzed Image</h4>
                <img
                  src={imageUrl}
                  alt="Analyzed"
                  className="rounded shadow mt-2 max-h-64 w-auto"
                />
              </div>
            )}
          </div>
        )}

        <div className="bg-gray-50 border rounded p-4 mt-6">
          <h4 className="font-semibold mb-2">
            🤖 How Image Verification Works:
          </h4>
          <ul className="list-disc ml-6 text-sm space-y-1">
            <li>
              <strong>Authenticity Check:</strong> Detects manipulation or
              editing
            </li>
            <li>
              <strong>Context Analysis:</strong> Matches image with disaster
              type & location
            </li>
            <li>
              <strong>Element Detection:</strong> Detects people, objects,
              damage, etc.
            </li>
            <li>
              <strong>Confidence Scoring:</strong> Gives reliability score
            </li>
            <li>
              <strong>Flag System:</strong> Flags suspicious inconsistencies
            </li>
          </ul>

          <div className="mt-4">
            <h5 className="font-semibold">Verification Statuses:</h5>
            <ul className="text-sm mt-1 space-y-1">
              <li>
                <span className="text-green-600">✅ Verified</span> – Image
                appears authentic and relevant
              </li>
              <li>
                <span className="text-yellow-600">⚠️ Suspicious</span> – Needs
                manual review
              </li>
              <li>
                <span className="text-red-600">❌ Fake</span> – Likely
                misleading or edited
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageVerification;
