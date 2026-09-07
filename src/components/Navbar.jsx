import { Link, useLocation } from "react-router-dom";
import { Search, Bookmark } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="navbar">
      <Link
        to="/"
        className="logo"
        aria-label="Curiously home"
      >
        <span>CURIOUSLY</span>
        <span className="logo-heart">♡</span>
      </Link>

      <div className="nav-issue">
        VOL. 01 / 2026
      </div>

      <nav>
        {/* HOME */}
        <Link
          className={
            location.pathname === "/"
              ? "active"
              : ""
          }
          to="/"
        >
          HOME
        </Link>

        {/* MAGAZINE */}
        <Link
          className={
            location.pathname === "/articles"
              ? "active"
              : ""
          }
          to="/articles"
        >
          MAGAZINE
        </Link>

        {/* ABOUT */}
        <Link
          className={
            location.pathname === "/about"
              ? "active"
              : ""
          }
          to="/about"
        >
          ABOUT
        </Link>

        {/* CONFESS */}
        <Link
          className={
            location.pathname === "/confessions"
              ? "active"
              : ""
          }
          to="/confessions"
        >
          CONFESS
        </Link>

        {/* CONTACT */}
        <Link
          className={
            location.pathname === "/contact"
              ? "active"
              : ""
          }
          to="/contact"
        >
          CONTACT
        </Link>

        {/* SAVED */}
        <Link
          className={
            location.pathname === "/saved"
              ? "active"
              : ""
          }
          to="/saved"
          aria-label="Saved stories"
          title="Saved stories"
        >
          <Bookmark size={13} />
        </Link>

        {/* SEARCH */}
        <a
          href="/#mail"
          aria-label="Reader mail"
        >
          <Search size={13} />
        </a>
      </nav>
    </header>
  );
}