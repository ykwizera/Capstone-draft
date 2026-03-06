import { useState } from "react"
import { Copy, Check, CheckCircle } from "lucide-react"
import "./TokenCard.css"

export default function TokenCard({ token, units, amount, meterName, meterNumber }) {
  const [copied, setCopied]   = useState(false)
  const [applied, setApplied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(token).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="token-card">

      {/* Meter label */}
      <div className="tc-meter">{meterName} · {meterNumber}</div>

      {/* Token code + copy */}
      <div className="tc-token">
        <span className="mono tc-token-val">{token}</span>
        <button className="btn btn-xs btn-secondary" onClick={handleCopy}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Units summary */}
      <div className="tc-units">{units} units · {amount} RWF</div>

      {/* How to apply guide */}
      <div className="tc-guide">
        <div className="tc-guide-title">How to apply your token</div>
        <ol>
          <li>Press the blue button on your electricity meter</li>
          <li>Enter the token code using the keypad: <strong className="mono">{token}</strong></li>
          <li>Press <strong>Accept</strong> or <strong>Enter</strong></li>
          <li>The meter will beep and your balance will update</li>
        </ol>
      </div>

      {/* Mark as applied */}
      <div className="tc-actions">
        {applied ? (
          <span className="applied-badge">
            <CheckCircle size={13} /> Token Applied
          </span>
        ) : (
          <button className="btn btn-success btn-sm" onClick={() => setApplied(true)}>
            <CheckCircle size={14} /> Mark as Applied
          </button>
        )}
      </div>

    </div>
  )
}