import { useState } from "react"
import { Link } from "react-router-dom"
import api from "../api/axios"
import "./PasswordReset.css"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)
    try {
      await api.post("/auth/password-reset/request-otp/", { email })
      setMessage("If the email exists, an OTP has been sent.")
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-logo">IngufuPay</h1>
        <h2 className="auth-title">Forgot password</h2>
        <p className="auth-subtitle">Enter your email to receive a reset code</p>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        <p className="auth-link">
          Remember your password? <Link to="/login">Sign in</Link>
        </p>
        <p className="auth-link">
          Have an OTP? <Link to="/reset-password">Reset password</Link>
        </p>
      </div>
    </div>
  )
}