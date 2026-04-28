// src/pages/Profile.js

import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import RequestCard from "../components/RequestCard";
import "./Profile.css";

export default function Profile() {
  const { user, logout } = useAuth();

  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showEdit, setShowEdit] = useState(false);
  const [roleInput, setRoleInput] = useState("volunteer");
  const [skillsInput, setSkillsInput] = useState("");

  // Load user data into inputs
  useEffect(() => {
    if (!user) return;

    setRoleInput(user.role || "volunteer");
    setSkillsInput((user.skills || []).join(", "));
  }, [user]);

  // Fetch requests
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "requests"),
      where("postedById", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMyRequests(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  if (!user) return null;

  const handleSave = async () => {
    try {
      const skillsArray = skillsInput
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      await updateDoc(doc(db, "users", user.uid), {
        role: roleInput,
        skills: skillsArray
      });

      alert("Profile updated");
    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    }
  };

  const openCount = myRequests.filter((r) => r.status === "open").length;
  const completedCount = myRequests.filter((r) => r.status === "completed").length;

  const trustColor =
    user.trustScore >= 150
      ? "var(--green)"
      : user.trustScore >= 100
        ? "var(--blue)"
        : "var(--muted)";

  return (
    <div className="profile-page">
      <div className="container">

        {/* HEADER */}
        <div className="profile-header card">

          <div className="profile-avatar-wrap">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder">
                {user.displayName?.[0]}
              </div>
            )}
          </div>

          <div className="profile-info">
            <h1 className="profile-name">{user.displayName}</h1>
            <p className="profile-email">{user.email}</p>

            {/* Role + Skills DISPLAY ONLY */}
            <p className="profile-meta">
              <span className="profile-role">
                {user.role || "volunteer"}
              </span>

              {user.skills?.length > 0 && (
                <>
                  {" • "}
                  <span className="profile-skills">
                    {user.skills.map((skill, i) => (
                      <span key={i} className="skill-chip">
                        {skill}
                      </span>
                    ))}
                  </span>
                </>
              )}
            </p>

            <div className="profile-trust" style={{ color: trustColor }}>
              🛡️ Trust Score: <strong>{user.trustScore || 100}</strong>
            </div>

            {/* ONLY BUTTON */}
            <button
              className="btn btn-outline profile-edit-btn"
              onClick={() => setShowEdit(true)}
              style={{ marginTop: "10px" }}
            >
              Edit Profile
            </button>
          </div>

          <button onClick={logout} className="btn btn-outline profile-logout">
            Sign out
          </button>
        </div>

        {/* STATS */}
        <div className="profile-stats">
          <div className="profile-stat-card card">
            <span className="ps-icon">🤲</span>
            <span className="ps-value">{myRequests.length}</span>
            <span className="ps-label">Requests Posted</span>
          </div>

          <div className="profile-stat-card card">
            <span className="ps-icon">✅</span>
            <span className="ps-value">{user.helpsCompleted || 0}</span>
            <span className="ps-label">Helps Completed</span>
          </div>

          <div className="profile-stat-card card">
            <span className="ps-icon">📋</span>
            <span className="ps-value">{openCount}</span>
            <span className="ps-label">Open Requests</span>
          </div>

          <div className="profile-stat-card card">
            <span className="ps-icon">🌟</span>
            <span className="ps-value">{completedCount}</span>
            <span className="ps-label">Requests Resolved</span>
          </div>
        </div>

        {/* REQUESTS */}
        <section className="my-requests-section">
          <h2 className="section-title">My Requests</h2>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : myRequests.length === 0 ? (
            <div className="empty-state">
              <span className="icon">📋</span>
              <h3>No requests yet</h3>
              <p>You haven't posted any help requests.</p>
            </div>
          ) : (
            <div className="requests-grid">
              {myRequests.map((req) => (
                <RequestCard key={req.id} request={req} />
              ))}
            </div>
          )}
        </section>

      </div>

      {/* MODAL */}
      {showEdit && (
        <div className="modal-overlay">
          <div className="modal">

            <h3>Edit Profile</h3>

            <div className="modal-group">
              <label>Role</label>
              <select
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
              >
                <option value="doctor">Doctor</option>
                <option value="teacher">Teacher</option>
                <option value="ngo">NGO</option>
                <option value="volunteer">Volunteer</option>
                <option value="donor">Donor</option>
                <option value="organization">Organization</option>
              </select>
            </div>

            <div className="modal-group">
              <label>Skills</label>
              <input
                placeholder="medical, teaching"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowEdit(false)}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                onClick={() => {
                  handleSave();
                  setShowEdit(false);
                }}
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}