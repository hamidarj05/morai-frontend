import React, { useEffect, useState } from "react";
import { createScam, deleteScam, getCities, getScams } from "../../api/jsonApi";

export default function ManageScams() {
  const [cities, setCities] = useState([]);
  const [scams, setScams] = useState([]);

  const [cityFilter, setCityFilter] = useState("all");

  const [cityId, setCityId] = useState("");
  const [title, setTitle] = useState("");
  const [avoid, setAvoid] = useState("");

  const [loading, setLoading] = useState(false);

  function loadCities() {
    return getCities()
      .then((res) => {
        const raw = res.data || [];
        const arr = raw.map(c => ({ ...c, id: c._id || c.id }));
        setCities(arr);
        if (arr.length > 0) setCityId(String(arr[0].id));
      })
      .catch(() => setCities([]));
  }

  function loadScams(filterId) {
    setLoading(true);

    getScams()
      .then((res) => {
        let arr = res.data || [];
        // Filtrer côté client si un filtre est appliqué
        if (filterId && filterId !== "all") {
          arr = arr.filter(scam => {
            const scamCityIdStr = typeof scam.cityId === "object" 
              ? String(scam.cityId?._id || scam.cityId?.id) 
              : String(scam.cityId);
            return scamCityIdStr === String(filterId);
          });
        }
        setScams(arr);
      })
      .catch(() => setScams([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCities().then(() => loadScams("all"));
  }, []);

  useEffect(() => {
    loadScams(cityFilter);
  }, [cityFilter]);

  async function addScam(e) {
    e.preventDefault();
    if (!cityId || !title.trim() || !avoid.trim()) return;

    const newScam = {
      cityId: String(cityId),
      title: title.trim(),
      avoid: avoid.trim()
    };

    try {
      setLoading(true);
      await createScam(newScam);
      setTitle("");
      setAvoid("");
      loadScams(cityFilter);
    } catch (e2) {
      alert("Error: cannot add scam (check backend)");
      setLoading(false);
    }
  }

  async function removeScam(id) {
    const ok = window.confirm("Delete this scam?");
    if (!ok) return;

    try {
      setLoading(true);
      await deleteScam(id);
      loadScams(cityFilter);
    } catch (e2) {
      alert("Error: cannot delete scam (backend may not support DELETE yet)");
      setLoading(false);
    }
  }

  function cityNameById(id) {
    // Gérer cityId comme objet ou string
    const idStr = typeof id === "object" ? String(id?._id || id?.id) : String(id);
    const c = cities.find((x) => String(x.id) === idStr);
    return c ? c.name : "Unknown";
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xl font-extrabold">Manage Scams</div>
          <div className="text-sm text-white/60">Add / delete safety warnings</div>
        </div>

        <select
          className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
        >
          <option value="all">All cities</option>
          {cities.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* formulaire d'ajout d'une fraude */}
      <form
        onSubmit={addScam}
        className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4"
      >
        <div className="font-bold mb-2">Add Scam</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <select
            className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
          >
            {cities.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
            placeholder="Scam title (ex: Fake guides)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <textarea
          className="mt-3 w-full min-h-[90px] rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
          placeholder="How to avoid it..."
          value={avoid}
          onChange={(e) => setAvoid(e.target.value)}
        />

        <button
          disabled={loading}
          className={[
            "mt-3 rounded-2xl px-4 py-3 text-sm font-extrabold",
            loading
              ? "bg-emerald-500/40 text-white/70"
              : "bg-emerald-500 hover:bg-emerald-400 text-slate-950",
          ].join(" ")}
        >
          Add
        </button>
      </form>

      {/* tableau des fraudes */}
      <div className="mt-4 overflow-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/60 text-white/80">
            <tr> 
              <th className="text-left p-3">City</th>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Avoid</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {scams.map((s) => (
              <tr key={s.id} className="border-t border-white/10"> 
                <td className="p-3 text-white/80">{cityNameById(s.cityId)}</td>
                <td className="p-3 font-bold">{s.title}</td>
                <td className="p-3 text-white/70">{s.avoid}</td>
                <td className="p-3">
                  <button
                    onClick={() => removeScam(s.id)}
                    className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm hover:bg-red-500/15"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && scams.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-white/60">
                  No scams found for this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
