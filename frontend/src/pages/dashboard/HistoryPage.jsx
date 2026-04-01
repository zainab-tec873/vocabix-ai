import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/dictionary/history")
      .then(r => setHistory(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
    axios.get("/api/stats")
      .then(r => setActivity(r.data.data?.activity || []))
      .catch(() => {});
  }, []);

  // Build 52-week heatmap
  const buildHeatmap = () => {
    const map = {};
    activity.forEach(a => { map[a.date] = parseInt(a.count); });
    const days = [];
    const now = new Date();
    for (let i = 364; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      days.push({ date: key, count: map[key] || 0 });
    }
    return days;
  };

  const heatmap = buildHeatmap();
  const maxCount = Math.max(...heatmap.map(d => d.count), 1);
  const getHeat = (count) => {
    if (!count) return "var(--card3)";
    const intensity = count / maxCount;
    if (intensity > 0.75) return "var(--primary)";
    if (intensity > 0.5) return "#6054c8";
    if (intensity > 0.25) return "#4a3fa0";
    return "#332e70";
  };

  const grouped = history.reduce((acc, item) => {
    const date = new Date(item.searched_at).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  return (
    <div style={S.wrap} className="fade-in">
      <h1 style={S.title}>Search History</h1>
      <p style={S.sub}>Your vocabulary journey over time</p>

      {/* Activity Heatmap */}
      <div style={S.heatCard}>
        <div style={{fontSize:".75rem",fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",color:"var(--text3)",marginBottom:16}}>📅 Activity Heatmap — Last 52 Weeks</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
          {heatmap.map((day, i) => (
            <div key={i} title={`${day.date}: ${day.count} searches`}
              style={{width:11,height:11,borderRadius:2,background:getHeat(day.count),transition:"transform .15s",cursor:day.count?"pointer":"default"}}/>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:12}}>
          <span style={{color:"var(--text3)",fontSize:".72rem"}}>Less</span>
          {["var(--card3)","#332e70","#4a3fa0","#6054c8","var(--primary)"].map((c,i) => (
            <div key={i} style={{width:11,height:11,borderRadius:2,background:c}}/>
          ))}
          <span style={{color:"var(--text3)",fontSize:".72rem"}}>More</span>
        </div>
      </div>

      {loading && (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[1,2,3].map(i=><div key={i} className="shimmer" style={{height:60,borderRadius:12}}/>)}
        </div>
      )}

      {!loading && history.length === 0 && (
        <div style={{textAlign:"center",padding:"60px 0",color:"var(--text3)"}}>
          <div style={{fontSize:"2.5rem",opacity:.2,marginBottom:12}}>◷</div>
          <p>No search history yet. Start searching words!</p>
          <button className="btn-primary" onClick={()=>navigate("/dashboard/dictionary")} style={{marginTop:16,padding:"10px 24px"}}>Go to Dictionary →</button>
        </div>
      )}

      {!loading && Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <div style={{fontSize:".78rem",fontWeight:700,color:"var(--text3)",letterSpacing:1,textTransform:"uppercase",marginBottom:8,paddingLeft:4}}>{date}</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {items.map((item, i) => (
              <button key={i} onClick={()=>navigate("/dashboard/dictionary?q="+item.word)}
                style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:"13px 18px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",textAlign:"left",transition:"all .2s",width:"100%"}}>
                <span style={{color:"var(--primary)",fontSize:16}}>◈</span>
                <div>
                  <div style={{fontWeight:600,color:"var(--text)",fontSize:".95rem"}}>{item.word}</div>
                  {item.definition && <div style={{color:"var(--text3)",fontSize:".8rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:500}}>{item.definition}</div>}
                </div>
                <span style={{marginLeft:"auto",color:"var(--text3)",fontSize:".8rem",flexShrink:0}}>{new Date(item.searched_at).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const S = {
  wrap:{display:"flex",flexDirection:"column",gap:22,maxWidth:800,margin:"0 auto"},
  title:{fontFamily:"'Playfair Display',serif",fontSize:"2rem",fontWeight:800,color:"var(--text)"},
  sub:{color:"var(--text3)",fontSize:".9rem",marginTop:-14},
  heatCard:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:18,padding:"22px 24px"},
};
