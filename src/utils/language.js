export const getLegalAdvice = (transcript, language) => {
  // Simulate AI legal advice
  if (transcript.toLowerCase().includes("salary")) {
    return language === "hi"
      ? "आपको वेतन न मिलने पर श्रम विभाग में शिकायत दर्ज करें। IPC धारा 420 लागू हो सकती है।"
      : "For unpaid salary, file a complaint at the Labour Department. IPC Section 420 may apply.";
  }
  // Add more rules as needed
  return language === "hi"
    ? "आपकी समस्या के लिए संबंधित कानूनी सलाह दी जाएगी।"
    : "Relevant legal advice will be provided for your issue.";
};

export const getTimeline = (transcript, language) => {
  // Simulate timeline steps
  return [
    language === "hi" ? "आरटीआई दायर करें" : "File an RTI",
    language === "hi" ? "एफआईआर दर्ज करें" : "File an FIR",
    language === "hi" ? "कोर्ट में जाएं" : "Approach Court",
  ];
};

export const generatePDF = (transcript, advice) => {
  // For demo, trigger a download with text content.
  const blob = new Blob(
    [`Problem: ${transcript}\n\nAdvice: ${advice}`],
    { type: "application/pdf" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "nyaygpt-advice.pdf";
  a.click();
  URL.revokeObjectURL(url);
};

export const generateFormPDF = (form) => {
  // For demo, generate a PDF blob with form data
  const blob = new Blob(
    [
      `Name: ${form.name}\nIssue: ${form.issue}\nDistrict: ${form.district}\n\n(Pre-filled RTI/FIR form)`,
    ],
    { type: "application/pdf" }
  );
  return URL.createObjectURL(blob);
};