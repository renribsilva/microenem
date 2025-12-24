import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <div>
        <p >
          We can’t seem to find the page you are looking for!
        </p>
        <Link
          href="/"
        >
          Back to Home Page
        </Link>
      </div>
      {/* <!-- Footer --> */}
      <p>
        &copy; {new Date().getFullYear()} - TailAdmin
      </p>
    </div>
  );
}