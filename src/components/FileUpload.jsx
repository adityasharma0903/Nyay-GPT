import React, { useRef } from "react";

export default function FileUpload({ onFileSelected }) {
  const fileInput = useRef();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "1rem", justifyContent: "center" }}>
      <button
        onClick={() => fileInput.current.click()}
        style={{
          borderRadius: "1.5rem",
          padding: "0.5rem 1.25rem",
          background: "linear-gradient(90deg, #10b981 30%, #059669 100%)",
          color: "#fff",
          fontWeight: 600,
          border: "none",
          boxShadow: "0 2px 8px rgba(16,185,129,0.12)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          cursor: "pointer",
        }}
      >
        <span role="img" aria-label="upload">📎</span> Upload PDF/Photo
      </button>
      <input
        type="file"
        accept=".pdf,image/*"
        style={{ display: "none" }}
        ref={fileInput}
        onChange={handleFileChange}
      />
    </div>
  );
}