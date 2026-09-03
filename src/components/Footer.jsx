import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div>
        <div className="footer-logo">CURIOUSLY ♡</div>

        <p>
          Questions worth going down the rabbit hole for.
        </p>
      </div>

      <div className="footer-links">
        <Link to="/articles">MAGAZINE</Link>
        <Link to="/about">ABOUT</Link>
        <Link to="/contact">CONTACT</Link>

        <a
          href="mailto:asmijainj@gmail.com"
          aria-label="Email Asmi"
        >
          EMAIL
        </a>
      </div>
    </footer>
  );
}