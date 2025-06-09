import React from "react";

const LANGUAGES = [
  { code: "hi", label: "हिंदी" },
  { code: "en", label: "English" },
  { code: "ta", label: "தமிழ்" },
  { code: "bn", label: "বাংলা" },
  { code: "mr", label: "मराठी" },
];

const LanguageToggle = ({ language, setLanguage }) => (
  <div className="language-toggle">
    {LANGUAGES.map((lang) => (
      <button
        key={lang.code}
        className={`lang-btn ${lang.code === language ? "active" : ""}`}
        onClick={() => setLanguage(lang.code)}
      >
        {lang.label}
      </button>
    ))}
  </div>
);

export default LanguageToggle;