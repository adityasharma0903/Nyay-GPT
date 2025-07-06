"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../../firebase"
import { useNavigate } from "react-router-dom"
import { Mail, Lock, Search } from "lucide-react"
import AuthLayout from "./AuthLayout"

export default function LoginPage() {
  const BACKEND_URL = "https://nyay-gpt.onrender.com" || "http://localhost:3000"
  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const userCred = await signInWithEmailAndPassword(auth, form.email, form.password)
      const token = await userCred.user.getIdToken()
      console.log("Firebase Auth Token:", token)

      const res = await fetch(`${BACKEND_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()

      localStorage.setItem(
        "user",
        JSON.stringify({
          name: data.name,
          email: data.email,
          uid: data.uid,
          token: token,
        }),
      )

      alert("Logged in as " + data.name)
      navigate("/")
    } catch (err) {
      alert("❌ " + err.message)
    }
    setLoading(false)
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your Chankya AI account">
      {/* Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Email Field */}
        <div style={styles.inputContainer}>
          <div
            style={{
              ...styles.inputWrapper,
              ...(focusedField === "email" ? styles.inputWrapperFocused : {}),
            }}
          >
            <div style={styles.inputIcon}>
              <Mail size={20} color="#6b7280" />
            </div>
            <div style={styles.inputFieldContainer}>
              <label
                style={{
                  ...styles.floatingLabel,
                  ...(form.email || focusedField === "email" ? styles.floatingLabelActive : {}),
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField("")}
                style={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Password Field */}
        <div style={styles.inputContainer}>
          <div
            style={{
              ...styles.inputWrapper,
              ...(focusedField === "password" ? styles.inputWrapperFocused : {}),
            }}
          >
            <div style={styles.inputIcon}>
              <Lock size={20} color="#6b7280" />
            </div>
            <div style={styles.inputFieldContainer}>
              <label
                style={{
                  ...styles.floatingLabel,
                  ...(form.password || focusedField === "password" ? styles.floatingLabelActive : {}),
                }}
              >
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField("")}
                style={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Forgot Password */}
        <div style={styles.forgotPassword}>
          <a href="#" style={styles.forgotLink}>
            Forgot your password?
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          style={{
            ...styles.submitButton,
            ...(loading ? styles.submitButtonLoading : {}),
          }}
          disabled={loading}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = "translateY(-2px)"
              e.target.style.boxShadow = "0 20px 40px rgba(52, 55, 74, 0.4)"
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.transform = "translateY(0)"
              e.target.style.boxShadow = "0 10px 30px rgba(52, 55, 74, 0.3)"
            }
          }}
        >
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <span>Signing in...</span>
            </div>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div style={styles.divider}>
        <div style={styles.dividerLine}></div>
        <span style={styles.dividerText}>or</span>
        <div style={styles.dividerLine}></div>
      </div>

      {/* Social Login */}
      <div style={styles.socialContainer}>
        <button style={styles.socialButton}>
          <Search size={20} color="#374151" />
          Continue with Google
        </button>
      </div>

      {/* Sign Up Link */}
      <div style={styles.signupContainer}>
        <span style={styles.signupText}>Don't have an account? </span>
        <Link to="/signup" style={styles.signupLink}>
          Create Account
        </Link>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </AuthLayout>
  )
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  inputContainer: {
    position: "relative",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    background: "rgba(255, 255, 255, 0.8)",
    border: "2px solid rgba(229, 231, 235, 0.8)",
    borderRadius: "16px",
    padding: "4px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    backdropFilter: "blur(10px)",
  },
  inputWrapperFocused: {
    borderColor: "#34374a",
    background: "rgba(255, 255, 255, 0.95)",
    boxShadow: "0 0 0 4px rgba(52, 55, 74, 0.1)",
  },
  inputIcon: {
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputFieldContainer: {
    flex: 1,
    position: "relative",
    padding: "8px 16px 8px 0",
  },
  floatingLabel: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "16px",
    color: "#9ca3af",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    pointerEvents: "none",
    fontWeight: "500",
  },
  floatingLabelActive: {
    top: "8px",
    transform: "translateY(0)",
    fontSize: "12px",
    color: "#34374a",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "16px",
    color: "#1f2937",
    paddingTop: "24px",
    paddingBottom: "8px",
    fontWeight: "500",
  },
  forgotPassword: {
    textAlign: "right",
    marginTop: "-8px",
  },
  forgotLink: {
    color: "#34374a",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    transition: "color 0.3s ease",
  },
  submitButton: {
    background: "linear-gradient(135deg, #34374a 0%, #252845 100%)",
    color: "white",
    border: "none",
    borderRadius: "16px",
    padding: "18px 24px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 10px 30px rgba(52, 55, 74, 0.3)",
    position: "relative",
    overflow: "hidden",
  },
  submitButtonLoading: {
    cursor: "not-allowed",
    opacity: 0.8,
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "32px 0",
    gap: "16px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "linear-gradient(90deg, transparent 0%, #e5e7eb 50%, transparent 100%)",
  },
  dividerText: {
    color: "#9ca3af",
    fontSize: "14px",
    fontWeight: "500",
  },
  socialContainer: {
    marginBottom: "24px",
  },
  socialButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "16px",
    border: "2px solid #e5e7eb",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.8)",
    color: "#374151",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
  },
  signupContainer: {
    textAlign: "center",
    padding: "24px 0 0 0",
    borderTop: "1px solid rgba(229, 231, 235, 0.5)",
  },
  signupText: {
    color: "#6b7280",
    fontSize: "16px",
  },
  signupLink: {
    color: "#34374a",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "16px",
    transition: "color 0.3s ease",
  },
}
