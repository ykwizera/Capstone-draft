import { useState } from "react"
import { X, AlertTriangle } from "lucide-react"
import api from "../api/axios"

const REASONS = [
  { value: "not-using",   label: "I no longer use this service" },
  { value: "privacy",     label: "Privacy or data concerns" },
  { value: "too-complex", label: "The app is too complicated" },
  { value: "switching",   label: "Switching to another service" },
  { value: "other",       label: "Other reason" },
]

export default function DeleteAccountModal({ onClose }) {
  const [reason, setReason]   = useState("")
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  const handleDelete = async () => {
    if (!reason) return
    setLoading(true)
    setError("")
    try {
      await api.delete("/auth/me/", { data: { reason, comment } })
      localStorage.clear()
      window.location.href = "/login"
    } catch (err) {
      const msg = err.response?.data
      setError(
        typeof msg === "object"
          ? Object.values(msg).flat()[0]
          : "Failed to delete account. Please contact support."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <span className="modal-title" style={{ color: "var(--danger)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <AlertTriangle size={17} /> Delete Account
          </span>
          <button className="modal-close" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <p style={{ fontSize: "0.82rem", color: "var(--text2)", marginBottom: "1rem", lineHeight: 1.6 }}>
          Before we proceed, please tell us why you're leaving.
          This action is <strong>permanent</strong> and cannot be undone.
        </p>

        {/* Reason list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.85rem" }}>
          {REASONS.map(r => (
            <div
              key={r.value}
              onClick={() => setReason(r.value)}
              style={{
                display: "flex", alignItems: "center", gap: "0.6rem",
                padding: "0.55rem 0.75rem",
                border: `1px solid ${reason === r.value ? "var(--danger)" : "var(--border)"}`,
                borderRadius: "8px", cursor: "pointer",
                background: reason === r.value ? "var(--danger-light)" : "transparent",
                transition: "all 0.15s",
              }}
            >
              <input
                type="radio"
                readOnly
                checked={reason === r.value}
                style={{ accentColor: "var(--danger)", cursor: "pointer" }}
              />
              <label style={{ fontSize: "0.82rem", color: "var(--text)", cursor: "pointer" }}>
                {r.label}
              </label>
            </div>
          ))}
        </div>

        {/* Comment */}
        <div className="fg" style={{ marginBottom: "1rem" }}>
          <label>Additional comments (optional)</label>
          <textarea
            placeholder="Tell us more..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{ color: "var(--danger)", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.65rem" }}>
          <button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            style={{ flex: 1 }}
            disabled={!reason || loading}
            onClick={handleDelete}
          >
            {loading ? "Deleting..." : "Confirm Delete"}
          </button>
        </div>

      </div>
    </div>
  )
}