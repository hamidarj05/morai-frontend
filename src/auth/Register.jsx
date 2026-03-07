import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "./authService";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Name is required.");
    if (!email.trim()) return setError("Email is required.");
    if (!password.trim() || password.length < 4)
      return setError("Password must be at least 4 characters.");

    setLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
      });
      navigate("/feed");
    } catch (e2) {
      setError(String(e2.message || e2));
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-emerald-400">
            Morai Guide
          </h1>
          <p className="text-white/60 text-sm mt-2">
            Join the AI travel community of Morocco
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Create Account
          </h2>

          {error ? (
            <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm">
              <b>Error:</b> {error}
            </div>
          ) : null}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm text-white/70 mb-1 block">Name</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">Email</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
              />
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">Password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 4 characters"
              />
            </div>

            <button
              disabled={loading}
              className={[
                "w-full rounded-xl py-3 font-bold transition",
                loading
                  ? "bg-emerald-500/40 text-white/70 cursor-not-allowed"
                  : "bg-emerald-500 text-slate-950 hover:bg-emerald-400",
              ].join(" ")}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <div className="text-center text-sm text-white/60">
              Already have an account?{" "}
              <Link
                className="text-emerald-400 hover:text-emerald-300 font-semibold"
                to="/login"
              >
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
