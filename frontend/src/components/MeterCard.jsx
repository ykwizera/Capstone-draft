import { useNavigate } from "react-router-dom"
import { Zap, AlertTriangle, MapPin } from "lucide-react"
import "./MeterCard.css"

export default function MeterCard({ meter, onDisable, onEnable }) {
  const navigate  = useNavigate()
  const isDisabled = meter.status === "disabled"
  const isLow      = meter.is_low_balance && !isDisabled

  return (
    <div className={`meter-card${isLow ? " low" : ""}${isDisabled ? " disabled-meter" : ""}`}>
      <div className="mc-top">
        <div className={`mc-icon${isLow ? " mc-icon-low" : ""}`}>
          {isLow ? <AlertTriangle size={18} /> : <Zap size={18} />}
        </div>
        <span className={`badge ${
          isDisabled ? "badge-disabled" : isLow ? "badge-low" : "badge-active"
        }`}>
          {isDisabled ? "disabled" : meter.status}
        </span>
      </div>

      <div className="mc-name">{meter.name}</div>
      <div className="mc-num mono">{meter.meter_number}</div>

      {meter.location && (
        <div className="mc-loc">
          <MapPin size={12} />
          {meter.location}
        </div>
      )}

      <div className="mc-bal">
        <span className="mc-bal-label">Balance</span>
        <span className={`mc-bal-val mono${isLow ? " mc-bal-low" : ""}`}>
          {meter.current_balance_units} units
        </span>
      </div>

      {isLow && (
        <div className="mc-alert">
          <AlertTriangle size={12} /> Low balance — top up soon
        </div>
      )}

      <div className="mc-actions">
        {!isDisabled && (
          <button
            className="btn btn-primary btn-xs"
            onClick={() => navigate(`/meters/${meter.id}`)}
          >
            View
          </button>
        )}
        {isDisabled ? (
          <button
            className="btn btn-secondary btn-xs"
            onClick={() => onEnable(meter.id)}
          >
            Enable
          </button>
        ) : (
          <button
            className="btn btn-secondary btn-xs"
            onClick={() => onDisable(meter.id)}
          >
            Disable
          </button>
        )}
      </div>
    </div>
  )
}