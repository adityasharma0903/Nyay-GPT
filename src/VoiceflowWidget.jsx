import { useEffect } from "react";

const VoiceflowWidget = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.voiceflow.com/widget/bundle.mjs";
    script.type = "module";

    script.onload = () => {
      window.voiceflow.chat.load({
        verify: { projectID: "684af77d6978976af8011f3e" }, // your project ID
        url: "https://general-runtime.voiceflow.com",
        versionID: "production", // or "development" if you're still testing
      });
    };

    document.body.appendChild(script);
  }, []);

  return null;
};

export default VoiceflowWidget;
