export const getLegalAdvice = async (transcript, language) => {
  try {
    const res = await fetch("http://localhost:8000/legal_advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: transcript, language }),
    });
    const data = await res.json();
    return data.advice || "Koi advice nahi mili.";
  } catch (e) {
    return "Server error ya backend down!";
  }
};

export const getTimeline = (transcript, language) => {
  return [
    language === "hi" ? "आरटीआई दायर करें" : "File an RTI",
    language === "hi" ? "एफआईआर दर्ज करें" : "File an FIR",
    language === "hi" ? "कोर्ट में जाएं" : "Approach Court",
  ];
};

// Dummy PDF functions if needed
export const generatePDF = (data) => {
  console.log("Generating PDF for: ", data);
  return "PDF generated!";
};

export const generateFormPDF = (data) => {
  console.log("Generating Form PDF for: ", data);
  return "Form PDF generated!";
};