import React, { useState } from "react";
import { checkFakeForward } from "../utils/fakeChecker";

const FakeForwardChecker = ({ language }) => {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);

  const handleCheck = async () => {
    const res = await checkFakeForward(message);
    setResult(res);
  };

  return (
    <div className="fake-forward-checker-page">
      <h2>{language === "hi" ? "फेक फॉरवर्ड जांचें" : "Check WhatsApp Forward"}</h2>
      <textarea
        placeholder="Paste WhatsApp message here"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        className="forward-textarea"
      />
      <button className="check-btn" onClick={handleCheck}>
        {language === "hi" ? "जांचें" : "Check"}
      </button>
      {result && (
        <div className={`result-box ${result.isFake ? "fake" : "real"}`}>
          {result.isFake ? "❌ Fake" : "✅ Real"}
          {result.proofLink && (
            <a href={result.proofLink} target="_blank" rel="noopener noreferrer">
              {language === "hi" ? "प्रमाण लिंक" : "Proof Link"}
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default FakeForwardChecker;