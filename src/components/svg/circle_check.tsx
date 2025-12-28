import React from "react";

const CircleFulfill = ({ width = "24px", height = "24px", ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={width}
    height={height}
    viewBox="0 -960 960 960" 
    fill="currentColor" 
  >
    <path d="M480-80q-166 0-283-117T80-480q0-166 117-283t283-117q166 0 283 117t117 283q0 166-117 283T480-80Z"/>
  </svg>
);

export default CircleFulfill;