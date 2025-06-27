"use client";
import { useState } from "react";
import { auth, googleProvider, db } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Listen for auth state changes (optional: for redirect/auth state on parent)
  // useEffect(() => {
  //   const unsub = onAuthStateChanged(auth, (user) => {
  //     if (user) onAuth && onAuth(user);
  //   });
  //   return () => unsub();
  // }, [onAuth]);

  async function handleEmailAuth(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Optionally save profile to Firestore:
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email,
          displayName,
          createdAt: new Date().toISOString(),
        });
        // Optionally set displayName in Firebase Auth profile
        await userCredential.user.updateProfile({ displayName });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onAuth && onAuth(auth.currentUser);
    } catch (err) {
      setError(err.message.replace("Firebase:", "").replace("auth/", ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onAuth && onAuth(auth.currentUser);
    } catch (err) {
      setError(err.message.replace("Firebase:", "").replace("auth/", ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#171b2e] to-[#1c203a]">
      <div className="w-full max-w-md bg-[#16182c]/90 rounded-2xl shadow-xl border border-white/10 p-8">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <img src="/chanakya.png" alt="Chanakya AI" className="h-10 w-10 rounded-full" />
          <span className="text-2xl font-bold text-slate-100 tracking-wide">Chanakya AI</span>
        </div>
        <h2 className="text-center text-xl font-bold text-slate-200 mb-6">
          {mode === "signup" ? "Sign Up" : "Sign In"}
        </h2>
        <form onSubmit={handleEmailAuth} className="space-y-5">
          {mode === "signup" && (
            <input
              type="text"
              value={displayName}
              required
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Full Name"
              className="w-full px-4 py-2 rounded-lg bg-[#181b2f] border border-white/10 text-slate-200 focus:outline-none focus:ring focus:ring-cyan-400/30"
            />
          )}
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-2 rounded-lg bg-[#181b2f] border border-white/10 text-slate-200 focus:outline-none focus:ring focus:ring-cyan-400/30"
          />
          <input
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 rounded-lg bg-[#181b2f] border border-white/10 text-slate-200 focus:outline-none focus:ring focus:ring-cyan-400/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-lg transition disabled:opacity-60"
          >
            {mode === "signup" ? "Sign up" : "Sign in"}
          </button>
          {error && <div className="text-red-400 text-sm">{error}</div>}
        </form>
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="mt-4 flex items-center justify-center w-full py-2 rounded-lg bg-[#23263a] hover:bg-[#23263a]/80 text-slate-100 border border-white/10 shadow transition"
        >
          <img src="/google.svg" className="h-5 w-5 mr-2" alt="Google" />
          {mode === "signup" ? "Sign up" : "Sign in"} with Google
        </button>
        <div className="mt-6 text-center">
          <span className="text-slate-400">
            {mode === "signup" ? "Already have an account?" : "Don't have an account?"}
          </span>
          <button
            type="button"
            onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
            className="ml-2 text-cyan-400 font-bold hover:underline"
          >
            {mode === "signup" ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}