import React from "react";
import { formatDistanceToNow } from "date-fns";
import "./RequestCard.css";

// ✅ YOU FORGOT THIS (this caused your error)
const CATEGORY_META = {
  Food: { icon: "🍛", color: "#d97706" },
  Medical: { icon: "🏥", color: "#dc2626" },
  Emergency: { icon: "🚨", color: "#c0392b" },
  Education: { icon: "📚", color: "#1d4e89" },
  Other: { icon: "🤲", color: "#6b7280" },
};

export default function RequestCard({ request, onClick }) {
  const meta = CATEGORY_META[request.category] || CATEGORY_META["Other"];

  const timeAgo = request.createdAt?.toDate
    ? formatDistanceToNow(request.createdAt.toDate(), { addSuffix: true })
    : "just now";

  return (
    <div
      className={`request-card card ${request.isUrgent ? "urgent-card" : ""}`}
      onClick={() => onClick(request)}
      style={{ cursor: "pointer" }}
    >
      {request.isUrgent && (
        <div className="urgent-banner">🚨 Urgent</div>
      )}

      {/* HEADER */}
      <div className="card-header">
        <div
          className="category-badge"
          style={{
            background: meta.color + "15",
            color: meta.color,
          }}
        >
          {meta.icon} {request.category}
        </div>

        <span className={`status-badge status-${request.status}`}>
          {request.status}
        </span>
      </div>

      {/* BODY */}
      <div className="card-body">
        <h3 className="request-name">{request.name}</h3>

        <p className="request-description">
          {request.description}
        </p>

        <div className="card-meta">
          <span>📍 {request.location}</span>
          <span>🕐 {timeAgo}</span>
        </div>
      </div>

      {/* FOOTER */}
      <div className="card-footer">
        <div className="trust-indicator">
          <span className="trust-dot"></span>
          Trust {request.postedByTrust || 100}
        </div>

        <div className="card-actions">
          {/* OPEN → show Help button */}
          {request.status === "open" && (
            <button
              className="btn btn-primary btn-help"
              onClick={(e) => {
                e.stopPropagation(); // IMPORTANT (prevents popup)
                alert("Hook accept logic here");
              }}
            >
              🤝 I'll Help
            </button>
          )}

          {/* ACCEPTED → show helper */}
          {request.status === "accepted" && (
            <span className="helper-name">
              🤝 {request.acceptedBy || "Someone"} is helping
            </span>
          )}

          {/* COMPLETED */}
          {request.status === "completed" && (
            <span className="completed-text">
              ✨ Help delivered
            </span>
          )}
        </div>
      </div>
    </div>
  );
}