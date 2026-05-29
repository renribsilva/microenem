const Sort = ({ width = "24px", height = "24px", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={height}
    viewBox="0 -960 960 960"
    width={width}
    fill="currentColor"
    {...props}
  >
    {/*eslint-disable-next-line*/}
    <path d="M120-240v-80h240v80H120Zm0-200v-80h480v80H120Zm0-200v-80h720v80H120Z" />
  </svg>
);

export default Sort;
