import React from "react";

const Menu = ({ width = "24px", height = "24px", ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={width}
    height={height}
    viewBox="0 -960 960 960" 
    fill="currentColor"
  >
    <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/>
  </svg>
);

export default Menu;