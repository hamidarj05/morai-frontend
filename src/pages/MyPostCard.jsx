import { useState , useEffect } from "react";
import { deletePost, updatePost, uploadPostImage } from "../api/jsonApi";
import { deleteComment, getComments } from "../api/jsonApi";


export default function MyPostCard({ post, cityName, onChanged }) {
    const [open, setOpen] = useState(false);

    const [comments, setComments] = useState([]);
    const [title, setTitle] = useState(post.title || "");
    const [text, setText] = useState(post.text || "");
    const [image, setImage] = useState(post.image || "");
    const [type, setType] = useState(post.type || "moment");
 
 

    const [saving, setSaving] = useState(false);
    
    useEffect(()=>{
        getComments()
        .then((res)=>setComments(res.data || []))
        .catch(()=>setComments([]))
    },[])

    async function remove() {
        const ok = window.confirm("Delete this post?");
        if (!ok) return;

        try {
            for(let i=0 ; i<comments.length ; i++){
                if(comments[i].postId === post.id){
                    await deleteComment(comments[i].id);
                }
            }
            await deletePost(post.id); 
            onChanged();
        } catch (e) {
            alert("Delete failed. Try Later again.");
            console.log(e);
        }
    }

    async function save() {
        if (!title.trim() || !text.trim()) {
            alert("Title and text are required.");
            return;
        }

        setSaving(true);
        try {
            await updatePost(post.id, {
                title: title.trim(),
                text: text.trim(),
                image: image.trim(),
                type,
                updatedAt: new Date().toISOString(),
            });
            setOpen(false);
            onChanged();
        } catch (e) {
            alert("Update failed. Backend may not support PATCH yet.");
        }
        setSaving(false);
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            {post.image ? (
                <img src={post.image} alt={post.title} className="h-44 w-full object-cover" />
            ) : (
                <div className="h-44 w-full bg-slate-800 flex items-center justify-center text-white/60">
                    No image
                </div>
            )}

            <div className="p-4">
                <div className="text-xs text-white/70">📍 {cityName} • {post.type}</div>
                <div className="mt-2 text-lg font-extrabold">{post.title}</div>
                <div className="mt-2 text-sm text-white/80 whitespace-pre-wrap">
                    {post.text}
                </div>

                <div className="mt-4 flex gap-2"> 
                    <button
                        onClick={() => setOpen(true)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                    >
                        Update
                    </button>

                    <button
                        onClick={remove}
                        className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm hover:bg-red-500/20"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Pop up pour update le post */}
            {open ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setOpen(false)}
                    />
                    <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-slate-950 p-4">
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <div className="text-lg font-extrabold">Update Post</div>
                                <div className="text-xs text-white/60">📍 {cityName}</div>
                            </div>

                            <button
                                onClick={() => setOpen(false)}
                                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                            >
                                ✖
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div>
                                <div className="text-xs text-white/60 mb-1">Type</div>
                                <select
                                    className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <option value="moment">moment</option>
                                    <option value="guide">guide</option>
                                    <option value="alert">alert</option>
                                </select>
                            </div>

                            <div>
                                <div className="text-xs text-white/60 mb-1">Title</div>
                                <input
                                    className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div>
                                <div className="text-xs text-white/60 mb-1">Text</div>
                                <textarea
                                    className="w-full min-h-[120px] rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                />
                            </div>

                            <div>
                                <div className="text-xs text-white/60 mb-1">Image </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        try {
                                            setSaving(true);
                                            const res = await uploadPostImage(file);
                                            setImage(res.data.url);
                                        } catch (err) {
                                            alert('Image upload failed');
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                />
                                {image && (
                                    <div className="mt-2">
                                        <img src={image} alt="preview" className="max-h-24" />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 justify-end pt-2">
                                <button
                                    onClick={() => setOpen(false)}
                                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={save}
                                    disabled={saving}
                                    className={[
                                        "rounded-xl px-3 py-2 text-sm font-bold",
                                        saving
                                            ? "bg-emerald-500/40 text-white/70"
                                            : "bg-emerald-500 hover:bg-emerald-400 text-slate-950",
                                    ].join(" ")}
                                >
                                    {saving ? "Saving..." : "Save"}
                                </button>
                            </div> 
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
