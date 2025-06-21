import DisasterForm from "../DisasterForm";
import { useNavigate } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_REACT_APP_API_URL;

function CreateDisaster({ currentUser, fetchDisasters }) {
  const navigate = useNavigate();

  const handleDisasterCreated = () => {
    fetchDisasters();
    navigate("/");
  };

  return (
    <div className="create-disaster-page">
      <div className="disaster-form-panel bg-white rounded-lg shadow p-6">
        <DisasterForm
          apiBase={API_BASE}
          currentUser={currentUser}
          onDisasterCreated={handleDisasterCreated}
        />
      </div>
    </div>
  );
}

export default CreateDisaster; 