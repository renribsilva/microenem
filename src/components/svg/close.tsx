const Close = ({ width = "24px", height = "24px", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 -960 960 960"
    fill="currentColor"
    {...props}
  >
    {/*eslint-disable-next-line*/}
    <path d="m336-280-56-56 144-144-144-143 56-56 144 144 143-144 56 56-144 143 144 144-56 56-143-144-144 144Z" />
  </svg>
);

export default Close;
