"use client"
import { Scale } from "lucide-react"

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1d2e 0%, #252845 100%)",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Effects */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-30%",
            left: "-30%",
            width: "80%",
            height: "80%",
            background: "radial-gradient(circle, rgba(52, 55, 74, 0.3) 0%, transparent 70%)",
            borderRadius: "50%",
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "-40%",
            width: "90%",
            height: "90%",
            background: "radial-gradient(circle, rgba(37, 40, 69, 0.2) 0%, transparent 70%)",
            borderRadius: "50%",
            animation: "float 10s ease-in-out infinite reverse",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-40%",
            left: "10%",
            width: "70%",
            height: "70%",
            background: "radial-gradient(circle, rgba(26, 29, 46, 0.4) 0%, transparent 70%)",
            borderRadius: "50%",
            animation: "float 12s ease-in-out infinite",
          }}
        />
      </div>

      {/* Main Card */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "48px",
          width: "100%",
          maxWidth: "480px",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div
          style={{
            position: "absolute",
            top: "-30px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(135deg, #34374a 0%, #252845 100%)",
            borderRadius: "20px",
            width: "60px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 30px rgba(26, 29, 46, 0.4)",
            border: "4px solid white",
          }}
        >
          <Scale size={24} color="white" />
        </div>

        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginTop: "40px",
            marginBottom: "40px",
          }}
        >
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#1f2937",
              margin: "0 0 8px 0",
              background: "linear-gradient(135deg, #1f2937 0%, #34374a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#6b7280",
              margin: 0,
              fontWeight: "400",
              lineHeight: "1.5",
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(3deg); }
        }
      `}</style>
    </div>
  )
}
