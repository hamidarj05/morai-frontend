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
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/40 p-6">
        <div className="text-2xl font-extrabold">Login</div> 

        {error ? (
          <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm">
            <b>Error:</b> {error}
          </div>
        ) : null}

        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <div className="text-xs text-white/70 mb-1">Email</div>
            <input
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
            />
          </div>

          <div>
            <div className="text-xs text-white/70 mb-1">Password</div>
            <input
              type="password"
              className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
            />
          </div>

          <button
            disabled={loading}
            className={[
              "w-full rounded-2xl px-4 py-3 text-sm font-extrabold",
              loading ? "bg-emerald-500/40 text-white/70" : "bg-emerald-500 text-slate-950 hover:bg-emerald-400",
            ].join(" ")}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <Link className="text-emerald-300 hover:text-emerald-200" to="/register">
            Register
          </Link> 
        </form>
      </div>
    </div>
  );
}
