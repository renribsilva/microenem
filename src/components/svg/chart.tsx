const ChartIcon = ({ width = "24px", height = "24px", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 -960 960 960"
    fill="currentColor"
    {...props}
  >
    {/*eslint-disable-next-line*/}
    <path d="M640-160v-280h160v280H640Zm-240 0v-640h160v640H400Zm-240 0v-440h160v440H160Z" />
  </svg>
);

export default ChartIcon;
