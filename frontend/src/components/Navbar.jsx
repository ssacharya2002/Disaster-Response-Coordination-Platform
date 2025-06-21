import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

function Navbar({ currentUser, setCurrentUser, connectionStatus, disasters }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { to: "/", label: "🚨 Disasters" },
    { to: "/social", label: "🌐 Social Media" },
    { to: "/resources", label: "📦 Resources" },
    { to: "/verification", label: "🕵️ Verification" },
    { to: "/geocode", label: "🧭 Geocode" },
  ];

  return (
    <header className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-2xl">
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-red-600/10 animate-pulse z-0"></div>

      {/* Main navbar content */}
      <div className="relative z-10 px-6 py-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Logo and title */}
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <span className="text-3xl animate-bounce">🚨</span>
              <div className="absolute -inset-1 bg-red-500/20 rounded-full blur animate-pulse"></div>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
              Disaster Response Coordination Platform
            </h1>
          </div>

          {/* User selector */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-1 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <label className="font-semibold text-blue-100 text-sm">Current User:</label>
            <div className="relative">
              <select
                value={currentUser}
                onChange={(e) => setCurrentUser(e.target.value)}
                className="appearance-none bg-gradient-to-r from-blue-50 to-white text-slate-800 font-medium px-4 py-2 pr-8 rounded-lg border-2 border-blue-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 focus:outline-none transition-all duration-300 hover:shadow-lg cursor-pointer"
              >
                <option value="netrunnerX">🔐 netrunnerX (Admin)</option>
                <option value="reliefAdmin">👑 reliefAdmin (Admin)</option>
                <option value="citizen1">👤 citizen1 (Contributor)</option>
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-blue-200 hover:text-blue-400 focus:outline-none flex gap-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span>Menu</span> <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className="relative bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-t border-slate-600/50 px-6 py-2 z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Connection status */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-sm transition-all duration-300 ${
              connectionStatus
                ? "bg-green-500/20 text-green-300 border border-green-500/30 shadow-lg shadow-green-500/10"
                : "bg-red-500/20 text-red-300 border border-red-500/30 shadow-lg shadow-red-500/10 animate-pulse"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus ? "bg-green-400" : "bg-red-400"
              } ${!connectionStatus && "animate-ping"}`}
            ></span>
            {connectionStatus ? "🟢 System Online" : "🔴 Connection Lost"}
          </div>

          {/* Navbar links (desktop) */}
          <div className="hidden md:flex gap-3">
            {tabs.map(({ to, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-2 py-1 font-semibold text-sm transition-all duration-300 ${
                    isActive
                      ? "text-blue-300 border-b-2 border-blue-400 scale-105"
                      : "text-blue-200 hover:text-blue-300"
                  }`}
                >
                  <span className="inline-flex items-center gap-1">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Disaster count */}
          <div className="flex items-center gap-2 bg-orange-500/20 text-orange-200 px-4 py-1 rounded-full border border-orange-500/30 shadow-lg shadow-orange-500/10">
            <span className="text-orange-300 animate-pulse">⚠️</span>
            <span className="font-bold text-sm">
              {disasters.length} Active {disasters.length === 1 ? "Disaster" : "Disasters"}
            </span>
            {disasters.length > 0 && <div className="w-2 h-2 bg-orange-400 rounded-full animate-ping"></div>}
          </div>
        </div>

        {/* Mobile nav menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 flex flex-col gap-2">
            {tabs.map(({ to, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-blue-900 text-blue-300 border-b-2 border-blue-400"
                      : "text-blue-200 hover:bg-blue-800 hover:text-blue-300"
                  }`}
                  onClick={() => setIsMenuOpen(false)} // Close menu on link click
                >
                  {label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
    </header>
  );
}

export default Navbar;
