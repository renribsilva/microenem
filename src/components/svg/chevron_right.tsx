const ChevronRight = ({ width = "24px", height = "24px", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 -960 960 960"
    fill="currentColor"
    {...props}
  >
    <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
  </svg>
);

export default ChevronRight;
