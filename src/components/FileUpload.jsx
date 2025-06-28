import React, { useRef } from 'react';
import { FaUpload, FaFilePdf, FaImage, FaTimes, FaMicrophone } from 'react-icons/fa';

const FileUpload = ({
  onFileSelected,
  uploadedFile,
  filePreview,
  loading,
  onClearFile,
  awaitingVoiceContext,
  onStartVoiceContext,
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
      if (!validTypes.includes(file.type)) {
        alert("Please upload only PDF, JPG, or PNG files.");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size should be less than 10MB.");
        return;
      }

      onFileSelected(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      {/* File Upload Button */}
      {!uploadedFile && (
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <button
            onClick={triggerFileInput}
            disabled={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              background: loading
                ? "rgba(75, 85, 99, 0.8)"
                : "linear-gradient(135deg, rgba(16, 185, 129, 0.8) 0%, rgba(5, 150, 105, 0.9) 100%)",
              backdropFilter: "blur(20px)",
              color: "#ffffff",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "1rem",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              fontWeight: "600",
              outline: "none",
              opacity: loading ? 0.6 : 1,
              transition: "all 0.3s ease",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, rgba(5, 150, 105, 0.9) 0%, rgba(4, 120, 87, 1) 100%)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, rgba(16, 185, 129, 0.8) 0%, rgba(5, 150, 105, 0.9) 100%)";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            <FaUpload />
            {loading ? "Processing..." : "Upload Legal Document"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <div
            style={{
              fontSize: "0.75rem",
              color: "rgba(255, 255, 255, 0.6)",
              marginTop: "0.5rem",
            }}
          >
            PDF, JPG, PNG (Max 10MB)
          </div>
        </div>
      )}

      {/* File Preview */}
      {uploadedFile && filePreview && (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(20px)",
            borderRadius: "1rem",
            padding: "1rem",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            marginBottom: "1rem",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            {uploadedFile.type.startsWith("image/") ? (
              <FaImage style={{ color: "#60a5fa", fontSize: "1.25rem" }} />
            ) : (
              <FaFilePdf style={{ color: "#ef4444", fontSize: "1.25rem" }} />
            )}
            <div>
              <div style={{ color: "#ffffff", fontWeight: "500", fontSize: "0.875rem" }}>{uploadedFile.name}</div>
              <div style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.75rem" }}>
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
            <button
              onClick={onClearFile}
              style={{
                marginLeft: "auto",
                background: "rgba(248, 113, 113, 0.2)",
                border: "1px solid rgba(248, 113, 113, 0.3)",
                borderRadius: "0.5rem",
                padding: "0.5rem",
                color: "#f87171",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <FaTimes />
            </button>
          </div>

          {/* Image Preview */}
          {uploadedFile.type.startsWith("image/") && (
            <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
              <img
                src={filePreview}
                alt="Document preview"
                style={{
                  maxWidth: "200px",
                  maxHeight: "150px",
                  borderRadius: "0.5rem",
                  objectFit: "contain",
                }}
              />
            </div>
          )}

          {/* Voice Context Collection */}
          {awaitingVoiceContext && (
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button
                onClick={onStartVoiceContext}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.5rem",
                  background: "linear-gradient(135deg, rgba(96, 165, 250, 0.8) 0%, rgba(59, 130, 246, 0.9) 100%)",
                  backdropFilter: "blur(20px)",
                  color: "#ffffff",
                  border: "1px solid rgba(96, 165, 250, 0.3)",
                  borderRadius: "1rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  outline: "none",
                  transition: "all 0.3s ease",
                  boxShadow: "0 8px 32px rgba(96, 165, 250, 0.3)",
                }}
              >
                <FaMicrophone />
                Start Voice Analysis
              </button>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255, 255, 255, 0.6)",
                  marginTop: "0.5rem",
                }}
              >
                Tell me about your legal concern with this document
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div
          style={{
            background: "rgba(96, 165, 250, 0.1)",
            backdropFilter: "blur(20px)",
            borderRadius: "1rem",
            padding: "1.5rem",
            border: "1px solid rgba(96, 165, 250, 0.2)",
            textAlign: "center",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              color: "#60a5fa",
              fontWeight: "600",
              marginBottom: "0.5rem",
              fontSize: "1rem",
            }}
          >
            🔍 Analyzing your document...
          </div>
          <div
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "0.875rem",
            }}
          >
            Please wait while I review your legal document.
          </div>

          {/* Loading animation */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.25rem",
              marginTop: "1rem",
            }}
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#60a5fa",
                  animation: `bounce 1.4s infinite ease-in-out both`,
                  animationDelay: `${i * 0.16}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default FileUpload;