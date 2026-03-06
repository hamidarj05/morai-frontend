import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCities, getComments, getPosts, getScams, getSpots } from "../../api/jsonApi";

export default function AdminDashboard() {
  const [cities, setCities] = useState([]);
  const [spots, setSpots] = useState([]);
  const [scams, setScams] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(false);

  function loadAll() {
    setLoading(true);
    // promise.all pour charger plusieurs requêtes en même temps
    Promise.all([getCities(), getSpots(), getScams(), getPosts(), getComments()])
      .then(([c, s, sc, p, cm]) => {
        setCities(c.data || []);
        setSpots(s.data || []);
        setScams(sc.data || []);
        setPosts(p.data || []);
        setComments(cm.data || []);
      })
      .catch(() => {
        setCities([]);
        setSpots([]);
        setScams([]);
        setPosts([]);
        setComments([]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAll();
  }, []);

  const recentPosts = useMemo(() => {
    return posts
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [posts]);

  function cityNameById(id) {
    // Gérer cityId comme objet ou string
    const idStr = typeof id === "object" ? String(id?._id || id?.id) : String(id);
    const c = cities.find((x) => String(x.id) === idStr);
    return c ? c.name : "Unknown";
  }

  function statCard(title, value, hint) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs text-white/60">{title}</div>
        <div className="mt-1 text-3xl font-extrabold">{value}</div>
        <div className="mt-2 text-xs text-white/60">{hint}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xl font-extrabold">Admin Dashboard</div> 
        </div>

        <button
          onClick={loadAll}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCard("Cities", cities.length, "Total cities in the app")}
        {statCard("Spots", spots.length, "Places to visit")}
        {statCard("Scams", scams.length, "Safety warnings")}
        {statCard("Posts", posts.length, "Community posts")}
        {statCard("Comments", comments.length, "User interactions")}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="font-extrabold">Quick Actions</div>
          <div className="text-sm text-white/60 mt-1">
            Jump to management pages
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Link className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm hover:bg-white/10" to="/admin/cities">
              Manage Cities
            </Link>
            <Link className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm hover:bg-white/10" to="/admin/spots">
              Manage Spots
            </Link>
            <Link className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm hover:bg-white/10" to="/admin/scams">
              Manage Scams
            </Link>
            <Link className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm hover:bg-white/10" to="/admin/posts">
              Manage Posts
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="font-extrabold">City Content Check</div>
          <div className="text-sm text-white/60 mt-1">
            Cities with low content (helps you know what to add)
          </div>

          <div className="mt-3 space-y-2">
            {cities.slice(0, 8).map((c) => {
              const spotsCount = spots.filter((s) => {
                const sCityIdStr = typeof s.cityId === "object" ? String(s.cityId?._id || s.cityId?.id) : String(s.cityId);
                return sCityIdStr === String(c.id);
              }).length;
              const scamsCount = scams.filter((s) => {
                const sCityIdStr = typeof s.cityId === "object" ? String(s.cityId?._id || s.cityId?.id) : String(s.cityId);
                return sCityIdStr === String(c.id);
              }).length;

              const warn = spotsCount < 2 || scamsCount < 1;

              return (
                <div key={c.id} className="rounded-xl border border-white/10 bg-slate-950/30 p-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold">{c.name}</div>
                    <div className="text-xs text-white/60">
                      Spots: {spotsCount} • Scams: {scamsCount}
                    </div>
                  </div>
                  <div className="text-xs">
                    {warn ? (
                      <span className="rounded-full border border-yellow-400/30 bg-yellow-500/10 px-2 py-1 text-yellow-200">
                        Needs data
                      </span>
                    ) : (
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-emerald-200">
                        OK
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {cities.length === 0 ? (
              <div className="text-sm text-white/60">No cities found.</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="font-extrabold">Recent Posts</div>
            <div className="text-sm text-white/60">Last 5 community posts</div>
          </div>
          <Link
            className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm hover:bg-white/10"
            to="/admin/posts"
          >
            Open Posts
          </Link>
        </div>

        <div className="mt-3 space-y-2">
          {recentPosts.map((p) => (
            <div key={p.id} className="rounded-xl border border-white/10 bg-slate-950/30 p-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="font-bold">{p.title}</div>
                <div className="text-xs text-white/60">
                  📍 {cityNameById(p.cityId)} • {p.type || "post"}
                </div>
              </div>
              <div className="text-sm text-white/70 mt-1">
                {(p.text || "").slice(0, 120)}
                {(p.text || "").length > 120 ? "..." : ""}
              </div>
            </div>
          ))}

          {recentPosts.length === 0 ? (
            <div className="text-sm text-white/60">No posts yet.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
