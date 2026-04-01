import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const LEVEL_NAMES = ["Beginner","Explorer","Learner","Scholar","Wordsmith","Linguist","Lexicon Master"];

export default function HomePage() {
  const { user, isPremium } = useAuth();
  const navigate = useNavigate();
  const [wotd, setWotd] = useState(null);
  const [trending, setTrending] = useState([]);
  const [stats, setStats] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    axios.get("/api/dictionary/word-of-the-day").then(r=>setWotd(r.data.data)).catch(()=>{});
    axios.get("/api/dictionary/trending").then(r=>setTrending(r.data.data||[])).catch(()=>{});
    axios.get("/api/stats").then(r=>setStats(r.data.data)).catch(()=>{});
  }, []);

  const hour = new Date().getHours();
  const greeting = hour<12?"Good morning ☀️":hour<17?"Good afternoon ⚡":"Good evening 🌙";

  const speak = (word) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.rate = 0.85; u.lang = "en-US";
    window.speechSynthesis.speak(u);
  };

  const search = (e) => {
    e.preventDefault();
    if (query.trim()) navigate("/dashboard/dictionary?q=" + encodeURIComponent(query.trim()));
  };

  return (
    <div style={S.wrap} className="fade-in">
      {/* Greeting */}
      <div style={S.topRow}>
        <div>
          <p style={S.greet}>{greeting}, {user?.name?.split(" ")[0]}!</p>
          <h1 style={S.title}>What will you explore?</h1>
        </div>
        {stats && (
          <div style={S.streakBadge}>
            <span style={{fontSize:20}}>🔥</span>
            <div>
              <div style={{fontSize:"1.3rem",fontWeight:800,color:"var(--yellow)",lineHeight:1}}>{stats.streak}</div>
              <div style={{fontSize:".68rem",color:"var(--text3)"}}>day streak</div>
            </div>
          </div>
        )}
      </div>

      {isPremium && (
        <div style={{background:"rgba(255,193,7,0.09)",border:"1px solid rgba(255,193,7,0.28)",borderRadius:12,padding:"9px 14px",display:"inline-flex",alignItems:"center",gap:7,alignSelf:"flex-start"}}>
          <span>👑</span>
          <span style={{color:"var(--yellow)",fontWeight:700,fontSize:".83rem"}}>Premium Active</span>
        </div>
      )}

      {/* Stats — 2 cols on mobile, 4 on desktop */}
      {stats && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
          {[
            {icon:"⚡",label:"XP",value:stats.xp,color:"var(--primary)"},
            {icon:"🏆",label:LEVEL_NAMES[Math.min((stats.level||1)-1,6)],value:`Lv.${stats.level||1}`,color:"var(--yellow)"},
            {icon:"📚",label:"Searches",value:stats.totalSearches||0,color:"var(--cyan)"},
            {icon:"♡",label:"Favorites",value:stats.favorites||0,color:"var(--accent)"},
          ].map(s=>(
            <div key={s.label} style={{background:"var(--card)",border:`1px solid ${s.color}33`,borderRadius:14,padding:"14px 12px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <div style={{fontSize:18,marginBottom:2}}>{s.icon}</div>
              <div style={{fontSize:"1.2rem",fontWeight:800,color:s.color}}>{s.value}</div>
              <div style={{fontSize:".7rem",color:"var(--text3)",fontWeight:500}}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* XP Progress */}
      {stats && (
        <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:14,padding:"14px 18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
            <span style={{fontSize:".8rem",color:"var(--text2)",fontWeight:500}}>Level — {LEVEL_NAMES[Math.min((stats.level||1)-1,6)]}</span>
            <span style={{fontSize:".8rem",color:"var(--primary)",fontWeight:700}}>{(stats.xp||0) % 100}/100 XP</span>
          </div>
          <div style={{background:"var(--card3)",borderRadius:4,height:5,overflow:"hidden"}}>
            <div style={{height:"100%",background:"linear-gradient(90deg,var(--primary),var(--accent))",borderRadius:4,width:(stats.xpProgress||0)+"%",transition:"width .6s ease"}}/>
          </div>
          <div style={{fontSize:".73rem",color:"var(--text3)",marginTop:5}}>{stats.xpToNext||0} XP to next level</div>
        </div>
      )}

      {/* Search */}
      <form onSubmit={search} style={{display:"flex",alignItems:"center",gap:8,background:"var(--card)",border:"1px solid var(--border2)",borderRadius:14,padding:"8px 10px 8px 14px"}}>
        <span style={{color:"var(--primary)",fontSize:17}}>◈</span>
        <input
          style={{flex:1,background:"transparent",border:"none",color:"var(--text)",fontSize:".95rem",padding:"5px 0",minWidth:0}}
          placeholder="Search any word…"
          value={query}
          onChange={e=>setQuery(e.target.value)}
        />
        <button className="btn-primary" type="submit" style={{borderRadius:10,padding:"8px 16px",fontSize:".85rem",flexShrink:0}}>Search</button>
      </form>

      {/* Quick Nav */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
        {[
          {icon:"◈",label:"Dictionary",desc:"Search & explore",path:"dictionary",color:"var(--primary)"},
          {icon:"◎",label:"Quiz",desc:"Test yourself",path:"quiz",color:"var(--accent)"},
          {icon:"🎭",label:"Mood Words",desc:"Words by feeling",path:"mood",color:"var(--cyan)"},
          {icon:"✦",label:"AI Coach",desc:"3-level AI explain",path:"coach",color:"var(--yellow)"},
        ].map(q=>(
          <button key={q.label} onClick={()=>navigate("/dashboard/"+q.path)}
            style={{background:"var(--card)",border:`1px solid ${q.color}33`,borderRadius:16,padding:"16px 14px",textAlign:"left",display:"flex",flexDirection:"column",gap:6,cursor:"pointer",transition:"transform .2s,box-shadow .2s",width:"100%"}}>
            <span style={{fontSize:20,color:q.color}}>{q.icon}</span>
            <div style={{fontWeight:700,fontSize:".9rem",color:"var(--text)"}}>{q.label}</div>
            <div style={{fontSize:".74rem",color:"var(--text3)"}}>{q.desc}</div>
          </button>
        ))}
      </div>

      {/* Word of the Day */}
      {wotd && (
        <div style={{background:"linear-gradient(135deg,rgba(0,188,212,0.1),rgba(76,175,80,0.07))",border:"1px solid rgba(0,188,212,0.22)",borderRadius:20,padding:"22px 20px"}}>
          <div style={{fontSize:".7rem",fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:"var(--primary2)",marginBottom:10}}>✦ Word of the Day</div>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:8}}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(1.8rem,5vw,2.4rem)",fontWeight:800,color:"var(--text)"}}>{wotd.word}</h2>
            <button onClick={()=>speak(wotd.word)} style={{background:"var(--card3)",border:"1px solid var(--border2)",borderRadius:10,padding:"6px 12px",color:"var(--text2)",fontSize:".83rem",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>🔊 Listen</button>
          </div>
          <span style={{display:"inline-block",padding:"3px 12px",borderRadius:20,background:"rgba(0,188,212,0.12)",color:"var(--primary2)",fontSize:".72rem",fontWeight:600,textTransform:"uppercase",marginBottom:10}}>{wotd.part_of_speech||"noun"}</span>
          <p style={{color:"var(--text2)",lineHeight:1.7,fontSize:".93rem"}}>{wotd.definition}</p>
          <button className="btn-primary" style={{marginTop:14,fontSize:".83rem",padding:"8px 18px"}} onClick={()=>navigate("/dashboard/dictionary?q="+wotd.word)}>
            Explore this word →
          </button>
        </div>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <div>
          <h3 style={{fontSize:".78rem",fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"var(--text3)",marginBottom:10}}>🔥 Trending Words</h3>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {trending.slice(0,12).map(w=>(
              <button key={w.id} onClick={()=>navigate("/dashboard/dictionary?q="+w.word)}
                style={{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:20,padding:"6px 14px",color:"var(--text2)",fontSize:".84rem",cursor:"pointer",transition:"all .2s"}}>
                {w.word}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  wrap:{display:"flex",flexDirection:"column",gap:18,maxWidth:860,margin:"0 auto"},
  topRow:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:10},
  greet:{color:"var(--text3)",fontSize:".87rem",fontWeight:500,marginBottom:3},
  title:{fontFamily:"'Playfair Display',serif",fontSize:"clamp(1.5rem,3vw,2.1rem)",fontWeight:800,color:"var(--text)"},
  streakBadge:{background:"var(--card)",border:"1px solid rgba(255,193,7,0.3)",borderRadius:14,padding:"10px 16px",display:"flex",alignItems:"center",gap:8,flexShrink:0},
};
