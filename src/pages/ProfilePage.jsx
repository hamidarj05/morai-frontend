import { useNavigate } from "react-router-dom";
import { logout } from "../auth/authService";



export default function ProfilePage() {
  const navigate = useNavigate()
  const user = localStorage.getItem("currentUser"); 
  const userData = user ? JSON.parse(user) : null;
  const isAdmin = user ? JSON.parse(user).role === "admin" : false;
  
  if (!userData) {
    return (
      <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm">
        <b>Error:</b> No user data found. Please login again.
      </div>
    );
  }
  
  function go(path) {
    navigate(path)
  }
  
  function doLogout() {
    logout();
    navigate("/login");
  }
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-xl font-extrabold">Profile</div>
          <div className="text-sm text-white/60">
            Manage your personal information
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 max-w-xl">
        <div className="mb-4">
          <div className="text-lg font-extrabold">
            Hello {userData.name}
          </div>
          <div className="text-xs text-white/60 mt-1">
            {userData.role === "admin" ? "Admin" : "User"}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-sm">
            <div className="text-xs text-white/60">Email</div>
            <div className="font-bold break-all">{userData.email}</div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3 text-sm">
            <div className="text-xs text-white/60">Member since</div>
            <div className="font-bold">
              {userData.createdAt
                ? new Date(userData.createdAt).toLocaleDateString()
                : "—"}
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-white/10 pt-4">
          <div className="text-xs font-bold text-white/70 mb-3">ACTIONS</div>
          <div className="flex gap-2 flex-wrap">
            {isAdmin && (
              <button
                onClick={() => go("/admin")}
                className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm hover:bg-emerald-500/20 text-emerald-200"
              >
                Admin Panel
              </button>
            )}
            <button
              onClick={() => go("/feed")}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              Feed
            </button>
            <button
              onClick={() => go("/userPosts")}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
            >
              My Posts
            </button>
            <button
              onClick={doLogout}
              className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm hover:bg-red-500/20 text-red-200"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/40 p-3">
          <div className="text-xs font-bold text-white/70 mb-2">COMING SOON</div>
          <div className="text-xs text-white/60 space-y-1">
            <p>• Edit profile information</p> 
            <p>• Account settings</p>
          </div>
        </div>
      </div>
    </div>
  );
}
