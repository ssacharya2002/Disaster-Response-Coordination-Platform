 

import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import DisasterList from "./components/DisasterList";
import DisasterForm from "./components/DisasterForm";
import SocialMediaFeed from "./components/SocialMediaFeed";
import ResourceMap from "./components/ResourceMap";
import ImageVerification from "./components/ImageVerification";
import GeocodeTest from "./components/GeocodeTest";
import Navbar from "./components/Navbar";
import { Route, Routes } from "react-router-dom";
import Disaster from "./components/pages/Disaster";
import CreateDisaster from "./components/pages/CreateDisaster";
import DisasterDetail from "./components/DisasterDetail";
// import "./App.css"

const API_BASE =
  import.meta.env.VITE_REACT_APP_API_URL ;
const SOCKET_URL = import.meta.env.VITE_REACT_APP_SOCKET_URL ;

console.log("API_BASE:", API_BASE);
console.log("SOCKET_URL:", SOCKET_URL);



function App() {
  const [socket, setSocket] = useState(null);
  const [disasters, setDisasters] = useState([]);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  // const [activeTab, setActiveTab] = useState("disasters");
  const [currentUser, setCurrentUser] = useState("netrunnerX");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Listen for real-time updates
    newSocket.on("disaster_updated", (data) => {
      console.log("Real-time update:", data);
      addNotification(
        `Disaster ${data.action}: ${data.disaster?.title || data.disaster_id}`
      );

      if (data.action === "create" || data.action === "update") {
        setDisasters((prev) => {
          const existing = prev.find((d) => d.id === data.disaster.id);
          if (existing) {
            return prev.map((d) =>
              d.id === data.disaster.id ? data.disaster : d
            );
          } else {
            return [data.disaster, ...prev];
          }
        });
      } else if (data.action === "delete") {
        setDisasters((prev) => prev.filter((d) => d.id !== data.disaster_id));
      }
    });

    newSocket.on("social_media_updated", (data) => {
      addNotification(`New social media reports: ${data.count} posts`);
    });

    newSocket.on("resources_updated", (data) => {
      addNotification(`Resources updated: ${data.message}`);
    });

    return () => newSocket.close();
  }, []);

  const addNotification = (message) => {
    const notification = {
      id: Date.now(),
      message,
      timestamp: new Date().toLocaleTimeString(),
    };
    setNotifications((prev) => [notification, ...prev.slice(0, 4)]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, 5000);
  };

  const fetchDisasters = async () => {
    try {
      const response = await fetch(`${API_BASE}/disasters`, {
        headers: {
          "X-User-ID": currentUser,
        },
      });
      const result = await response.json();
      if (result.success) {
        setDisasters(result.data);
      }
    } catch (error) {
      console.error("Error fetching disasters:", error);
    }
  };

  useEffect(() => {
    fetchDisasters();
  }, [currentUser]);

  // const tabs = [
  //   { id: "disasters", label: "Disasters", icon: "🚨" },
  //   { id: "social", label: "Social Media", icon: "📱" },
  //   { id: "resources", label: "Resources", icon: "🏥" },
  //   { id: "verification", label: "Verification", icon: "✅" },
  //   { id: "geocode", label: "Geocoding", icon: "🗺️" },
  // ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <Navbar
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        connectionStatus={socket?.connected ? true : false}
        disasters={disasters}
      />

      {/* Real-time notifications */}
{notifications.length > 0 && (
  <div className="fixed top-4 right-4 z-50 space-y-3 w-80 max-w-full">
    {notifications.map((notification) => (
      <div
        key={notification.id}
        className="bg-white border-l-4 border-blue-500 shadow-md rounded-lg px-4 py-3 flex items-start gap-3 animate-slide-in-right"
      >
        {/* Icon (optional, can replace with emoji or icon component) */}
        <div className="mt-0.5 text-blue-500">
          📢
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-sm text-gray-800">{notification.message}</p>
          <p className="text-xs text-gray-500 mt-1 font-mono">{notification.timestamp}</p>
        </div>
      </div>
    ))}
  </div>
)}



      {/* react router setup */}

      <Routes>
        <Route
          path="/"
          element={
            <Disaster
              API_BASE={API_BASE}
              disasters={disasters}
              currentUser={currentUser}
              selectedDisaster={selectedDisaster}
              setSelectedDisaster={setSelectedDisaster}
              fetchDisasters={fetchDisasters}
            />
          }
        />
        <Route
          path="/disasters/create"
          element={
            <CreateDisaster
              currentUser={currentUser}
              fetchDisasters={fetchDisasters}
            />
          }
        />
        <Route
          path="/disasters/:id"
          element={<DisasterDetail disasters={disasters} />}
        />
        <Route
          path="/social"
          element={
            <SocialMediaFeed
              apiBase={API_BASE}
              disasters={disasters}
              selectedDisaster={selectedDisaster}
            />
          }
        />
        <Route
          path="/resources"
          element={
            <ResourceMap
              apiBase={API_BASE}
              disasters={disasters}
              selectedDisaster={selectedDisaster}
            />
          }
        />
        <Route
          path="/verification"
          element={
            <ImageVerification
              apiBase={API_BASE}
              disasters={disasters}
              selectedDisaster={selectedDisaster}
            />
          }
        />
        <Route path="/geocode" element={<GeocodeTest apiBase={API_BASE} />} />
        <Route
          path="*"
          element={
            <div className="text-center text-gray-500">Page not found</div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
