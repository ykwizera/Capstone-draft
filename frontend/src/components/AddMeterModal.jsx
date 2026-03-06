import { useState } from "react"
import { X } from "lucide-react"
import api from "../api/axios"

export default function AddMeterModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    meter_number: "",
    name: "",
    location: "",
    low_balance_threshold: "",
  })
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.meter_number || !form.name) {
      return setError("Meter number and name are required.")
    }
    setLoading(true)
    setError("")
    try {
      const { data } = await api.post("/meters/", form)
      onAdded(data)
      onClose()
    } catch (err) {
      const msg = err.response?.data
      if (typeof msg === "object") {
        setError(Object.values(msg).flat()[0])
      } else {
        setError("Failed to add meter. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Add New Meter</span>
          <button className="modal-close" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <div className="fg">
            <label>Meter Number *</label>
            <input
              placeholder="e.g. MTR-005"
              value={form.meter_number}
              onChange={e => setForm({ ...form, meter_number: e.target.value })}
            />
          </div>
          <div className="fg">
            <label>Name *</label>
            <input
              placeholder="e.g. Home, Shop, Office"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="fg">
            <label>Location</label>
            <input
              placeholder="e.g. Kigali, Gasabo"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div className="fg">
            <label>Low Balance Threshold (units)</label>
            <input
              type="number"
              placeholder="e.g. 5"
              value={form.low_balance_threshold}
              onChange={e => setForm({ ...form, low_balance_threshold: e.target.value })}
            />
          </div>

          {error && (
            <div style={{ color: "var(--danger)", fontSize: "0.8rem" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.65rem", marginTop: "0.25rem" }}>
            <button
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Meter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}