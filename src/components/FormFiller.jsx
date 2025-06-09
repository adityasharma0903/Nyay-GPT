import React, { useState } from "react";
import { generateFormPDF } from "../utils/language";

const FormFiller = ({ language }) => {
  const [form, setForm] = useState({ name: "", issue: "", district: "" });
  const [pdfUrl, setPdfUrl] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenerate = () => {
    const url = generateFormPDF(form);
    setPdfUrl(url);
  };

  return (
    <div className="form-filler-page">
      <h2>{language === "hi" ? "आरटीआई/एफआईआर फॉर्म भरें" : "Fill RTI/FIR Form"}</h2>
      <input name="name" placeholder="Name / नाम" value={form.name} onChange={handleChange} />
      <input name="issue" placeholder="Issue / समस्या" value={form.issue} onChange={handleChange} />
      <input name="district" placeholder="District / जिला" value={form.district} onChange={handleChange} />
      <button className="generate-btn" onClick={handleGenerate}>
        {language === "hi" ? "डाउनलोड करें" : "Download"}
      </button>
      {pdfUrl && (
        <a href={pdfUrl} download="form.pdf" className="download-link">
          Download PDF
        </a>
      )}
    </div>
  );
};

export default FormFiller;