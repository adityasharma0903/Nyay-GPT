import React from "react";

const Timeline = ({ steps }) => (
  <div className="timeline">
    {steps.map((step, idx) => (
      <div className="timeline-step" key={idx}>
        <span className="timeline-number">{idx + 1}</span>
        <span className="timeline-desc">{step}</span>
      </div>
    ))}
  </div>
);

export default Timeline;