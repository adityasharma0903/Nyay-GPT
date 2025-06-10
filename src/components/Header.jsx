"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"

const Header = ({ language, setLanguage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const navItems = [
    {
      path: "/",
      label: language === "hi" ? "होम" : "Home",
      icon: "🏠",
    },
    // {
    //   path: "/mike",
    //   label: language === "hi" ? "माइक चैट" : "Mike Chat",
    //   icon: "🎤",
    // },
    {
      path: "/form",
      label: language === "hi" ? "फॉर्म भरें" : "Fill Form",
      icon: "📝",
    },
    {
      path: "/fake-check",
      label: language === "hi" ? "फेक चेक" : "Fake Check",
      icon: "🔍",
    },
  ]

  return (
    <header className="modern-header">
      <nav className="navbar">
        <div className="nav-container">
          {/* Brand Logo */}
          <Link to="/" className="nav-brand">
            <div className="brand-icon">⚖️</div>
            <div className="brand-text">
              <span className="brand-name">NyayGPT</span>
              <span className="brand-tagline">{language === "hi" ? "कानूनी सहायक" : "Legal Assistant"}</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-menu">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className={`nav-link ${isActive(item.path) ? "active" : ""}`}>
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Language Selector */}
          <div className="language-selector">
            <button className={`lang-option ${language === "hi" ? "active" : ""}`} onClick={() => setLanguage("hi")}>
              हिं
            </button>
            <button className={`lang-option ${language === "en" ? "active" : ""}`} onClick={() => setLanguage("en")}>
              EN
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="mobile-menu-btn" onClick={toggleMenu}>
            <span className={`hamburger ${isMenuOpen ? "active" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`mobile-menu ${isMenuOpen ? "active" : ""}`}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${isActive(item.path) ? "active" : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}

export default Header
