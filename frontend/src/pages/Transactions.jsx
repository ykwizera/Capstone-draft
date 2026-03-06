import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { RefreshCw, WifiOff, Download } from "lucide-react"
import api from "../api/axios"
import "./Transactions.css"

export default function Transactions() {
  const navigate = useNavigate()

  const [transactions, setTransactions] = useState([])
  const [meters, setMeters]             = useState([])
  const [loading, setLoading]           = useState(true)
  const [refreshing, setRefreshing]     = useState(false)
  const [error, setError]               = useState(null)

  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate]     = useState("")
  const [meter, setMeter]       = useState("")
  const [status, setStatus]     = useState("")

  const fetchData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const [tRes, mRes] = await Promise.all([
        api.get("/transactions/"),
        api.get("/meters/"),
      ])
      setTransactions(tRes.data.results ?? tRes.data)
      setMeters(mRes.data.results ?? mRes.data)
    } catch (err) {
      if (err.response?.status === 401) navigate("/login")
      else setError("Failed to load transactions. Check your connection and try again.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [navigate])

  useEffect(() => { fetchData() }, [fetchData])

  // Filter logic
  const filtered = transactions.filter(t => {
    const date = t.created_at?.substring(0, 10)
    if (fromDate && date < fromDate) return false
    if (toDate   && date > toDate)   return false
    if (meter    && t.meter !== parseInt(meter) && t.meter_number !== meter) return false
    if (status   && t.status !== status) return false
    return true
  })

  const clearFilters = () => {
    setFromDate("")
    setToDate("")
    setMeter("")
    setStatus("")
  }

  // CSV download
  const downloadCSV = () => {
    const headers = ["Meter","Token","Units","Amount (RWF)","Method","Status","Date"]
    const rows = filtered.map(t => [
      t.meter_number ?? t.meter,
      t.token ?? "—",
      t.units_purchased ?? "—",
      t.amount_rwf ?? "—",
      t.payment_method ?? "—",
      t.status,
      t.created_at?.substring(0, 10) ?? "—",
    ])
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
    const filename = fromDate && toDate
      ? `ingufupay-transactions-${fromDate}-to-${toDate}.csv`
      : "ingufupay-transactions.csv"
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    a.download = filename
    a.click()
  }

  // PDF download
  const downloadPDF = () => {
    const rows = filtered.map(t => `
      <tr>
        <td>${t.meter_number ?? t.meter}</td>
        <td style="font-family:monospace;font-size:0.78rem">${t.token ?? "—"}</td>
        <td>${t.units_purchased ?? "—"}</td>
        <td>${t.amount_rwf ?? "—"}</td>
        <td style="text-transform:capitalize">${t.payment_method ?? "—"}</td>
        <td class="${t.status === "success" ? "ok" : "fail"}">${t.status}</td>
        <td>${t.created_at?.substring(0, 10) ?? "—"}</td>
      </tr>
    `).join("")

    const html = `
      <html>
      <head>
        <title>IngufuPay Transactions</title>
        <style>
          body { font-family: sans-serif; padding: 2rem; color: #111; }
          h2   { color: #2563eb; margin-bottom: 0.25rem; }
          p    { font-size: 0.85rem; color: #64748b; margin-bottom: 1.5rem; }
          table{ width: 100%; border-collapse: collapse; font-size: 0.85rem; }
          th   { background: #f4f6fb; padding: 0.6rem 0.8rem; text-align: left;
                 font-size: 0.72rem; text-transform: uppercase;
                 letter-spacing: 0.05em; color: #64748b; }
          td   { padding: 0.6rem 0.8rem; border-bottom: 1px solid #e5e9f2; }
          .ok  { color: #16a34a; font-weight: 600; }
          .fail{ color: #dc2626; font-weight: 600; }
        </style>
      </head>
      <body>
        <h2>IngufuPay — Transaction Report</h2>
        <p>Generated: ${new Date().toLocaleString()} · ${filtered.length} transaction${filtered.length !== 1 ? "s" : ""}</p>
        <table>
          <thead>
            <tr>
              <th>Meter</th><th>Token</th><th>Units</th>
              <th>Amount (RWF)</th><th>Method</th><th>Status</th><th>Date</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
      </html>
    `
    const win = window.open("", "_blank")
    win.document.write(html)
    win.document.close()
    setTimeout(() => win.print(), 500)
  }

  return (
    <div className="page page-enter">
      <div className="page-header">
        <div>
          <div className="page-title">Transactions</div>
          <div className="page-sub">Complete purchase history</div>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => fetchData(true)}
          disabled={refreshing}
        >
          <RefreshCw size={14} className={refreshing ? "spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="tx-error">
          <WifiOff size={15} /> {error}
          <button className="btn btn-secondary btn-xs" onClick={() => fetchData()}>Retry</button>
        </div>
      )}

      {/* Filters */}
      <div className="tx-toolbar">
        <div className="tx-filters">
          <div className="filter-group">
            <label>From</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>To</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Meter</label>
            <select value={meter} onChange={e => setMeter(e.target.value)}>
              <option value="">All Meters</option>
              {meters.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.meter_number})</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
            Clear
          </button>
        </div>

        <div className="tx-actions">
          <span className="tx-count">
            {loading ? "Loading..." : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
          </span>
          <button className="dl-btn dl-csv" onClick={downloadCSV} disabled={loading || filtered.length === 0}>
            <Download size={13} /> CSV
          </button>
          <button className="dl-btn dl-pdf" onClick={downloadPDF} disabled={loading || filtered.length === 0}>
            <Download size={13} /> PDF
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Meter</th><th>Token</th><th>Units</th>
                <th>Amount</th><th>Method</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j}>
                      <div className="skeleton" style={{ height: "0.8rem", borderRadius: "4px" }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <div className="tx-empty">
          <div className="tx-empty-icon"><Download size={28} /></div>
          <div className="tx-empty-title">No transactions found</div>
          <div className="tx-empty-sub">
            {transactions.length === 0
              ? "You have not made any purchases yet"
              : "Try adjusting your filters"
            }
          </div>
          {transactions.length > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Meter</th><th>Token</th><th>Units</th>
                <th>Amount</th><th>Method</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td><strong>{t.meter_number ?? t.meter}</strong></td>
                  <td>
                    <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text2)" }}>
                      {t.token ? t.token.substring(0, 14) + "…" : "—"}
                    </span>
                  </td>
                  <td>{t.units_purchased ?? "—"}</td>
                  <td>
                    <span className="mono">{t.amount_rwf ?? "—"}</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--text3)", marginLeft: "0.25rem" }}>RWF</span>
                  </td>
                  <td style={{ textTransform: "capitalize", color: "var(--text2)" }}>
                    {t.payment_method ?? "—"}
                  </td>
                  <td>
                    <span className={`badge ${t.status === "success" ? "badge-active" : "badge-low"}`}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ color: "var(--text3)", fontSize: "0.78rem" }}>
                    {t.created_at?.substring(0, 10) ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}