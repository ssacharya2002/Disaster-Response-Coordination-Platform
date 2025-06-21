import DisasterList from "../DisasterList";
import { Link } from "react-router-dom";

function Disaster({
  API_BASE,
  currentUser,
  disasters,
  fetchDisasters,
}) {
  return (
    <div className="disasters-section p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Disasters</h1>
        <Link
          to="/disasters/create"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
        >
          Create Disaster
        </Link>
      </div>
      <div className="disaster-list-panel bg-white rounded-lg shadow p-6">
        <DisasterList
          disasters={disasters}
          apiBase={API_BASE}
          currentUser={currentUser}
          onDisasterUpdated={fetchDisasters}
        />
      </div>
    </div>
  );
}

export default Disaster;
