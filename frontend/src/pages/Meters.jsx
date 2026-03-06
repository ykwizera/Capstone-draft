import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { LayoutGrid, List, Plus, RefreshCw, WifiOff } from "lucide-react"
import api from "../api/axios"
import MeterCard from "../components/MeterCard"
import AddMeterModal from "../components/AddMeterModal"
import "./Meters.css"

export default function Meters() {
  const navigate = useNavigate()
  const [meters, setMeters]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError]         = useState(null)
  const [view, setView]           = useState("cards")
  const [showModal, setShowModal] = useState(false)

  const fetchMeters = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const res = await api.get("/meters/")
      setMeters(res.data.results ?? res.data)
    } catch (err) {
      if (err.response?.status === 401) navigate("/login")
      else setError("Failed to load meters. Check your connection and try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchMeters() }, []) // eslint-disable-line

  const handleDisable = async (id) => {
    try {
      await api.patch(`/meters/${id}/`, { status: "disabled" })
      setMeters(prev => prev.map(m => m.id === id ? { ...m, status: "disabled" } : m))
    } catch {
      alert("Failed to disable meter.")
    }
  }

  const handleEnable = async (id) => {
    try {
      await api.patch(`/meters/${id}/`, { status: "active" })
      setMeters(prev => prev.map(m => m.id === id ? { ...m, status: "active" } : m))
    } catch {
      alert("Failed to enable meter.")
    }
  }

  return (
    <div className="page page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">Meters</div>
          <div className="page-sub">
            {loading ? "Loading..." : `${meters.length} meter${meters.length !== 1 ? "s" : ""} registered`}
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.65rem" }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => fetchMeters(true)}
            disabled={refreshing}
          >
            <RefreshCw size={14} className={refreshing ? "spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Add Meter
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="meters-error">
          <WifiOff size={15} />
          {error}
          <button className="btn btn-secondary btn-xs" onClick={() => fetchMeters()}>Retry</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="meters-toolbar">
        <div className="view-toggle">
          <button
            className={view === "cards" ? "active" : ""}
            onClick={() => setView("cards")}
          >
            <LayoutGrid size={14} /> Cards
          </button>
          <button
            className={view === "list" ? "active" : ""}
            onClick={() => setView("list")}
          >
            <List size={14} /> List
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="meters-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="meter-card-skeleton">
              <div className="skeleton" style={{ width: "38px", height: "38px", borderRadius: "10px" }} />
              <div className="skeleton" style={{ width: "60%", height: "0.9rem", marginTop: "0.75rem" }} />
              <div className="skeleton" style={{ width: "40%", height: "0.7rem", marginTop: "0.3rem" }} />
              <div className="skeleton" style={{ width: "50%", height: "0.7rem", marginTop: "0.3rem" }} />
              <div className="skeleton" style={{ width: "100%", height: "2rem", marginTop: "0.75rem", borderRadius: "8px" }} />
            </div>
          ))}
        </div>
      ) : meters.length === 0 ? (
        <div className="meters-empty">
          <div className="meters-empty-icon">⚡</div>
          <div className="meters-empty-title">No meters yet</div>
          <div className="meters-empty-sub">Add your first electricity meter to get started</div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Add Meter
          </button>
        </div>
      ) : view === "cards" ? (
        <div className="meters-grid">
          {meters.map(m => (
            <MeterCard
              key={m.id}
              meter={m}
              onDisable={handleDisable}
              onEnable={handleEnable}
            />
          ))}
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Meter No.</th>
                <th>Location</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {meters.map(m => (
                <tr key={m.id} style={{ opacity: m.status === "disabled" ? 0.55 : 1 }}>
                  <td>
                    <strong>{m.name}</strong>
                    {m.is_low_balance && m.status !== "disabled" && (
                      <span className="badge badge-low" style={{ marginLeft: "0.5rem" }}>Low</span>
                    )}
                  </td>
                  <td className="mono" style={{ fontSize: "0.75rem" }}>{m.meter_number}</td>
                  <td style={{ color: "var(--text2)" }}>{m.location || "—"}</td>
                  <td
                    className="mono"
                    style={{ color: m.is_low_balance ? "var(--danger)" : "var(--text)" }}
                  >
                    {m.current_balance_units} units
                  </td>
                  <td>
                    <span className={`badge ${m.status === "active" ? "badge-active" : "badge-disabled"}`}>
                      {m.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      {m.status !== "disabled" && (
                        <button
                          className="btn btn-primary btn-xs"
                          onClick={() => navigate(`/meters/${m.id}`)}
                        >
                          View
                        </button>
                      )}
                      {m.status === "disabled" ? (
                        <button
                          className="btn btn-secondary btn-xs"
                          onClick={() => handleEnable(m.id)}
                        >
                          Enable
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary btn-xs"
                          onClick={() => handleDisable(m.id)}
                        >
                          Disable
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add meter modal */}
      {showModal && (
        <AddMeterModal
          onClose={() => setShowModal(false)}
          onAdded={newMeter => setMeters(prev => [...prev, newMeter])}
        />
      )}
    </div>
  )
}