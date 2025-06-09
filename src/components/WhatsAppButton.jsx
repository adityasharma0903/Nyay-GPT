import React from "react";

const WhatsAppButton = ({ transcript, advice }) => {
  const handleSend = () => {
    const message = encodeURIComponent(`Problem: ${transcript}\nAdvice: ${advice}`);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <button className="whatsapp-btn" onClick={handleSend}>
      Send via WhatsApp
    </button>
  );
};

export default WhatsAppButton;