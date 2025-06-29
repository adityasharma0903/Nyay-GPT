"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { auth } from "../../firebase"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { useNavigate } from "react-router-dom"

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
    <div style={styles.container}>
      {/* Background Effects */}
      <div style={styles.backgroundEffects}>
        <div style={styles.blob1}></div>
        <div style={styles.blob2}></div>
        <div style={styles.blob3}></div>
        <div style={styles.blob4}></div>
      </div>

      {/* Main Content */}
      <div style={styles.mainCard}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <div style={styles.logo}>⚖️</div>
          </div>
          <h1 style={styles.title}>Join Nyay-GPT</h1>
          <p style={styles.subtitle}>Create your AI-powered legal assistant account</p>
        </div>

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
              <div style={styles.inputIcon}>👤</div>
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
              <div style={styles.inputIcon}>📧</div>
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
              <div style={styles.inputIcon}>🔒</div>
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
              <span style={styles.hintIcon}>✓</span>
              <span style={styles.hintText}>At least 6 characters</span>
            </div>
            <div style={styles.hintItem}>
              <span style={styles.hintIcon}>🔐</span>
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
                e.target.style.boxShadow = "0 20px 40px rgba(34, 197, 94, 0.4)"
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(0)"
                e.target.style.boxShadow = "0 10px 30px rgba(34, 197, 94, 0.3)"
              }
            }}
          >
            {loading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              <div style={styles.buttonContent}>
                <span>Create Account</span>
                <span style={styles.buttonIcon}>🚀</span>
              </div>
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
            <span style={styles.socialIcon}>🔍</span>
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
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
    padding: "20px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  backgroundEffects: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    zIndex: 0,
  },
  blob1: {
    position: "absolute",
    top: "-30%",
    left: "-30%",
    width: "80%",
    height: "80%",
    background: "radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)",
    borderRadius: "50%",
    animation: "float 8s ease-in-out infinite",
  },
  blob2: {
    position: "absolute",
    top: "10%",
    right: "-40%",
    width: "90%",
    height: "90%",
    background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)",
    borderRadius: "50%",
    animation: "float 10s ease-in-out infinite reverse",
  },
  blob3: {
    position: "absolute",
    bottom: "-40%",
    left: "10%",
    width: "70%",
    height: "70%",
    background: "radial-gradient(circle, rgba(5, 150, 105, 0.12) 0%, transparent 70%)",
    borderRadius: "50%",
    animation: "float 12s ease-in-out infinite",
  },
  blob4: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "60%",
    height: "60%",
    background: "radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, transparent 70%)",
    borderRadius: "50%",
    animation: "float 14s ease-in-out infinite reverse",
  },
  mainCard: {
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "48px",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    position: "relative",
    zIndex: 1,
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  logoContainer: {
    marginBottom: "24px",
  },
  logo: {
    fontSize: "48px",
    display: "inline-block",
    padding: "16px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0 0 8px 0",
    background: "linear-gradient(135deg, #1f2937 0%, #10b981 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    fontSize: "16px",
    color: "#6b7280",
    margin: 0,
    fontWeight: "400",
    lineHeight: "1.5",
  },
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
    borderColor: "#10b981",
    background: "rgba(255, 255, 255, 0.95)",
    boxShadow: "0 0 0 4px rgba(16, 185, 129, 0.1)",
  },
  inputIcon: {
    fontSize: "20px",
    padding: "16px",
    color: "#6b7280",
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
    color: "#10b981",
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
  hintIcon: {
    fontSize: "12px",
    color: "#10b981",
  },
  hintText: {
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: "500",
  },
  submitButton: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    border: "none",
    borderRadius: "16px",
    padding: "18px 24px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
    position: "relative",
    overflow: "hidden",
    marginTop: "8px",
  },
  submitButtonLoading: {
    cursor: "not-allowed",
    opacity: 0.8,
  },
  buttonContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  buttonIcon: {
    fontSize: "16px",
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
    color: "#10b981",
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
  socialIcon: {
    fontSize: "20px",
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
    color: "#10b981",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "16px",
    transition: "color 0.3s ease",
  },
}

// Add CSS animations and hover effects
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style")
  styleElement.textContent = `
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-25px) rotate(3deg); }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .social-button:hover {
      border-color: #10b981 !important;
      background: rgba(16, 185, 129, 0.05) !important;
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
    
    .terms-link:hover {
      color: #059669 !important;
      text-decoration: underline;
    }
    
    .login-link:hover {
      color: #059669 !important;
      text-decoration: underline;
    }
  `
  document.head.appendChild(styleElement)
}
