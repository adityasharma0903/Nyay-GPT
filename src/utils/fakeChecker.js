export const checkFakeForward = async (msg) => {
  // Fake checker logic; in production, call PIB/AltNews APIs.
  if (msg && msg.toLowerCase().includes("free government money")) {
    return {
      isFake: true,
      proofLink: "https://www.pib.gov.in/fake-news",
    };
  }
  return {
    isFake: false,
    proofLink: "https://www.pib.gov.in/real-news",
  };
};