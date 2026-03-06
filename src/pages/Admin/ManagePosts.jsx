import React, { useEffect, useState } from "react";
import { deleteComment, deletePost, getComments, getPosts, getCities } from "../../api/jsonApi";

export default function ManagePosts() {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [cities, setCities] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  function loadData() {
    setLoading(true);

    Promise.all([getPosts(), getComments(), getCities()])
      .then(([pRes, cRes, citiesRes]) => {
        setPosts(pRes.data || []);
        setComments(cRes.data || []);
        setCities(citiesRes.data || []);
      })
      .catch(() => {
        setPosts([]);
        setComments([]);
        setCities([]);
      })
      .finally(() => setLoading(false));
  }

  function cityNameById(id) {
    // Gérer cityId comme objet ou string
    const idStr = typeof id === "object" ? String(id?._id || id?.id) : String(id);
    const c = cities.find((x) => String(x.id) === idStr);
    return c ? c.name : "Unknown";
  }

  useEffect(() => {
    loadData();
  }, []);

  async function removePost(postId) {
    const ok = window.confirm("Delete this post?");
    if (!ok) return;

    try {
      // supprimer tous les commentaires liés à ce post
      for(let i=0 ; i<comments.length ; i++){
        if(comments[i].postId===postId){
          await deleteComment(comments[i].id);
        }
      }
      await deletePost(postId);

      // Recharger les données
      loadData();
    } catch (e) {
      alert("Delete failed. Backend may not support DELETE yet.");
    }
  }

  // filtre les posts par titre ou texte
  const filtered = posts.filter((p) => {
    const t = (p.title || "").toLowerCase();
    const txt = (p.text || "").toLowerCase();
    const s = search.toLowerCase();
    return t.includes(s) || txt.includes(s);
  });

  return (
    <div>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xl font-extrabold">Manage Posts</div>
          <div className="text-sm text-white/60">
            Admin moderation: delete bad content
          </div>
        </div>

        <div className="flex gap-2">
          <input
            className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
            placeholder="Search title or text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={loadData}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-white/70">
          Loading...
        </div>
      ) : null}

      <div className="mt-4 overflow-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/60 text-white/80">
            <tr> 
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">City</th>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">—</th>
              <th className="text-left p-3">Created</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-white/10"> 
                <td className="p-3 text-white/80">{p.type || "-"}</td>
                <td className="p-3 text-white/80">{cityNameById(p.cityId)}</td>
                <td className="p-3">
                  <div className="font-bold">{p.title}</div>
                  <div className="text-white/60 line-clamp-2">{p.text}</div>
                </td>
                <td className="p-3 text-white/80">—</td>
                <td className="p-3 text-white/70">
                  {p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => removePost(p.id)}
                    className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm hover:bg-red-500/15"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {!loading && filtered.length === 0 ? (
              <tr>
                <td className="p-4 text-white/60" colSpan="7">
                  No posts found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

    </div>
  );
}
