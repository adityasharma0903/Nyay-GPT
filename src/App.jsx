import { Routes, Route } from "react-router-dom";
import MainLanding from "./components/MainLanding";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLanding />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  );
}