import React from "react";
import { generatePDF } from "../utils/language";

const PDFDownloadButton = ({ transcript, advice }) => {
  const handleDownload = () => {
    generatePDF(transcript, advice);
  };

  return (
    <button className="pdf-btn" onClick={handleDownload}>
      Download PDF
    </button>
  );
};

export default PDFDownloadButton;