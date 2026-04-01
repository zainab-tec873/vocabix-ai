import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function FavoritesPage() {
  const [favs, setFavs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try { const { data } = await axios.get("/api/favorites"); setFavs(data.data || []); }
    catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (wordId) => {
    setRemoving(wordId);
    try { await axios.delete("/api/favorites/" + wordId); setFavs(f => f.filter(x => x.word_id !== wordId)); }
    catch {}
    setRemoving(null);
  };

  const filtered = favs.filter(f => f.word.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={S.wrap} className="fade-in">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={S.title}>Favorites</h1>
          <p style={S.sub}>{favs.length} saved word{favs.length!==1?"s":""}</p>
        </div>
        <input className="input-field" placeholder="Filter favorites…" value={search} onChange={e=>setSearch(e.target.value)} style={{width:200}}/>
      </div>

      {loading && (
        <div style={S.grid}>{[1,2,3,4,5,6].map(i=><div key={i} className="shimmer" style={{height:140,borderRadius:16}}/>)}</div>
      )}

      {!loading && favs.length === 0 && (
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,padding:"80px 24px",textAlign:"center"}}>
          <div style={{fontSize:"3.5rem",opacity:.25}}>♡</div>
          <h3 style={{fontSize:"1.2rem",fontWeight:700,color:"var(--text)"}}>No favorites yet</h3>
          <p style={{color:"var(--text3)",fontSize:".9rem"}}>Search a word and tap ♡ Save to add it here</p>
          <button className="btn-primary" onClick={()=>navigate("/dashboard/dictionary")} style={{marginTop:4,padding:"11px 24px"}}>Go to Dictionary →</button>
        </div>
      )}

      {!loading && filtered.length === 0 && favs.length > 0 && (
        <p style={{color:"var(--text3)",padding:"40px 0",textAlign:"center"}}>No favorites match "{search}"</p>
      )}

      {!loading && filtered.length > 0 && (
        <div style={S.grid}>
          {filtered.map(fav => (
            <div key={fav.word_id} style={S.card}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:8}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.15rem",fontWeight:700,color:"var(--text)"}}>{fav.word}</h3>
                <button onClick={()=>remove(fav.word_id)} disabled={removing===fav.word_id} style={{background:"rgba(251,113,133,0.1)",border:"1px solid rgba(251,113,133,0.2)",color:"#fb7185",borderRadius:8,padding:"3px 8px",fontSize:".75rem",cursor:"pointer",flexShrink:0}}>
                  {removing===fav.word_id?"…":"✕"}
                </button>
              </div>
              {fav.meanings?.[0]?.part_of_speech && (
                <span style={{display:"inline-block",padding:"2px 10px",borderRadius:20,background:"rgba(124,111,247,0.12)",color:"var(--primary2)",fontSize:".7rem",fontWeight:600,textTransform:"uppercase",marginBottom:8}}>{fav.meanings[0].part_of_speech}</span>
              )}
              {fav.meanings?.[0]?.definition && (
                <p style={{color:"var(--text2)",fontSize:".84rem",lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",flex:1}}>{fav.meanings[0].definition}</p>
              )}
              <button onClick={()=>navigate("/dashboard/dictionary?q="+fav.word)} style={{background:"transparent",border:"1px solid var(--border)",borderRadius:8,padding:"7px",color:"var(--text3)",fontSize:".8rem",cursor:"pointer",width:"100%",textAlign:"center",marginTop:"auto",transition:"all .2s"}}>
                Explore →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const S = {
  wrap:{display:"flex",flexDirection:"column",gap:22,maxWidth:920,margin:"0 auto"},
  title:{fontFamily:"'Playfair Display',serif",fontSize:"2rem",fontWeight:800,color:"var(--text)"},
  sub:{color:"var(--text3)",fontSize:".9rem"},
  grid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:14},
  card:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:"18px",display:"flex",flexDirection:"column",gap:8,transition:"border-color .2s"},
};
