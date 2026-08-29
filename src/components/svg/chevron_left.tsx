const ChevronLeft = ({ width = "24px", height = "24px", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 -960 960 960"
    fill="currentColor"
    {...props}
  >
    <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z" />{" "}
  </svg>
);

export default ChevronLeft;
