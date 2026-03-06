import { useEffect, useState } from "react";
import { createPost, getCities, uploadPostImage } from "../api/jsonApi";
import { useNavigate } from "react-router-dom";

export default function CreatePostPage() {
  const navigate = useNavigate();

  // All hooks must be declared unconditionally at the top
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cityId, setCityId] = useState("");
  const [type, setType] = useState("moment");  
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState("");  
  const [tags, setTags] = useState("");  

  const user = JSON.parse(localStorage.getItem("currentUser") || "null");
  
  // charger les villes
  useEffect(() => {
    getCities()
      .then((res) => {
        setCities(res.data);
        if (res.data.length > 0) setCityId(String(res.data[0].id));
      })
      .catch(() => setCities([]));
  }, []);

  // Vérifier que l'utilisateur est bien connecté
  if (!user || !user.id) {
    return (
      <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4">
        <b>Error:</b> Please login to create a post
      </div>
    );
  }

  async function submitPost(e) {
    e.preventDefault();
    setError("");

    if (!cityId) return setError("Choose a city.");
    if (!title.trim()) return setError("Title is required.");
    if (!text.trim()) return setError("Text is required.");

    const tagsArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newPost = {
      cityId: String(cityId),         
      userId: user.id,                      
      type,
      title: title.trim(),
      text: text.trim(),
      image: image.trim(),            
      tags: tagsArray,
      likes: {nbLikes: 0, userId: []},
      createdAt: new Date().toISOString()
    };

    try {
      setLoading(true);
      await createPost(newPost);
      navigate("/feed"); // retourner à la page feed
    } catch (err) {
      setError("Cannot create post. Check backend server is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="text-xl font-extrabold">Create a Post</div>
      <div className="text-sm text-white/60 mt-1">
        Share a city tip, a photo moment, or a safety alert.
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm">
          <b>Error:</b> {error}
        </div>
      ) : null}

      <form onSubmit={submitPost} className="mt-4 space-y-3"> 
        <div>
          <div className="text-xs text-white/70 mb-1">City</div>
          <select
            className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
          >
            {cities.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
 
        <div>
          <div className="text-xs text-white/70 mb-1">Post Type</div>
          <select
            className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="moment">Moment (photo + caption)</option>
            <option value="guide">Guide (structured tips)</option>
            <option value="alert">Safety Alert</option>
          </select>

          <div className="text-[11px] text-white/60 mt-1">
            Tip: “alert” posts will look more serious in the feed.
          </div>
        </div>

        <div>
          <div className="text-xs text-white/70 mb-1">Title</div>
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Example: Sunset at Jemaa el-Fnaa 🌅"
          />
        </div>

        <div>
          <div className="text-xs text-white/70 mb-1">Text</div>
          <textarea
            className="w-full min-h-[120px] rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your experience or tips..."
          />
          <div className="text-[11px] text-white/60 mt-1">
            If you want it structured, write like: Top picks / Local tip / Safety.
          </div>
        </div>

        <div>
          <div className="text-xs text-white/70 mb-1">Image (optional)</div>
          <input
            type="file"
            accept="image/*"
            className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              setError("");
              setLoading(true);
              try {
                const res = await uploadPostImage(file);
                setImage(res.data.url);
              } catch (err) {
                setError("Image upload failed");
              } finally {
                setLoading(false);
              }
            }}
          />
          {image && (
            <div className="mt-2">
              <img src={image} alt="preview" className="max-h-32" />
            </div>
          )}
          <div className="text-[11px] text-white/60 mt-1">
            Select a file to upload; it will be stored on the server.
          </div>
        </div>

        <div>
          <div className="text-xs text-white/70 mb-1">Tags (comma separated)</div>
          <input
            className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="food, sunset, tips"
          />
        </div>
 
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className={[
              "rounded-2xl px-4 py-3 text-sm font-extrabold",
              loading
                ? "bg-emerald-500/40 text-white/70 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950",
            ].join(" ")}
          >
            {loading ? "Posting..." : "Post"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/feed")}
            className="rounded-2xl px-4 py-3 text-sm font-extrabold border border-white/10 bg-white/5 hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
