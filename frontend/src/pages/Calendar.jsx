import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/Calendar.css";
import BugModal from "../components/BugModal";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getBugs, createBug } from "../services/bugService";

export default function CalendarPage() {
  const [bugs, setBugs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBugs, setSelectedBugs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBugs();
  }, []);

  const fetchBugs = async () => {
    try {
      const data = await getBugs();
      console.log("✅ Bugs fetched for Calendar:", data);
      setBugs(data);
    } catch (err) {
      console.error("Error fetching bugs", err);
      setBugs([]);
    }
  };

  const handleAddBug = async (bugData) => {
    try {
      const saved = await createBug(bugData);
      setBugs((prev) => [...prev, saved]);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save bug.");
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedBugs((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  };

  const handleShare = () => {
    const selected = bugs.filter((b) => selectedBugs.includes(b._id));
    if (selected.length === 0) {
      alert("Please select bugs to share.");
      return;
    }

    const text = selected
      .map(
        (b) =>
          `• ${b.name || b.title} [${b.priority}] due ${
            b.dueDate || "N/A"
          }\nStatus: ${b.status}\nOwner: ${
            b.owner || "N/A"
          }\nCompleted: ${b.completed || 0}%`
      )
      .join("\n\n");

    navigator.clipboard
      .writeText(text)
      .then(() => alert("Bugs copied to clipboard!"))
      .catch(() => alert("Failed to copy."));
  };

  const handleExportPDF = () => {
    if (selectedBugs.length === 0) {
      alert("Select bugs to export.");
      return;
    }
    const input = document.getElementById("selected-bugs-section");
    if (!input) {
      alert("Nothing to export.");
      return;
    }
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save(`bugs-${selectedDate.toDateString()}.pdf`);
    });
  };

  // Filter bugs for the selected date
  const filteredBugs = bugs.filter(
    (b) =>
      b?.dueDate &&
      new Date(b.dueDate).toDateString() === selectedDate.toDateString()
  );

  // Apply search filter
  const displayedBugs = bugs.filter((b) => {
    const query = searchQuery.toLowerCase();
    return (
      b?.name?.toLowerCase().includes(query) ||
      b?.title?.toLowerCase().includes(query) ||
      b?.status?.toLowerCase().includes(query)
    );
  });

  const tileContent = ({ date }) => {
    const hasBug = bugs.some(
      (b) =>
        b?.dueDate &&
        new Date(b.dueDate).toDateString() === date.toDateString()
    );
    if (hasBug) {
      return (
        <span className="bug-dot" title="Bug(s) due">
          •
        </span>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content-wrapper">
        <div className="main-content">
          {/* Top Header */}
          <div className="top-section">
            <div className="top-card calendar-header-bar">
              <div className="calendar-actions">
                <input
                  type="text"
                  placeholder="Search bugs..."
                  className="calendar-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  className="create-event-btn"
                  onClick={() => setShowModal(true)}
                >
                  + Add Bug
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Card */}
          <div className="card calendar-card">
            <div className="calendar-header">
              <h3>Calendar</h3>
              <hr />
            </div>

            <div className="calendar-body">
              {/* Left column */}
              <div className="event-column">
                <h4>Upcoming Bugs</h4>
                {displayedBugs.length > 0 ? (
                  displayedBugs.map((bug) => (
                    <div
                      key={bug._id}
                      className={`event-card severity-${bug.priority?.toLowerCase()}`}
                      onClick={() =>
                        setSelectedDate(
                          bug.dueDate ? new Date(bug.dueDate) : new Date()
                        )
                      }
                    >
                      <input
                        type="checkbox"
                        className="event-checkbox"
                        checked={selectedBugs.includes(bug._id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleCheckboxChange(bug._id);
                        }}
                      />
                      <h5>{bug.name || bug.title}</h5>
                      <p>
                        Due: {bug.dueDate || "N/A"} | {bug.completed || 0}% done
                      </p>
                      <p>Status: {bug.status || "N/A"}</p>
                      <small>Owner: {bug.owner || "N/A"}</small>
                      <span className="severity-tag">
                        {bug.priority || "N/A"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p>No bugs found.</p>
                )}
              </div>

              {/* Calendar column */}
              <div className="calendar-column">
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  className="custom-calendar"
                  tileContent={tileContent}
                />
                <div className="calendar-buttons">
                  <button className="share-btn" onClick={handleShare}>
                    🔗 Share Bugs
                  </button>
                  <button className="share-btn" onClick={handleExportPDF}>
                    📄 Download PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Selected Day Details */}
            {filteredBugs.length > 0 && (
              <div
                className="selected-event-details"
                id="selected-bugs-section"
              >
                <h4>Bugs due on {selectedDate.toDateString()}</h4>
                {filteredBugs.map((bug) => (
                  <div key={bug._id}>
                    <p>
                      <strong>{bug.name || bug.title}</strong> —{" "}
                      {bug.priority} Priority
                    </p>
                    <p>Status: {bug.status}</p>
                    <p>Owner: {bug.owner}</p>
                    <p>Completed: {bug.completed}%</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bug Modal */}
          <BugModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleAddBug}
          />
        </div>
      </div>
    </div>
  );
}
