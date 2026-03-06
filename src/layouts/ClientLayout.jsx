import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../auth/authService";
import { getCities } from "../api/jsonApi";

import {
  AiFillHome,
  AiOutlinePlusCircle,
  AiOutlineMessage,
  AiOutlineFileText,
  AiOutlineUser,
} from "react-icons/ai";

export default function ClientLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await getCities();
        setCities(res.data || []);
      } catch (err) {
        console.error("Failed to fetch cities:", err);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  // check admin
  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    const parsedUser = user ? JSON.parse(user) : null;
    if (parsedUser?.role === "admin") {
      setIsAdmin(true);
    }
  }, []);

  function go(path) {
    navigate(path);
  }

  function doLogout() {
    logout();
    navigate("/login");
  }

  function isActive(path) {
    return (
      location.pathname === path ||
      location.pathname.startsWith(path + "/")
    );
  }

  // wait until cities loaded
  if (loadingCities) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  const firstCityId = cities?.[0]?.id;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl p-0 sm:p-4">
        <div className="rounded-none sm:rounded-2xl border-0 sm:border border-white/10 bg-slate-900/40 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/60 p-4">
            <div>
              <div className="font-extrabold text-lg">MorAI Guide</div>
              <div className="text-xs text-white/70">Morocco AI Guide</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-[260px_1fr] min-h-[85vh]">
            <div className="hidden sm:block border-r border-white/10 bg-slate-900/60 p-3">
              <nav className="space-y-2">
                <button
                  onClick={() => go("/feed")}
                  className="w-full text-left flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
                >
                  Feed
                </button>

                <button
                  onClick={() => go("/create")}
                  className="w-full text-left flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
                >
                  Create Post
                </button>

                <button
                  onClick={() => firstCityId && go("/chat/" + firstCityId)}
                  className="w-full text-left flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
                >
                  AI Guide
                </button>

                <button
                  onClick={() => go("/userPosts")}
                  className="w-full text-left flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
                >
                  My Posts
                </button>

                <button
                  onClick={() => go("/profile")}
                  className="w-full text-left flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
                >
                  Profile
                </button>

                <div className="pt-2 mt-2 border-t border-white/10" />

                {isAdmin && (
                  <button
                    onClick={() => go("/admin")}
                    className="w-full text-left flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
                  >
                    Admin Panel
                  </button>
                )}

                <button
                  className="w-full text-left flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
                  onClick={doLogout}
                >
                  Logout
                </button>
              </nav>
            </div>

            <div className="p-4 pb-24 sm:pb-4 overflow-auto h-screen flex flex-col">
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t border-white/10 bg-slate-950/90 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-5">
          <button
            onClick={() => go("/feed")}
            className={
              "py-2 flex flex-col items-center gap-1 " +
              (isActive("/feed") ? "text-white" : "text-white/60")
            }
          >
            <AiFillHome className="text-2xl" />
            <span className="text-[11px]">Feed</span>
          </button>

          <button
            onClick={() => go("/create")}
            className={
              "py-2 flex flex-col items-center gap-1 " +
              (isActive("/create") ? "text-white" : "text-white/60")
            }
          >
            <AiOutlinePlusCircle className="text-2xl" />
            <span className="text-[11px]">Create</span>
          </button>

          <button
            onClick={() => firstCityId && go("/chat/" + firstCityId)}
            className={
              "py-2 flex flex-col items-center gap-1 " +
              (isActive("/chat") ? "text-white" : "text-white/60")
            }
          >
            <AiOutlineMessage className="text-2xl" />
            <span className="text-[11px]">AI</span>
          </button>

          <button
            onClick={() => go("/userPosts")}
            className={
              "py-2 flex flex-col items-center gap-1 " +
              (isActive("/userPosts") ? "text-white" : "text-white/60")
            }
          >
            <AiOutlineFileText className="text-2xl" />
            <span className="text-[11px]">Posts</span>
          </button>

          <button
            onClick={() => go("/profile")}
            className={
              "py-2 flex flex-col items-center gap-1 " +
              (isActive("/profile") ? "text-white" : "text-white/60")
            }
          >
            <AiOutlineUser className="text-2xl" />
            <span className="text-[11px]">Profil</span>
          </button>
        </div>
      </div>
    </div>
  );
}