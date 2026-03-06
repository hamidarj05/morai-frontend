import { useEffect, useState } from "react";
import { createCity, deleteCity, getCities } from "../../api/jsonApi";

export default function ManageCities() {
  const [cities, setCities] = useState([]);
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);

  function loadCities() {
    setLoading(true);
    getCities()
      .then((res) => setCities(res.data || []))
      .catch(() => setCities([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCities();
  }, []);

  async function addCity(e) {
    e.preventDefault();
    if (!name.trim()) return;

    const newCity = {
      name: name.trim(),
      region: region.trim()
    };

    try {
      setLoading(true);
      await createCity(newCity);
      setName("");
      setRegion("");
      loadCities();
    } catch (e2) {
      alert("Error: cannot add city (check backend)");
      setLoading(false);
    }
  }

  async function removeCity(id) {
    const ok = window.confirm("Delete this city?");
    if (!ok) return;

    try {
      setLoading(true);
      await deleteCity(id);
      loadCities();
    } catch (e2) {
      alert("Error: cannot delete city (backend may not support DELETE yet)");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xl font-extrabold">Manage Cities</div>
          <div className="text-sm text-white/60">Add / delete cities</div>
        </div>

        <button
          onClick={loadCities}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
        >
          Refresh
        </button>
      </div>

      {/* Ajouter une ville */}
      <form
        onSubmit={addCity}
        className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4"
      >
        <div className="font-bold mb-2">Add City</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
            placeholder="City name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
            placeholder="Region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
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

      {/* Tableau des villes lieer à la platform */}
      <div className="mt-4 overflow-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/60 text-white/80">
            <tr> 
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Region</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((c) => (
              <tr key={c.id} className="border-t border-white/10"> 
                <td className="p-3 font-bold">{c.name}</td>
                <td className="p-3 text-white/70">{c.region || "-"}</td>
                <td className="p-3">
                  <button
                    onClick={() => removeCity(c.id)}
                    className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm hover:bg-red-500/15"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && cities.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-white/60">
                  No cities yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
