import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Image as ImageIcon,
  Send,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

function UserReports({ disasterId, currentUser: currentUserId }) {
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState(null);
  const [newReport, setNewReport] = useState({ content: "", image_url: "" });

  // Mock users object, similar to backend
  const users = {
    netrunnerX: { id: "netrunnerX", role: "admin" },
    reliefAdmin: { id: "reliefAdmin", role: "admin" },
    citizen1: { id: "citizen1", role: "contributor" },
  };

  const currentUser = users[currentUserId] || users["citizen1"];
  const isAdmin = currentUser.role === "admin";

  const apiBase = import.meta.env.VITE_REACT_APP_API_URL;

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const fetchReports = async () => {
    if (!disasterId) return;
    try {
      setReportsLoading(true);
      setReportsError(null);
      const response = await fetch(
        `${apiBase}/reports/disasters/${disasterId}/reports`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }
      const data = await response.json();
      if (data.success) {
        setReports(data.data || []);
      } else {
        setReportsError(data.error || "Failed to fetch reports");
      }
    } catch (err) {
      console.error("Fetch reports error:", err);
      setReportsError(err.message);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!newReport.content) {
      alert("Report content cannot be empty.");
      return;
    }

    const reportData = { ...newReport, user_id: 1 };

    try {
      const response = await fetch(
        `${apiBase}/reports/disasters/${disasterId}/reports`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reportData),
        }
      );
      const result = await response.json();
      if (result.success) {
        setReports([result.data, ...reports]);
        setNewReport({ content: "", image_url: "" });
      } else {
        alert(`Error submitting report: ${result.error}`);
      }
    } catch (err) {
      console.error("Submit report error:", err);
      alert("Failed to submit report. Please try again.");
    }
  };

  const handleVerifyReport = async (reportId, currentStatus) => {
    const newStatus = currentStatus === "verified" ? "pending" : "verified";
    try {
      const response = await fetch(`${apiBase}/reports/${reportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": currentUserId,
        },
        body: JSON.stringify({ verification_status: newStatus }),
      });

      const result = await response.json();
      if (result.success) {
        setReports((prevReports) =>
          prevReports.map((report) =>
            report.id === reportId
              ? { ...report, verification_status: newStatus }
              : report
          )
        );
      } else {
        alert(`Error verifying report: ${result.error}`);
      }
    } catch (err) {
      console.error("Verify report error:", err);
      alert("Failed to update report status.");
    }
  };

  useEffect(() => {
    if (disasterId) {
      fetchReports();
    }
  }, [disasterId]);

  return (
    <div>
      {/* User Reports Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mt-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <MessageSquare className="h-7 w-7 mr-3 text-teal-500" />
          User Reports
        </h2>

        {/* Submit Report Form */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold mb-4">Share an Update</h3>
          <form onSubmit={handleReportSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <MessageSquare className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                <textarea
                  value={newReport.content}
                  onChange={(e) =>
                    setNewReport({ ...newReport, content: e.target.value })
                  }
                  placeholder="What's the latest on the ground?"
                  className="w-full border-gray-300 rounded-md shadow-sm pl-10 pr-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  rows="4"
                  required
                ></textarea>
              </div>
              <div className="relative">
                <ImageIcon className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={newReport.image_url}
                  onChange={(e) =>
                    setNewReport({ ...newReport, image_url: e.target.value })
                  }
                  placeholder="Optional: Link to an image (e.g., from Imgur)"
                  className="w-full border-gray-300 rounded-md shadow-sm pl-10 pr-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
            <div className="text-right mt-4">
              <button
                type="submit"
                className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition"
              >
                <Send className="h-5 w-5 mr-2" />
                Submit Report
              </button>
            </div>
          </form>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          {reportsLoading && (
            <div className="text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-3"></div>
              Loading reports...
            </div>
          )}
          {reportsError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
              <p className="font-bold">Error</p>
              <p>{reportsError}</p>
            </div>
          )}
          {!reportsLoading && !reportsError && reports.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <h3 className="text-lg font-medium">No reports yet</h3>
              <p className="text-sm">
                Be the first to share an update for this event.
              </p>
            </div>
          )}
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://i.pravatar.cc/150?u=${report.user_id}`}
                    alt="User avatar"
                    className="w-10 h-10 rounded-full bg-gray-200"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {`User ${report.user_id}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(report.created_at)}
                    </p>
                  </div>
                </div>
                {isAdmin ? (
                  <button
                    onClick={() =>
                      handleVerifyReport(report.id, report.verification_status)
                    }
                    title="Toggle Verification Status"
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition ${
                      report.verification_status === "verified"
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    }`}
                  >
                    {report.verification_status === "verified" ? (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Verified
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-4 w-4" />
                        Pending
                      </>
                    )}
                  </button>
                ) : (
                  <span
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      report.verification_status === "verified"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {report.verification_status === "verified" ? (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Verified
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-4 w-4" />
                        Pending
                      </>
                    )}
                  </span>
                )}
              </div>

              <p className="text-gray-700 my-4">{report.content}</p>

              {report.image_url && (
                <a
                  href={report.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={report.image_url}
                    alt="User report"
                    className="mt-3 rounded-lg max-h-96 w-full object-cover border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserReports;
