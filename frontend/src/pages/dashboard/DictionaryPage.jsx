import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import PremiumModal from "../../components/PremiumModal";

export default function DictionaryPage() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errSuggestions, setErrSuggestions] = useState([]);
  const [favMsg, setFavMsg] = useState("");
  const [dna, setDna] = useState(null);
  const [loadingDna, setLoadingDna] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [urdu, setUrdu] = useState(null);
  const [loadingUrdu, setLoadingUrdu] = useState(false);
  const { isPremium } = useAuth();
  const debounceRef = useRef(null);

  useEffect(() => {
    const q = params.get("q");
    if (q) { setQuery(q); doSearch(q); }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await axios.get("/api/dictionary/search/suggestions?q=" + encodeURIComponent(query));
        setSuggestions(data || []);
        setShowSug(true);
      } catch {}
    }, 280);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const doSearch = useCallback(async (w) => {
    const word = (w || query).trim().toLowerCase();
    if (!word) return;
    setError(""); setResult(null); setDna(null); setUrdu(null);
    setLoading(true); setShowSug(false); setSuggestions([]); setErrSuggestions([]);
    try {
      const { data } = await axios.get("/api/dictionary/" + encodeURIComponent(word));
      setResult(data);
    } catch (err) {
      const msg = err?.response?.data?.message || `"${word}" not found`;
      const sugg = err?.response?.data?.suggestions || [];
      setError(msg);
      setErrSuggestions(sugg);
    } finally { setLoading(false); }
  }, [query]);

  const speak = (word) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.rate = 0.85; u.lang = "en-US";
    window.speechSynthesis.speak(u);
  };

  const addFav = async () => {
    if (!result?.data?.word_id) return;
    try {
      await axios.post("/api/favorites", { word_id: result.data.word_id });
      setFavMsg("Added to favorites ⭐");
    } catch (err) { setFavMsg(err?.response?.data?.message || "Error"); }
    setTimeout(() => setFavMsg(""), 2500);
  };

  const loadDNA = async () => {
    if (!isPremium) { setShowPremiumModal(true); return; }
    if (!result) return;
    setLoadingDna(true); setDna(null);
    try {
      const def = result.data.meanings?.[0]?.definition || "";
      const { data } = await axios.post("/api/ai/word-dna", { word: result.data.word, definition: def });
      setDna(data.dna);
    } catch { setDna({ error: "AI feature unavailable. Check API key in settings." }); }
    setLoadingDna(false);
  };

  const loadUrdu = async () => {
    if (!result) return;
    setLoadingUrdu(true); setUrdu(null);
    try {
      const { data } = await axios.get("/api/dictionary/urdu/" + encodeURIComponent(result.data.word));
      setUrdu(data);
    } catch { setUrdu({ success: false }); }
    setLoadingUrdu(false);
  };

  const posColors = { noun:"var(--primary)", verb:"var(--accent)", adjective:"var(--cyan)", adverb:"var(--yellow)", general:"var(--green)" };
  const getC = (pos = "general") => posColors[pos.toLowerCase()] || "var(--green)";

  return (
    <div style={S.wrap} className="fade-in">
      {showPremiumModal && <PremiumModal onClose={() => setShowPremiumModal(false)} />}

      <h1 style={S.title}>Dictionary</h1>
      <p style={S.sub}>Search any English word — meanings, examples, synonyms & Urdu translation</p>

      {/* Search Bar */}
      <div style={S.searchBox}>
        <div style={S.inputRow}>
          <span style={{ color:"var(--primary)", fontSize:18, flexShrink:0 }}>◈</span>
          <input style={{ flex:1, background:"transparent", border:"none", color:"var(--text)", fontSize:"1rem", padding:"6px 0" }}
            value={query} placeholder="Type any English word…"
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && doSearch()}
            onFocus={() => suggestions.length > 0 && setShowSug(true)} />
          {query && (
            <button onClick={() => { setQuery(""); setResult(null); setError(""); setDna(null); setUrdu(null); setSuggestions([]); }}
              style={{ background:"transparent", border:"none", color:"var(--text3)", fontSize:14, padding:"4px 8px", cursor:"pointer" }}>✕</button>
          )}
          <button className="btn-primary" onClick={() => doSearch()} disabled={loading}
            style={{ borderRadius:10, padding:"9px 22px", flexShrink:0 }}>
            {loading ? "…" : "Search"}
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSug && suggestions.length > 0 && (
          <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, background:"var(--card2)", border:"1px solid var(--border2)", borderRadius:12, overflow:"hidden", zIndex:100, boxShadow:"var(--shadow)" }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => { setQuery(s); setShowSug(false); doSearch(s); }}
                style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"10px 16px", background:"transparent", border:"none", color:"var(--text2)", fontSize:".92rem", cursor:"pointer", textAlign:"left" }}>
                <span style={{ color:"var(--primary)", fontSize:13 }}>◈</span> {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[40, 24, 80].map((h, i) => (
            <div key={i} className="shimmer" style={{ height:h, borderRadius:8, width: i===0?"30%":i===1?"55%":"100%" }} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{ background:"rgba(251,113,133,0.08)", border:"1px solid rgba(251,113,133,0.22)", borderRadius:14, padding:"20px 24px" }}>
          <div style={{ color:"#fb7185", fontWeight:600, marginBottom:6 }}>⚠ {error}</div>
          <p style={{ color:"var(--text3)", fontSize:".87rem", marginBottom: errSuggestions.length ? 12 : 0 }}>Check spelling or try a different word.</p>
          {errSuggestions.length > 0 && (
            <div>
              <p style={{ color:"var(--text3)", fontSize:".82rem", marginBottom:8 }}>Did you mean:</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {errSuggestions.map(s => (
                  <button key={s} onClick={() => { setQuery(s); doSearch(s); }}
                    style={{ background:"var(--card2)", border:"1px solid var(--border)", borderRadius:20, padding:"5px 14px", color:"var(--primary2)", fontSize:".85rem", cursor:"pointer" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Favorite Toast */}
      {favMsg && (
        <div style={{ position:"fixed", bottom:24, right:24, background:"var(--card2)", border:"1px solid rgba(124,111,247,0.4)", borderRadius:12, padding:"12px 20px", color:"var(--primary2)", fontWeight:600, zIndex:999, boxShadow:"var(--shadow)" }}>
          {favMsg}
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div style={{ display:"flex", flexDirection:"column", gap:20 }} className="fade-in">

          {/* Word Header */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"2.6rem", fontWeight:800, color:"var(--text)" }}>
                  {result.data.word}
                </h2>
                <button onClick={() => speak(result.data.word)}
                  style={{ background:"var(--card2)", border:"1px solid var(--border2)", borderRadius:10, padding:"7px 12px", color:"var(--text2)", fontSize:".85rem", cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                  🔊 Listen
                </button>
              </div>
              <span style={{ padding:"3px 12px", borderRadius:20, background:"var(--card2)", color:"var(--text3)", fontSize:".75rem", fontWeight:500, display:"inline-block", marginTop:8 }}>
                {result.source === "database" ? "📚 From Library" : "🌐 From Web"}
              </span>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", flexShrink:0 }}>
              <button onClick={addFav}
                style={{ background:"rgba(244,114,182,0.1)", border:"1px solid rgba(244,114,182,0.25)", color:"var(--accent)", borderRadius:10, padding:"9px 16px", fontSize:".85rem", fontWeight:600, cursor:"pointer" }}>
                ♡ Save
              </button>
              <button onClick={loadUrdu} disabled={loadingUrdu}
                style={{ background:"rgba(34,211,238,0.1)", border:"1px solid rgba(34,211,238,0.25)", color:"var(--cyan)", borderRadius:10, padding:"9px 16px", fontSize:".85rem", fontWeight:600, cursor:"pointer" }}>
                {loadingUrdu ? "…" : "🇵🇰 Urdu"}
              </button>
              <button onClick={loadDNA} disabled={loadingDna}
                style={{ background:"rgba(124,111,247,0.12)", border:"1px solid rgba(124,111,247,0.3)", color:"var(--primary2)", borderRadius:10, padding:"9px 16px", fontSize:".85rem", fontWeight:600, cursor:"pointer" }}>
                {!isPremium ? "🔒 Word DNA" : loadingDna ? "🧬 …" : "🧬 Word DNA"}
              </button>
            </div>
          </div>

          {/* Urdu Meaning Panel */}
          {urdu && (
            <div style={{ background:"linear-gradient(135deg,rgba(34,211,238,0.08),rgba(124,111,247,0.06))", border:"1px solid rgba(34,211,238,0.2)", borderRadius:14, padding:"18px 20px" }} className="fade-in">
              <div style={{ fontSize:".72rem", fontWeight:700, letterSpacing:1.2, textTransform:"uppercase", color:"var(--cyan)", marginBottom:8 }}>🇵🇰 Urdu Translation</div>
              {urdu.success && urdu.urdu ? (
                <div style={{ fontSize:"1.6rem", color:"var(--text)", fontWeight:600, direction:"rtl", textAlign:"right", lineHeight:1.8 }}>
                  {urdu.urdu}
                </div>
              ) : (
                <p style={{ color:"var(--text3)", fontSize:".87rem" }}>Urdu translation not available for this word.</p>
              )}
            </div>
          )}

          {/* Word DNA Panel */}
          {dna && (
            <div style={{ background:"linear-gradient(135deg,rgba(124,111,247,0.08),rgba(34,211,238,0.06))", border:"1px solid rgba(124,111,247,0.2)", borderRadius:16, padding:"20px" }} className="slide-up">
              <div style={{ fontSize:".75rem", fontWeight:700, letterSpacing:1.2, textTransform:"uppercase", color:"var(--primary2)", marginBottom:14 }}>🧬 Word DNA</div>
              {dna.error ? (
                <p style={{ color:"var(--text3)", fontSize:".87rem" }}>{dna.error}</p>
              ) : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12 }}>
                  {[
                    { label:"Origin",      val:dna.origin,       icon:"🌱" },
                    { label:"Difficulty",  val:dna.difficulty,   icon:"📊" },
                    { label:"Emotion",     val:dna.emotion,      icon:"💭" },
                    { label:"Usage",       val:dna.usageContext, icon:"📝" },
                    { label:"Fun Fact",    val:dna.funFact,      icon:"⚡", full:true },
                    { label:"Related",     val:dna.relatedWords?.join(", "), icon:"🔗" },
                  ].filter(i => i.val).map(item => (
                    <div key={item.label} style={{ background:"var(--card)", borderRadius:10, padding:"12px 14px", gridColumn:item.full?"1/-1":"auto" }}>
                      <div style={{ fontSize:".7rem", fontWeight:600, color:"var(--text3)", letterSpacing:.8, textTransform:"uppercase", marginBottom:5 }}>{item.icon} {item.label}</div>
                      <div style={{ color:"var(--text2)", fontSize:".87rem", lineHeight:1.5 }}>{item.val}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Meanings */}
          {result.data.meanings?.length > 0 && (
            <Sec title="Meanings" icon="◈">
              {result.data.meanings.map((m, i) => (
                <div key={i} style={{ background:"var(--card2)", border:"1px solid var(--border)", borderRadius:14, padding:"16px 18px", marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                    <span style={{ padding:"3px 11px", borderRadius:20, fontSize:".72rem", fontWeight:700, textTransform:"uppercase", letterSpacing:.5, color:getC(m.part_of_speech), background:getC(m.part_of_speech)+"22" }}>
                      {m.part_of_speech}
                    </span>
                    <span style={{ color:"var(--border2)", fontSize:".75rem", fontWeight:600 }}>#{i+1}</span>
                  </div>
                  <p style={{ color:"var(--text2)", lineHeight:1.7, fontSize:".96rem" }}>{m.definition}</p>
                  {m.examples?.length > 0 && (
                    <div style={{ marginTop:10, borderLeft:"2px solid rgba(124,111,247,0.35)", paddingLeft:14 }}>
                      {m.examples.slice(0,2).map((ex,j) => (
                        <p key={j} style={{ color:"var(--text3)", fontSize:".87rem", fontStyle:"italic", lineHeight:1.6 }}>"{ex}"</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </Sec>
          )}

          {/* Synonyms */}
          {result.data.synonyms?.length > 0 && (
            <Sec title="Synonyms" icon="↔">
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {result.data.synonyms.slice(0,14).map(s => (
                  <button key={s} onClick={() => { setQuery(s); doSearch(s); }}
                    style={{ background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.2)", color:"var(--green)", borderRadius:20, padding:"6px 14px", fontSize:".85rem", cursor:"pointer" }}>
                    {s}
                  </button>
                ))}
              </div>
            </Sec>
          )}

          {/* Antonyms */}
          {result.data.antonyms?.length > 0 && (
            <Sec title="Antonyms" icon="⟺">
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {result.data.antonyms.slice(0,14).map(a => (
                  <button key={a} onClick={() => { setQuery(a); doSearch(a); }}
                    style={{ background:"rgba(244,114,182,0.1)", border:"1px solid rgba(244,114,182,0.2)", color:"var(--accent)", borderRadius:20, padding:"6px 14px", fontSize:".85rem", cursor:"pointer" }}>
                    {a}
                  </button>
                ))}
              </div>
            </Sec>
          )}
        </div>
      )}
    </div>
  );
}

function Sec({ title, icon, children }) {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:12 }}>
        <span style={{ color:"var(--primary)", fontSize:15 }}>{icon}</span>
        <span style={{ fontSize:".78rem", fontWeight:700, letterSpacing:1.2, textTransform:"uppercase", color:"var(--text3)" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

const S = {
  wrap:{ display:"flex", flexDirection:"column", gap:20, maxWidth:800, margin:"0 auto" },
  title:{ fontFamily:"'Playfair Display',serif", fontSize:"2rem", fontWeight:800, color:"var(--text)" },
  sub:{ color:"var(--text3)", fontSize:".9rem", marginTop:-14 },
  searchBox:{ position:"relative", background:"var(--card)", border:"1px solid var(--border2)", borderRadius:15, overflow:"visible" },
  inputRow:{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px 9px 16px" },
};
