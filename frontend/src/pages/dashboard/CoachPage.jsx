import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import PremiumModal from "../../components/PremiumModal";

const LEVELS = [
  { key:"kid",    label:"👶 Like I'm 5",    desc:"Super simple & fun" },
  { key:"simple", label:"🧒 For Beginners",  desc:"Easy, clear explanation" },
  { key:"expert", label:"🎓 Expert Level",   desc:"Deep academic insight" },
];

const FREE_LIMIT = 5;

export default function CoachPage() {
  const { isPremium } = useAuth();
  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [level, setLevel] = useState("simple");
  const [explanation, setExplanation] = useState("");
  const [quizData, setQuizData] = useState(null);
  const [quizSelected, setQuizSelected] = useState(null);
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPremium, setShowPremium] = useState(false);
  const [cacheInfo, setCacheInfo] = useState("");
  const [usage, setUsage] = useState(null); // { usedToday, remaining, limit, isPremium }

  // Load today's usage on mount
  useEffect(() => {
    axios.get("/api/ai/usage")
      .then(r => setUsage(r.data))
      .catch(() => {});
  }, []);

  const refreshUsage = async () => {
    try {
      const r = await axios.get("/api/ai/usage");
      setUsage(r.data);
    } catch {}
  };

  const lookup = async () => {
    if (!word.trim()) return;
    setLookupLoading(true); setError(""); setExplanation(""); setQuizData(null); setQuizSelected(null); setDefinition(""); setCacheInfo("");
    try {
      const { data } = await axios.get("/api/dictionary/" + encodeURIComponent(word.trim().toLowerCase()));
      setDefinition(data?.data?.meanings?.[0]?.definition || "");
    } catch { setDefinition(""); }
    setLookupLoading(false);
  };

  const explain = async () => {
    if (!word.trim()) return;
    setLoadingExplain(true); setError(""); setExplanation(""); setCacheInfo("");
    try {
      const { data } = await axios.post("/api/ai/explain", { word: word.trim(), definition, level });
      setExplanation(data.explanation);
      setCacheInfo(data.source === "cache" ? "⚡ Instant — from library (no search used)" : "✦ Fresh explanation generated");
      if (data.aiUsage) setUsage(prev => ({ ...prev, ...data.aiUsage }));
      else refreshUsage();
    } catch (err) {
      if (err?.response?.data?.isLimitReached) {
        setError(""); setShowPremium(true);
        setUsage(prev => ({ ...prev, remaining: 0 }));
      } else if (err?.response?.data?.isPremiumRequired) {
        setShowPremium(true);
      } else {
        setError(err?.response?.data?.message || "AI feature unavailable. Make sure GEMINI_API_KEY is set in backend .env.");
      }
    }
    setLoadingExplain(false);
  };

  const generateQuiz = async () => {
    if (!definition) { setError("Please look up a word first to get its definition."); return; }
    setLoadingQuiz(true); setError(""); setQuizData(null); setQuizSelected(null); setCacheInfo("");
    try {
      const { data } = await axios.post("/api/ai/quiz", { word: word.trim(), definition });
      setQuizData(data.quiz);
      setCacheInfo(data.source === "cache" ? "⚡ Instant — from library (no search used)" : "✦ Fresh quiz generated");
      if (data.aiUsage) setUsage(prev => ({ ...prev, ...data.aiUsage }));
      else refreshUsage();
    } catch (err) {
      if (err?.response?.data?.isLimitReached) {
        setError(""); setShowPremium(true);
        setUsage(prev => ({ ...prev, remaining: 0 }));
      } else if (err?.response?.data?.isPremiumRequired) {
        setShowPremium(true);
      } else {
        setError(err?.response?.data?.message || "Quiz generation failed.");
      }
    }
    setLoadingQuiz(false);
  };

  // Usage bar color
  const remaining = usage?.isPremium ? 999 : (usage?.remaining ?? FREE_LIMIT);
  const usedPct = usage?.isPremium ? 0 : Math.min(100, ((usage?.usedToday || 0) / FREE_LIMIT) * 100);
  const barColor = remaining === 0 ? "#fb7185" : remaining <= 2 ? "var(--yellow)" : "var(--green)";

  return (
    <div style={S.wrap} className="fade-in">
      {showPremium && <PremiumModal onClose={() => { setShowPremium(false); refreshUsage(); }} />}

      {/* Header */}
      <div>
        <div style={S.badge}>✦ AI-Powered Feature</div>
        <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
          <h1 style={S.title}>AI Coach</h1>
          {isPremium
            ? <span style={S.premiumBadge}>👑 Premium — Unlimited</span>
            : <button onClick={() => setShowPremium(true)} style={S.upgradeBtn}>👑 Upgrade to Premium</button>
          }
        </div>
        <p style={S.sub}>Get word explanations at 3 difficulty levels, plus AI-generated quiz questions</p>
      </div>

      {/* ── Daily Usage Counter ── */}
      {usage && !usage.isPremium && (
        <div style={{ ...S.usageCard, borderColor: remaining === 0 ? "rgba(251,113,133,0.3)" : remaining <= 2 ? "rgba(251,191,36,0.3)" : "rgba(74,222,128,0.25)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10, flexWrap:"wrap", gap:8 }}>
            <div>
              <span style={{ fontWeight:700, color:"var(--text)", fontSize:".92rem" }}>
                {remaining === 0 ? "⛔ Daily Limit Reached" : `🎯 Free AI Searches Today`}
              </span>
              <span style={{ color:"var(--text3)", fontSize:".82rem", marginLeft:8 }}>Resets at midnight</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:"1.4rem", fontWeight:800, color:barColor }}>{remaining === 0 ? "0" : remaining}</span>
              <span style={{ color:"var(--text3)", fontSize:".85rem" }}>/ {FREE_LIMIT} remaining</span>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ background:"var(--card3)", borderRadius:6, height:8, overflow:"hidden" }}>
            <div style={{ height:"100%", width:usedPct+"%", background:barColor, borderRadius:6, transition:"width .5s ease" }} />
          </div>
          {/* Search dots */}
          <div style={{ display:"flex", gap:6, marginTop:10 }}>
            {Array.from({ length: FREE_LIMIT }).map((_, i) => (
              <div key={i} style={{
                width:28, height:28, borderRadius:"50%",
                background: i < (usage?.usedToday || 0) ? "rgba(251,113,133,0.3)" : "rgba(74,222,128,0.2)",
                border: `2px solid ${i < (usage?.usedToday || 0) ? "#fb7185" : "var(--green)"}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:".7rem", fontWeight:700,
                color: i < (usage?.usedToday || 0) ? "#fb7185" : "var(--green)",
              }}>
                {i < (usage?.usedToday || 0) ? "✓" : i + 1}
              </div>
            ))}
          </div>
          {remaining === 0 && (
            <div style={{ marginTop:12, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
              <span style={{ color:"#fb7185", fontSize:".85rem" }}>Limit reached — come back tomorrow or upgrade!</span>
              <button className="btn-primary" onClick={() => setShowPremium(true)} style={{ padding:"8px 18px", fontSize:".83rem" }}>
                👑 Get Unlimited Access
              </button>
            </div>
          )}
          {remaining > 0 && remaining <= 2 && (
            <p style={{ color:"var(--yellow)", fontSize:".8rem", marginTop:8 }}>
              ⚠ Only {remaining} free search{remaining !== 1?"es":""} left today — upgrade for unlimited!
            </p>
          )}
        </div>
      )}

      {/* Premium unlimited badge */}
      {usage?.isPremium && (
        <div style={{ background:"rgba(251,191,36,0.08)", border:"1px solid rgba(251,191,36,0.25)", borderRadius:14, padding:"12px 18px", display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:22 }}>👑</span>
          <div>
            <div style={{ fontWeight:700, color:"var(--yellow)", fontSize:".92rem" }}>Premium Active — Unlimited AI Access</div>
            <div style={{ color:"var(--text3)", fontSize:".8rem" }}>No daily limits — use as much as you want!</div>
          </div>
        </div>
      )}

      {/* Step 1 */}
      <div style={S.card}>
        <div style={S.cardLabel}>Step 1 — Enter a Word</div>
        <div style={{ display:"flex", gap:10 }}>
          <input className="input-field" placeholder="e.g. serendipity, eloquent, ephemeral…"
            value={word} onChange={e => { setWord(e.target.value); setDefinition(""); setExplanation(""); setQuizData(null); }}
            onKeyDown={e => e.key === "Enter" && lookup()} style={{ flex:1 }} />
          <button className="btn-ghost" onClick={lookup} disabled={lookupLoading} style={{ flexShrink:0 }}>
            {lookupLoading ? "…" : "Look Up"}
          </button>
        </div>
        {definition && (
          <div style={{ marginTop:12, padding:"12px 16px", background:"rgba(124,111,247,0.07)", borderRadius:10, borderLeft:"3px solid var(--primary)" }}>
            <div style={{ fontSize:".72rem", fontWeight:700, color:"var(--primary)", letterSpacing:.8, textTransform:"uppercase", marginBottom:4 }}>Definition Found</div>
            <p style={{ color:"var(--text2)", fontSize:".9rem", lineHeight:1.6 }}>{definition}</p>
          </div>
        )}
      </div>

      {/* Step 2 */}
      <div style={S.card}>
        <div style={S.cardLabel}>Step 2 — Choose Explanation Level</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:10 }}>
          {LEVELS.map(l => (
            <button key={l.key} onClick={() => setLevel(l.key)}
              style={{ background:level===l.key?"rgba(124,111,247,0.15)":"var(--card2)", border:level===l.key?"1px solid rgba(124,111,247,0.4)":"1px solid var(--border)", borderRadius:12, padding:"14px 10px", textAlign:"center", cursor:"pointer", transition:"all .2s" }}>
              <div style={{ fontWeight:700, fontSize:".9rem", color:level===l.key?"var(--primary2)":"var(--text)", marginBottom:4 }}>{l.label}</div>
              <div style={{ fontSize:".72rem", color:"var(--text3)" }}>{l.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background:"rgba(251,113,133,0.08)", border:"1px solid rgba(251,113,133,0.22)", borderRadius:12, padding:"12px 18px", color:"#fb7185", fontSize:".9rem" }}>{error}</div>
      )}

      {/* Action Buttons */}
      <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
        <button className="btn-primary" onClick={explain}
          disabled={loadingExplain || !word.trim() || remaining === 0}
          style={{ flex:1, padding:"13px", fontSize:".95rem", display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity: remaining === 0 ? 0.5 : 1 }}>
          {loadingExplain ? <><Spin /> Generating…</> : "✦ Explain This Word"}
        </button>
        <button onClick={generateQuiz}
          disabled={loadingQuiz || !definition || remaining === 0}
          style={{ flex:1, padding:"13px", fontSize:".95rem", background:"rgba(244,114,182,0.12)", border:"1px solid rgba(244,114,182,0.3)", color:"var(--accent)", borderRadius:10, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontFamily:"'Inter',sans-serif", opacity:(!definition || remaining === 0) ? 0.5 : 1 }}>
          {loadingQuiz ? <><Spin /> Generating…</> : "◎ Create AI Quiz"}
        </button>
      </div>

      {cacheInfo && (
        <div style={{ background:"rgba(74,222,128,0.08)", border:"1px solid rgba(74,222,128,0.2)", borderRadius:10, padding:"8px 14px", color:"var(--green)", fontSize:".82rem", fontWeight:600 }}>
          {cacheInfo}
        </div>
      )}

      {/* Explanation Result */}
      {explanation && (
        <div style={{ background:"linear-gradient(135deg,rgba(124,111,247,0.09),rgba(34,211,238,0.05))", border:"1px solid rgba(124,111,247,0.22)", borderRadius:18, padding:"24px" }} className="fade-in">
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
            <span style={{ fontSize:18, color:"var(--primary2)" }}>✦</span>
            <span style={{ fontWeight:700, color:"var(--text)" }}>AI Explanation — {LEVELS.find(l=>l.key===level)?.label}</span>
          </div>
          {explanation.split("\n").filter(Boolean).map((line, i) => (
            <p key={i} style={{ color:"var(--text2)", lineHeight:1.78, fontSize:".97rem", marginBottom:8 }}>{line}</p>
          ))}
        </div>
      )}

      {/* Quiz Result */}
      {quizData && (
        <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:18, padding:"24px", display:"flex", flexDirection:"column", gap:16 }} className="fade-in">
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:18, color:"var(--accent)" }}>◎</span>
            <span style={{ fontWeight:700, color:"var(--text)" }}>AI Quiz — "{word}"</span>
          </div>
          <p style={{ color:"var(--text)", fontSize:"1rem", fontWeight:600, lineHeight:1.5 }}>{quizData.question}</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {quizData.options?.map((opt, i) => {
              let bg="var(--card2)", border="1px solid var(--border)", color="var(--text2)";
              if (quizSelected) {
                if (opt===quizData.correctAnswer) { bg="rgba(74,222,128,0.12)"; border="1px solid rgba(74,222,128,0.4)"; color="var(--green)"; }
                else if (opt===quizSelected) { bg="rgba(251,113,133,0.12)"; border="1px solid rgba(251,113,133,0.4)"; color="#fb7185"; }
              }
              return (
                <button key={i} onClick={() => { if (!quizSelected) setQuizSelected(opt); }} disabled={!!quizSelected}
                  style={{ background:bg, border, borderRadius:12, padding:"12px 14px", color, fontSize:".87rem", fontWeight:500, cursor:quizSelected?"default":"pointer", display:"flex", gap:9, alignItems:"flex-start", textAlign:"left", transition:"all .2s" }}>
                  <span style={{ width:22, height:22, borderRadius:"50%", background:"rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".7rem", fontWeight:700, flexShrink:0 }}>
                    {String.fromCharCode(65+i)}
                  </span>
                  <span style={{ lineHeight:1.4 }}>{opt}</span>
                </button>
              );
            })}
          </div>
          {quizSelected && quizData.explanation && (
            <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:10, padding:"14px 16px" }}>
              <span style={{ color:quizSelected===quizData.correctAnswer?"var(--green)":"#fb7185", fontWeight:700 }}>
                {quizSelected===quizData.correctAnswer ? "✓ Correct!" : "✗ Incorrect"}
              </span>
              <p style={{ color:"var(--text2)", fontSize:".88rem", lineHeight:1.6, marginTop:6 }}>{quizData.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Feature Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:12 }}>
        {[
          { icon:"🎯", title:"5 Free Daily Searches",  desc:"Every day you get 5 free AI searches resets at midnight" },
          { icon:"⚡", title:"Smart Caching",           desc:"Cached words don't count against your daily limit!" },
          { icon:"👑", title:"Premium = Unlimited",     desc:"Upgrade for unlimited AI access with no daily restrictions" },
        ].map(f => (
          <div key={f.title} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:"18px" }}>
            <div style={{ fontSize:22, marginBottom:10 }}>{f.icon}</div>
            <div style={{ fontWeight:700, color:"var(--text)", marginBottom:6, fontSize:".93rem" }}>{f.title}</div>
            <div style={{ color:"var(--text3)", fontSize:".8rem", lineHeight:1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Spin() {
  return <span style={{ display:"inline-block", width:13, height:13, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite", flexShrink:0 }} />;
}

const S = {
  wrap:{ display:"flex", flexDirection:"column", gap:20, maxWidth:780, margin:"0 auto" },
  badge:{ display:"inline-block", padding:"5px 16px", borderRadius:20, background:"rgba(124,111,247,0.12)", color:"var(--primary2)", fontSize:".78rem", fontWeight:700, letterSpacing:1, border:"1px solid rgba(124,111,247,0.3)", marginBottom:10 },
  title:{ fontFamily:"'Playfair Display',serif", fontSize:"2rem", fontWeight:800, color:"var(--text)" },
  sub:{ color:"var(--text3)", fontSize:".9rem", lineHeight:1.6, marginTop:4 },
  premiumBadge:{ background:"rgba(251,191,36,0.15)", border:"1px solid rgba(251,191,36,0.4)", color:"var(--yellow)", borderRadius:20, padding:"5px 14px", fontSize:".8rem", fontWeight:700 },
  upgradeBtn:{ background:"rgba(124,111,247,0.12)", border:"1px solid rgba(124,111,247,0.3)", color:"var(--primary2)", borderRadius:20, padding:"5px 14px", fontSize:".8rem", fontWeight:700, cursor:"pointer" },
  usageCard:{ background:"var(--card)", border:"1px solid", borderRadius:16, padding:"18px 20px" },
  card:{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, padding:"20px" },
  cardLabel:{ fontSize:".78rem", fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:"var(--text3)", marginBottom:14 },
};
