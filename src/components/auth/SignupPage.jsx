"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { auth } from "../../firebase"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import { Mail, Lock, User, Check, Shield, Search } from "lucide-react"
import AuthLayout from "./AuthLayout"

export default function SignupPage() {
  const BACKEND_URL = "https://nyay-gpt.onrender.com" || "http://localhost:3000"
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await updateProfile(userCred.user, { displayName: form.name })
      const token = await userCred.user.getIdToken()

      // Send token to backend and sync user to MongoDB
      await fetch(`${BACKEND_URL}/sync-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: form.name }),
      })

      // Get full user info from /profile
      const res = await fetch(`${BACKEND_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()

      // Save to localStorage WITH TOKEN
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...data,
          token: token,
        }),
      )

      alert("Account created ✅")
      navigate("/")
    } catch (err) {
      alert("❌ " + err.message)
    }
    setLoading(false)
  }

  return (
    <AuthLayout title="Join Chankya AI" subtitle="Create your AI-powered legal assistant account">
      {/* Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Name Field */}
        <div style={styles.inputContainer}>
          <div
            style={{
              ...styles.inputWrapper,
              ...(focusedField === "name" ? styles.inputWrapperFocused : {}),
            }}
          >
            <div style={styles.inputIcon}>
              <User size={20} color="#6b7280" />
            </div>
            <div style={styles.inputFieldContainer}>
              <label
                style={{
                  ...styles.floatingLabel,
                  ...(form.name || focusedField === "name" ? styles.floatingLabelActive : {}),
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField("")}
                style={styles.input}
              />
            </div>
          </div>
        </div>

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
                Create Password
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

        {/* Password Requirements */}
        <div style={styles.passwordHints}>
          <div style={styles.hintItem}>
            <Check size={12} color="#34374a" />
            <span style={styles.hintText}>At least 6 characters</span>
          </div>
          <div style={styles.hintItem}>
            <Shield size={12} color="#34374a" />
            <span style={styles.hintText}>Keep it secure and unique</span>
          </div>
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
              <span>Creating Account...</span>
            </div>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      {/* Terms */}
      <div style={styles.termsContainer}>
        <p style={styles.termsText}>
          By creating an account, you agree to our{" "}
          <a href="#" style={styles.termsLink}>
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" style={styles.termsLink}>
            Privacy Policy
          </a>
        </p>
      </div>

      {/* Divider */}
      <div style={styles.divider}>
        <div style={styles.dividerLine}></div>
        <span style={styles.dividerText}>or</span>
        <div style={styles.dividerLine}></div>
      </div>

      {/* Social Signup */}
      <div style={styles.socialContainer}>
        <button style={styles.socialButton}>
          <Search size={20} color="#374151" />
          Sign up with Google
        </button>
      </div>

      {/* Login Link */}
      <div style={styles.loginContainer}>
        <span style={styles.loginText}>Already have an account? </span>
        <Link to="/login" style={styles.loginLink}>
          Sign In
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
    gap: "20px",
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
  passwordHints: {
    display: "flex",
    gap: "16px",
    marginTop: "-8px",
    flexWrap: "wrap",
  },
  hintItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  hintText: {
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: "500",
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
    marginTop: "8px",
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
  termsContainer: {
    margin: "24px 0 16px 0",
    textAlign: "center",
  },
  termsText: {
    fontSize: "13px",
    color: "#6b7280",
    lineHeight: "1.5",
    margin: 0,
  },
  termsLink: {
    color: "#34374a",
    textDecoration: "none",
    fontWeight: "500",
    transition: "color 0.3s ease",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "24px 0",
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
  loginContainer: {
    textAlign: "center",
    padding: "24px 0 0 0",
    borderTop: "1px solid rgba(229, 231, 235, 0.5)",
  },
  loginText: {
    color: "#6b7280",
    fontSize: "16px",
  },
  loginLink: {
    color: "#34374a",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "16px",
    transition: "color 0.3s ease",
  },
}
