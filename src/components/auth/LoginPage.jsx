import React, { useState } from "react";
import AuthLayout from "./AuthLayout";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Placeholder for actual login logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Implement authentication logic here
    setTimeout(() => setLoading(false), 1200); // Demo purpose
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
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 transition"
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
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 transition"
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