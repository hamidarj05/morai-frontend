import React, { useEffect, useState } from "react";
import { createSpot, deleteSpot, getCities, getSpots } from "../../api/jsonApi";

export default function ManageSpots() {
  const [cities, setCities] = useState([]);
  const [spots, setSpots] = useState([]);

  const [cityFilter, setCityFilter] = useState("all");

  const [cityId, setCityId] = useState("");
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [type, setType] = useState("landmark");
  const [tip, setTip] = useState("");
  const [durationMin, setDurationMin] = useState(60);

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

  function loadSpots(filterId) {
    setLoading(true);

    getSpots()
      .then((res) => {
        let arr = res.data || [];
        // Filtrer côté client si un filtre est appliqué
        if (filterId && filterId !== "all") {
          arr = arr.filter(spot => {
            const spotCityIdStr = typeof spot.cityId === "object" 
              ? String(spot.cityId?._id || spot.cityId?.id) 
              : String(spot.cityId);
            return spotCityIdStr === String(filterId);
          });
        }
        setSpots(arr);
      })
      .catch(() => setSpots([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCities().then(() => loadSpots("all"));
  }, []);

  useEffect(() => {
    loadSpots(cityFilter);
  }, [cityFilter]);

  async function addSpot(e) {
    e.preventDefault();
    if (!cityId || !name.trim()) return;

    const newSpot = {
      // send string ObjectId (backend expects this), not a number
      cityId: String(cityId),
      name: name.trim(),
      area: area.trim(),
      type,
      tip: tip.trim(),
      durationMin: Number(durationMin) || 60
    };

    try {
      setLoading(true);
      await createSpot(newSpot);
      setName("");
      setArea("");
      setTip("");
      setDurationMin(60);
      loadSpots(cityFilter);
    } catch (e2) {
      alert("Error: cannot add spot , try again later");
      setLoading(false);
    }
  }

  async function removeSpot(id) {
    const ok = window.confirm("Delete this spot?");
    if (!ok) return;

    try {
      setLoading(true);
      await deleteSpot(id);
      loadSpots(cityFilter);
    } catch (e2) {
      alert("Error: cannot delete spot , try again later");
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
          <div className="text-xl font-extrabold">Manage Spots</div>
          <div className="text-sm text-white/60">Add / delete city places</div>
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

      {/* formulaire d'ajout d'un spot */}
      <form
        onSubmit={addSpot}
        className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4"
      >
        <div className="font-bold mb-2">Add Spot</div>

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

          <select
            className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="landmark">landmark</option>
            <option value="medina">medina</option>
            <option value="museum">museum</option>
            <option value="garden">garden</option>
            <option value="beach">beach</option>
            <option value="market">market</option>
            <option value="viewpoint">viewpoint</option>
          </select>

          <input
            className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
            placeholder="Spot name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
            placeholder="Area "
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 mt-3">
          <input
            className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
            placeholder="Tip "
            value={tip}
            onChange={(e) => setTip(e.target.value)}
          />
          <input
            type="number"
            className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
            placeholder="Duration min"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
          />
        </div>

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

      {/* tableau des spots */}
      <div className="mt-4 overflow-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/60 text-white/80">
            <tr> 
              <th className="text-left p-3">City</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Tip</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {spots.map((s) => (
              <tr key={s.id} className="border-t border-white/10"> 
                <td className="p-3 text-white/80">{cityNameById(s.cityId)}</td>
                <td className="p-3 font-bold">{s.name}</td>
                <td className="p-3 text-white/70">{s.type}</td>
                <td className="p-3 text-white/70">{s.tip || "-"}</td>
                <td className="p-3">
                  <button
                    onClick={() => removeSpot(s.id)}
                    className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm hover:bg-red-500/15"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && spots.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-white/60">
                  No spots found for this filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
