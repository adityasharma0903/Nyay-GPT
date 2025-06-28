import React, { useState } from "react";
import AuthLayout from "./AuthLayout";
import { Link } from "react-router-dom";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";


export default function SignupPage() {
  const BACKEND_URL = "https://nyay-gpt.onrender.com" || "http://localhost:3000";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Placeholder for actual signup logic
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
    await updateProfile(userCred.user, { displayName: form.name });

    const token = await userCred.user.getIdToken();

    // Send token to backend and sync user to MongoDB
    await fetch(`${BACKEND_URL}/sync-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: form.name }),
    });

    // ✅ Now get full user info from /profile
    const res = await fetch(`${BACKEND_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    // ✅ Save to localStorage WITH TOKEN!
    localStorage.setItem("user", JSON.stringify({
      ...data,      // name, email, uid
      token: token, // <-- Yeh zaroori hai!
    }));

    alert("Account created ✅");
    navigate("/"); // redirect to homepage/dashboard
  } catch (err) {
    alert("❌ " + err.message);
  }

  setLoading(false);
};


  return (
    <AuthLayout title="Join Nyay-GPT" subtitle="Create your AI-powered account">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-700 focus:border-indigo-500 transition placeholder-gray-700 text-gray-700"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 ">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-700 focus:border-indigo-500 transition placeholder-gray-700 text-gray-700"
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
            className="w-full px-4 py-2 rounded-lg border border-gray-700 focus:border-indigo-500 transition  placeholder-gray-700 text-gray-700"
            placeholder="Create a password"
          />
        </div>
        <button
          type="submit"
          className={`w-full py-3 mt-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg shadow-md hover:scale-105 transition-transform duration-200 ${
            loading && "opacity-50 cursor-not-allowed"
          }`}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      <div className="text-center mt-4 text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-indigo-600 font-medium hover:underline">
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}