import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MOODS = [
  { key:"happy",    emoji:"😄", label:"Happy",     desc:"Joyful & bright words",    bg:"rgba(255,193,7,0.12)",    border:"rgba(255,193,7,0.35)",    color:"#ffc107" },
  { key:"sad",      emoji:"😔", label:"Melancholy", desc:"Deep & poetic words",      bg:"rgba(0,188,212,0.12)",    border:"rgba(0,188,212,0.35)",    color:"#00bcd4" },
  { key:"curious",  emoji:"🤔", label:"Curious",   desc:"Wonder & mystery words",   bg:"rgba(103,58,183,0.12)",   border:"rgba(103,58,183,0.35)",   color:"#9c27b0" },
  { key:"inspired", emoji:"✨", label:"Inspired",  desc:"Beautiful & luminous",     bg:"rgba(233,30,99,0.12)",    border:"rgba(233,30,99,0.35)",    color:"#e91e63" },
  { key:"calm",     emoji:"🌿", label:"Calm",      desc:"Serene & peaceful words",  bg:"rgba(76,175,80,0.12)",    border:"rgba(76,175,80,0.35)",    color:"#4caf50" },
  { key:"powerful", emoji:"⚡", label:"Powerful",  desc:"Strong & bold words",      bg:"rgba(255,152,0,0.12)",    border:"rgba(255,152,0,0.35)",    color:"#ff9800" },
];

export default function MoodPage() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const pickMood = async (mood) => {
    setSelectedMood(mood);
    setLoading(true); setWords([]);
    try {
      const { data } = await axios.get("/api/dictionary/mood?mood=" + mood.key);
      setWords(data.data || []);
    } catch {}
    setLoading(false);
  };

  const speak = (word) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.rate = 0.85; u.lang = "en-US";
    window.speechSynthesis.speak(u);
  };

  return (
    <div style={S.wrap} className="fade-in">
      <div>
        <div style={{display:"inline-block",padding:"5px 15px",borderRadius:20,background:"rgba(233,30,99,0.1)",color:"#e91e63",fontSize:".76rem",fontWeight:700,letterSpacing:1,border:"1px solid rgba(233,30,99,0.3)",marginBottom:10}}>
          🎭 Unique Feature
        </div>
        <h1 style={S.title}>Mood Word Discovery</h1>
        <p style={S.sub}>Choose your mood and discover beautiful matching words</p>
      </div>

      {/* Mood Grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10}}>
        {MOODS.map(m => (
          <button key={m.key} onClick={() => pickMood(m)}
            style={{
              background: selectedMood?.key===m.key ? m.bg : "var(--card)",
              border: `2px solid ${selectedMood?.key===m.key ? m.border : "var(--border)"}`,
              borderRadius:18,padding:"18px 12px",
              display:"flex",flexDirection:"column",alignItems:"center",gap:7,
              cursor:"pointer",transition:"all .25s",
              transform: selectedMood?.key===m.key ? "translateY(-3px)" : "translateY(0)",
              boxShadow: selectedMood?.key===m.key ? `0 4px 20px ${m.border}` : "none",
            }}>
            <span style={{fontSize:"1.8rem"}}>{m.emoji}</span>
            <span style={{fontWeight:700,fontSize:".88rem",color:selectedMood?.key===m.key?m.color:"var(--text)"}}>{m.label}</span>
            <span style={{color:"var(--text3)",fontSize:".72rem",textAlign:"center",lineHeight:1.4}}>{m.desc}</span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:12}}>
          {[1,2,3,4].map(i=><div key={i} className="shimmer" style={{height:120,borderRadius:16}}/>)}
        </div>
      )}

      {/* Results */}
      {!loading && selectedMood && words.length > 0 && (
        <div className="fade-in">
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:14}}>
            <span style={{fontSize:22}}>{selectedMood.emoji}</span>
            <h3 style={{fontSize:".95rem",fontWeight:700,color:"var(--text)"}}>Words for "{selectedMood.label}"</h3>
            <span style={{marginLeft:"auto",background:selectedMood.bg,color:selectedMood.color,borderRadius:20,padding:"3px 12px",fontSize:".73rem",fontWeight:700,border:`1px solid ${selectedMood.border}`}}>{words.length} words</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))",gap:12}}>
            {words.map((w, i) => (
              <div key={i} className="slide-up"
                style={{background:"var(--card)",border:`1px solid ${selectedMood.border}`,borderRadius:16,padding:"16px",display:"flex",flexDirection:"column",gap:7,animationDelay:(i*0.04)+"s"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.1rem",fontWeight:700,color:selectedMood.color}}>{w.word}</h3>
                  <button onClick={()=>speak(w.word)} style={{background:"transparent",border:"none",color:"var(--text3)",cursor:"pointer",fontSize:15,padding:"2px 5px"}}>🔊</button>
                </div>
                {w.definition ? (
                  <p style={{color:"var(--text2)",fontSize:".81rem",lineHeight:1.5,flex:1}}>{w.definition.substring(0,90)}{w.definition.length>90?"…":""}</p>
                ) : (
                  <p style={{color:"var(--text3)",fontSize:".8rem",fontStyle:"italic"}}>Search to see meaning</p>
                )}
                <button onClick={()=>navigate("/dashboard/dictionary?q="+w.word)}
                  style={{background:selectedMood.bg,border:`1px solid ${selectedMood.border}`,color:selectedMood.color,borderRadius:9,padding:"6px 12px",fontSize:".79rem",fontWeight:600,cursor:"pointer",transition:"all .2s",marginTop:"auto"}}>
                  Explore →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && selectedMood && words.length === 0 && (
        <div style={{textAlign:"center",padding:"40px 0",color:"var(--text3)"}}>
          <p>No words found for this mood yet. Try another!</p>
        </div>
      )}

      {!loading && !selectedMood && (
        <div style={{textAlign:"center",padding:"40px 0",color:"var(--text3)"}}>
          <div style={{fontSize:"2.5rem",marginBottom:12,opacity:.4}}>🎭</div>
          <p>Pick a mood above to discover matching words</p>
        </div>
      )}
    </div>
  );
}

const S = {
  wrap:{display:"flex",flexDirection:"column",gap:22,maxWidth:900,margin:"0 auto"},
  title:{fontFamily:"'Playfair Display',serif",fontSize:"clamp(1.6rem,4vw,2rem)",fontWeight:800,color:"var(--text)",marginBottom:6},
  sub:{color:"var(--text3)",fontSize:".9rem",lineHeight:1.6},
};
