import React, { useState } from "react";
import AuthLayout from "./AuthLayout";
import { Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";


export default function LoginPage() {
  const BACKEND_URL = "https://nyay-gpt.onrender.com" || "http://localhost:3000";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Placeholder for actual login logic
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const userCred = await signInWithEmailAndPassword(auth, form.email, form.password);
    const token = await userCred.user.getIdToken();
    console.log("Firebase Auth Token:", token);
    // 🔥 Hit backend to get full user data (email + name)
    const res = await fetch(`${BACKEND_URL}/profile`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
const data = await res.json();


localStorage.setItem("user", JSON.stringify({
  name: data.name,
  email: data.email,
  uid: data.uid,
  token: token, // <-- Yeh zaroori hai!
}));


    alert("Logged in as " + data.name); // Show username, not email
    navigate("/"); // Go to home/dashboard

  } catch (err) {
    alert("❌ " + err.message);
  }

  setLoading(false);
};



  return (
    <AuthLayout title="Welcome Back!" subtitle="Login to your Nyay-GPT account">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-700 focus:border-indigo-500 transition  placeholder-gray-700 text-gray-700"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-700 focus:border-indigo-500 transition placeholder-gray-700 text-gray-700"
            placeholder="Your password"
          />
        </div>
        <button
          type="submit"
          className={`w-full py-3 mt-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg shadow-md hover:scale-105 transition-transform duration-200 ${
            loading && "opacity-50 cursor-not-allowed"
          }`}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <div className="text-center mt-4 text-gray-600">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="text-indigo-600 font-medium hover:underline">
          Sign Up
        </Link>
      </div>
    </AuthLayout>
  );
}