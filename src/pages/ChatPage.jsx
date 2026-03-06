import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { askGemini } from "../api/geminiApi";
import { getCities, getScamsByCity, getSpotsByCity, getChatsAi, addChatAiMessage, deleteChatAiMessage } from "../api/jsonApi";

export default function ChatPage() {
  const navigate = useNavigate();
  const { cityId } = useParams();

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const userId = currentUser.id;

  const [cities, setCities] = useState([]);
  const [spots, setSpots] = useState([]);
  const [scams, setScams] = useState([]);

  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);

  // scroll down
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // charger les villes + contexte de la ville
  useEffect(() => {
    setError("");

    getCities()
      .then((res) => setCities(res.data || []))
      .catch(() => setCities([]));

    getSpotsByCity(cityId)
      .then((res) => setSpots(res.data || []))
      .catch(() => setSpots([]));

    getScamsByCity(cityId)
      .then((res) => setScams(res.data || []))
      .catch(() => setScams([]));
  }, [cityId]);

  // charger les messages de chat de db.json (par utilisateur + par ville)
  useEffect(() => {
    if (!userId) {
      setMessages([]);
      return;
    }

    setError("");
    getChatsAi(cityId)
      .then((res) => setMessages(res.data || []))
      .catch(() => setMessages([])); 
  }, [cityId, userId]);

  // nom de la ville
  let cityName = "Morocco";
  for (let i = 0; i < cities.length; i++) {
    if (String(cities[i].id) === String(cityId)) {
      cityName = cities[i].name;
      break;
    }
  }

  // detect arabic
  function isArabic(text) {
    return /[\u0600-\u06FF]/.test(text);
  }

  function buildPrompt(userText) {
    const topSpots = spots.slice(0, 10).map((s) => ({
      name: s.name,
      area: s.area,
      type: s.type,
      tip: s.tip,
    }));

    const topScams = scams.slice(0, 6).map((s) => ({
      title: s.title,
      avoid: s.avoid,
    }));

    const allowedCities = cities.map((c) => c.name);
    const lang = isArabic(userText) ? "Arabic" : "English";

    const prompt =
      `You are a friendly Moroccan local guide chatting on WhatsApp.\n` +
      `Your tone is natural, helpful, and concise.\n` +
      `Language: ${lang}\n\n` +
      `STRICT RULES:\n` +
      `- Talk ONLY about the city: ${cityName}\n` +
      `- Cities allowed in this app: ${allowedCities.join(", ")}\n` +
      `- If the user asks about another city, reply exactly: "This city is not available in the app yet."\n` +
      `- NEVER invent place names.\n` +
      `- Use ONLY the places from SPOTS when mentioning locations.\n` +
      `- You MAY talk about food, plans, tips, or activities, but ONLY if they are clearly related to ${cityName}.\n\n` +
      `ANSWER STYLE (VERY IMPORTANT):\n` +
      `- for the name of user use this name ${currentUser.name}\n` +
      `- Maximum 8 short lines (not more).\n` +
      `- Use emojis if needed.\n` +
      `- Prefer bullet points (•) when listing.\n` +
      `- No long paragraphs.\n` +
      `- Clear, simple sentences.\n` +
      `- Do NOT use markdown, stars (**), or special formatting.\n\n` +
      `CONTENT STRUCTURE (when relevant):\n` +
      `- 3–5 main suggestions\n` +
      `- 1 local tip\n` +
      `- 1 safety/scam tip if relevant\n\n` +
      `SPOTS:\n${JSON.stringify(topSpots, null, 2)}\n\n` +
      `SCAMS:\n${JSON.stringify(topScams, null, 2)}\n\n` +
      `USER MESSAGE:\n${userText}\n\n` +
      `FINAL RULE:\n` +
      `If the answer risks becoming long, STOP immediately at 8 lines.`;

    return prompt;
  }

  // enregistrer un message dans db.json et mettre à jour l'interface utilisateur
  async function saveMessage(role, text) {
    const msg = {
      cityId: String(cityId),
      role,
      text,
      createdAt: new Date().toISOString(),
    };

    // afficher instantanément
    const tempId = "temp-" + Date.now() + Math.random();
    const optimistic = { ...msg, id: tempId };
    setMessages((old) => [...old, optimistic]);

    try {
      const res = await addChatAiMessage(msg);
      // remplacer temp avec id réel
      setMessages((old) =>
        old.map((m) => (m.id === tempId ? res.data : m))
      );
      return res.data;
    } catch (e) {
      // supprimer temp
      setMessages((old) => old.filter((m) => m.id !== tempId));
      throw e;
    }
  }

  async function send() {
    if (!userId) {
      alert("Please login to chat.");
      return;
    }

    const text = input.trim();
    if (!text || loading) return;

    setError("");
    setInput("");
    setLoading(true);

    try {
      await saveMessage("user", text);

      const prompt = buildPrompt(text);
      const reply = await askGemini(prompt); 

      await saveMessage("assistant", reply);
    } catch (e) {
      setError(String(e.message || e));
      // afficher un message sans enregistrer
      setMessages((old) => [
        ...old,
        {
          id: "local-" + Date.now(),
          role: "assistant",
          text: "Sorry 😅 I can’t reply now. Check API key / internet.",
          createdAt: new Date().toISOString(),
        },
      ]);
    }

    setLoading(false);
  }

  function keyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  async function startChat() {
    if (!userId) {
      alert("Please login to chat.");
      return;
    }

    try {
      await saveMessage(
        "assistant",
        `Salam ${currentUser.name} 😄 I’m your guide for ${cityName}.\n• Best things to do\n• 1-day plan\n• Food to try\n• Safety tip`
      );
    } catch (e) {
      setError("Cannot save start message ");
      console.log(e);
    }
  }

  async function clearChat() {
    if (!userId) return;

    
    // supprimer les messages qui sont déjà enregistrés (pas temp/local)
    const realMessages = messages.filter(
      (m) =>
        m.id &&
        !String(m.id).startsWith("temp-") &&
        !String(m.id).startsWith("local-")
    );

    setMessages([]);

    try {
      await Promise.all(realMessages.map((m) => deleteChatAiMessage(m.id)));
    } catch (e) {
      setError("Some messages could not be deleted.");
    }
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <div className="text-xl font-extrabold flex items-center gap-2 flex-wrap">
            <span>Chat • {cityName}</span>

            <select
              className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
              value={String(cityId)}
              onChange={(e) => navigate(`/chat/${e.target.value}`)}
            >
              {cities.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div> 
        </div>

        <div className="flex gap-2">
          <button
            onClick={startChat}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          >
            Start
          </button>
          <button
            onClick={clearChat}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          >
            Clear
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-3 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm">
          <b>Error:</b> {error}
        </div>
      ) : null}

      <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-3">
        {messages.length === 0 ? (
          <div className="text-white/70">
            No messages yet. Click <b><button onClick={startChat}>Start</button></b>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={[
                    "max-w-[85%] rounded-2xl border px-3 py-2 text-sm",
                    "whitespace-pre-wrap break-words",
                    m.role === "user"
                      ? "bg-emerald-600/30 border-emerald-400/20"
                      : "bg-slate-950/40 border-white/10",
                  ].join(" ")}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading ? (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white/70">
                  Typing...
                </div>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <textarea
          className="flex-1 min-h-[44px] max-h-[120px] resize-y rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={keyDown}
          placeholder={`Ask about ${cityName}...`}
        />
        <button
          onClick={send}
          disabled={loading}
          className={[
            "rounded-2xl px-4 py-3 text-sm font-extrabold",
            loading
              ? "bg-emerald-500/40 text-white/70 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-400 text-slate-950",
          ].join(" ")}
        >
          Send
        </button>
      </div>
    </div>
  );
}
