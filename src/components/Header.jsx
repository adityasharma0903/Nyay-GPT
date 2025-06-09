import React from "react";
import LanguageToggle from "./LanguageToggle";
import logo from "../assets/logo.png";

const Header = ({ language, setLanguage }) => (
  <header className="header">
    <img src={logo} alt="NyayGPT Logo" className="logo" />
    <h1 className="title">NyayGPT</h1>
    <LanguageToggle language={language} setLanguage={setLanguage} />
  </header>
);

export default Header;