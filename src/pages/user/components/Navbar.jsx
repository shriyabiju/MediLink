import { useState, useEffect } from "react";
import { Menu, X, Heart } from "lucide-react";
import "../css/navbar.css";

const links = [
  { label: "Home",     href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Services", href: "#services" },
  { label: "Doctors",  href: "#doctors" },
  { label: "About",    href: "#about" },
  { label: "Contact",  href: "#contact" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      {/* Brand */}
      <a href="#home" className="navbar-brand">
        <div className="navbar-brand-icon"><Heart size={18} fill="#fff" color="#fff" /></div>
        <span>MediLink</span>
      </a>

      {/* Desktop links */}
      <ul className="navbar-links">
        {links.map((l) => (
          <li key={l.label}><a href={l.href}>{l.label}</a></li>
        ))}
      </ul>

      {/* Actions */}
      <div className="navbar-actions">
        <a href="/login"  className="btn-nav-login">Login</a>
        <a href="/signup" className="btn-nav-signup">Sign Up</a>
      </div>

      {/* Mobile hamburger */}
      <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="navbar-mobile">
          {links.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
          ))}
          <div className="navbar-mobile-actions">
            <a href="/login"  className="btn-nav-login">Login</a>
            <a href="/signup" className="btn-nav-signup">Sign Up</a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
