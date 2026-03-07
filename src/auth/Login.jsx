import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./authService";
import { Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email.trim(), password.trim());
      if (user.role === "admin") navigate("/admin");
      else navigate("/feed");
    } catch (e2) {
      setError(String("Les informations Incorrecte"));
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
            Explore cities. Share moments. Discover Morocco.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Welcome Back
          </h2>

          {error ? (
            <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm">
              <b>Error:</b> {error}
            </div>
          ) : null}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm text-white/70 mb-1 block">Email</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="text-sm text-white/70 mb-1 block">Password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <button
              disabled={loading}
              className={[
                "w-full rounded-xl py-3 font-bold transition",
                loading
                  ? "bg-emerald-500/40 text-white/70"
                  : "bg-emerald-500 text-slate-950 hover:bg-emerald-400",
              ].join(" ")}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="text-center text-sm text-white/60">
              Don’t have an account?{" "}
              <Link
                className="text-emerald-400 hover:text-emerald-300 font-semibold"
                to="/register"
              >
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
