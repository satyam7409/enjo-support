import { Routes, Route, Link, useLocation } from "react-router-dom";
import AgentQueue from "./pages/AgentQueue";
import SubmitTicket from "./pages/Sumbitticket";

function App() {
  const location = useLocation();
  return (
    <div>
      <nav className="nav">
        <span className="nav-brand">Ticket Triage</span>
        <div className="nav-links">
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>
            Submit a ticket
          </Link>
          <Link
            to="/agent"
            className={location.pathname === "/agent" ? "active" : ""}
          >
            Agent queue
          </Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<SubmitTicket />} />
        <Route path="/agent" element={<AgentQueue />} />
      </Routes>
    </div>
  );
}

export default App;
