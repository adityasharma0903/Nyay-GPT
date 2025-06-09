import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Result from "./components/Result";
import FormFiller from "./components/FormFiller";
import FakeForwardChecker from "./components/FakeForwardChecker";
import Header from "./components/Header";
import "./styles/global.css";
import { ThemeProvider } from "./styles/theme";

const App = () => {
  // Global language state
  const [language, setLanguage] = useState("hi"); // default Hindi

  return (
    <ThemeProvider>
      <Router>
        <Header language={language} setLanguage={setLanguage} />
        <Routes>
          <Route path="/" element={<Home language={language} />} />
          <Route path="/result" element={<Result language={language} />} />
          <Route path="/form" element={<FormFiller language={language} />} />
          <Route path="/fake-check" element={<FakeForwardChecker language={language} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;