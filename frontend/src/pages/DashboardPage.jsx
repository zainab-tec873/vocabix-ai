import { useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Footer from "../components/Footer";
import HomePage        from "./dashboard/HomePage";
import DictionaryPage  from "./dashboard/DictionaryPage";
import QuizPage        from "./dashboard/QuizPage";
import FavoritesPage   from "./dashboard/FavoritesPage";
import CoachPage       from "./dashboard/CoachPage";
import HistoryPage     from "./dashboard/HistoryPage";
import MoodPage        from "./dashboard/MoodPage";

// Bottom nav shows 5 items max; "More" opens a drawer for the rest
const MAIN_NAV = [
  { path:"home",       icon:"⌂",  label:"Home" },
  { path:"dictionary", icon:"◈",  label:"Search" },
  { path:"quiz",       icon:"◎",  label:"Quiz" },
  { path:"mood",       icon:"🎭", label:"Mood" },
  { path:"coach",      icon:"✦",  label:"AI Coach", badge:"PRO" },
];

const MORE_NAV = [
  { path:"favorites",  icon:"♡",  label:"Favorites" },
  { path:"history",    icon:"◷",  label:"History" },
];

const ALL_NAV = [...MAIN_NAV, ...MORE_NAV];

export default function DashboardPage() {
  const { user, logout, isPremium } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const cur = location.pathname.split("/")[2] || "home";

  const go = (path) => { navigate("/dashboard/" + path); setShowMore(false); };

  // Sidebar nav button (desktop)
  const SideNavBtn = ({ n }) => (
    <button onClick={() => go(n.path)}
      style={{
        background: cur===n.path ? "rgba(0,188,212,0.13)" : "transparent",
        border: "none",
        display:"flex", alignItems:"center", gap:10,
        padding:"10px 12px", borderRadius:11,
        color: cur===n.path ? "var(--primary2)" : "var(--text3)",
        fontSize:".88rem", fontWeight: cur===n.path ? 600 : 500,
        width:"100%", textAlign:"left", cursor:"pointer", transition:"all .2s",
      }}>
      <span style={{fontSize:16,width:20,textAlign:"center"}}>{n.icon}</span>
      <span style={{flex:1}}>{n.label}</span>
      {n.badge && (
        <span style={{
          background: n.badge==="PRO" ? "rgba(255,193,7,0.18)" : "rgba(0,188,212,0.15)",
          color: n.badge==="PRO" ? "var(--yellow)" : "var(--primary)",
          fontSize:".58rem", fontWeight:700, padding:"2px 6px", borderRadius:8,
        }}>{n.badge}</span>
      )}
    </button>
  );

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"var(--bg)"}}>

      {/* ─── Desktop Sidebar ─── */}
      <aside className="hide-mobile" style={{
        width:230, background:"var(--bg2)", borderRight:"1px solid var(--border)",
        display:"flex", flexDirection:"column", justifyContent:"space-between",
        padding:"22px 12px 0", position:"sticky", top:0, height:"100vh", flexShrink:0,
      }}>
        {/* Logo */}
        <div style={{display:"flex",flexDirection:"column",gap:26}}>
          <div style={{display:"flex",alignItems:"center",gap:9,paddingLeft:6}}>
            <img src="/logo.png" alt="Vocabix AI" style={{width:28,height:28,objectFit:"contain",filter:"drop-shadow(0 0 6px rgba(0,188,212,0.5))"}}/>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:"1.15rem",fontWeight:800,background:"linear-gradient(135deg,var(--text),var(--primary2))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Vocabix AI</span>
          </div>
          <nav style={{display:"flex",flexDirection:"column",gap:2}}>
            {ALL_NAV.map(n => <SideNavBtn key={n.path} n={n}/>)}
          </nav>
        </div>

        {/* Bottom controls */}
        <div style={{display:"flex",flexDirection:"column",gap:8,paddingBottom:16,marginTop:20}}>
          <button onClick={toggle} style={{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:10,padding:"8px",color:"var(--text2)",fontSize:".82rem",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            {theme==="dark" ? "☀ Light Mode" : "🌙 Dark Mode"}
          </button>
          {isPremium && (
            <div style={{background:"rgba(255,193,7,0.07)",border:"1px solid rgba(255,193,7,0.22)",borderRadius:10,padding:"6px 10px",textAlign:"center",fontSize:".74rem",color:"var(--yellow)",fontWeight:700}}>
              👑 Premium Active
            </div>
          )}
          <div style={{display:"flex",alignItems:"center",gap:9,padding:"8px 4px"}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,var(--primary),var(--accent))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:".85rem",fontWeight:700,color:"#fff",flexShrink:0}}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{overflow:"hidden"}}>
              <div style={{fontSize:".84rem",fontWeight:600,color:"var(--text)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user?.name}</div>
              <div style={{fontSize:".71rem",color:"var(--text3)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} style={{background:"rgba(244,67,54,0.1)",border:"1px solid rgba(244,67,54,0.2)",color:"#ef5350",borderRadius:10,padding:"8px",fontSize:".82rem",fontWeight:600}}>
            Sign Out
          </button>
          <Footer/>
        </div>
      </aside>

      {/* ─── Mobile Top Bar ─── */}
      <div className="mobile-only" style={{
        background:"var(--bg2)", padding:"12px 16px",
        justifyContent:"space-between", alignItems:"center",
        borderBottom:"1px solid var(--border)",
        position:"fixed", top:0, left:0, right:0, zIndex:150,
        backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <img src="/logo.png" alt="Vocabix AI" style={{width:26,height:26,objectFit:"contain",filter:"drop-shadow(0 0 5px rgba(0,188,212,0.5))"}}/>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:"1.05rem",fontWeight:800,background:"linear-gradient(135deg,var(--text),var(--primary2))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Vocabix AI</span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={toggle} style={{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:9,padding:"6px 10px",color:"var(--text2)",fontSize:14}}>
            {theme==="dark"?"☀":"🌙"}
          </button>
          <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,var(--primary),var(--accent))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:".82rem",fontWeight:700,color:"#fff"}}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"auto",minWidth:0}}>
        <main className="dashboard-main" style={{flex:1,padding:"28px 20px",paddingTop:"calc(28px + 0px)"}}>
          {/* Mobile top padding for fixed topbar */}
          <div className="mobile-only" style={{height:52,flexShrink:0}}/>
          <Routes>
            <Route index element={<Navigate to="home" replace/>}/>
            <Route path="home"       element={<HomePage/>}/>
            <Route path="dictionary" element={<DictionaryPage/>}/>
            <Route path="quiz"       element={<QuizPage/>}/>
            <Route path="favorites"  element={<FavoritesPage/>}/>
            <Route path="history"    element={<HistoryPage/>}/>
            <Route path="mood"       element={<MoodPage/>}/>
            <Route path="coach"      element={<CoachPage/>}/>
          </Routes>
        </main>
        <div className="hide-mobile"><Footer/></div>
      </div>

      {/* ─── Mobile Bottom Navigation ─── */}
      <nav className="mobile-only bottom-nav">
        {MAIN_NAV.slice(0,4).map(n => (
          <button key={n.path} className={`bottom-nav-item${cur===n.path?" active":""}`} onClick={()=>go(n.path)}>
            <span className="nav-icon">{n.icon}</span>
            <span>{n.label}</span>
          </button>
        ))}
        {/* More button */}
        <button className={`bottom-nav-item${["coach","favorites","history"].includes(cur)?" active":""}`} onClick={()=>setShowMore(v=>!v)}>
          <span className="nav-icon">{showMore ? "✕" : "⋯"}</span>
          <span>More</span>
        </button>
      </nav>

      {/* ─── More Drawer (mobile) ─── */}
      {showMore && (
        <>
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:280}} onClick={()=>setShowMore(false)}/>
          <div className="more-drawer" style={{zIndex:290}}>
            <div style={{width:36,height:4,borderRadius:4,background:"var(--border2)",margin:"0 auto 18px"}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              {[MAIN_NAV[4], ...MORE_NAV].map(n=>(
                <button key={n.path} onClick={()=>go(n.path)}
                  style={{background:cur===n.path?"rgba(0,188,212,0.13)":"var(--card2)",border:`1px solid ${cur===n.path?"rgba(0,188,212,0.4)":"var(--border)"}`,borderRadius:14,padding:"16px 14px",display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:"pointer",color:cur===n.path?"var(--primary2)":"var(--text2)"}}>
                  <span style={{fontSize:22}}>{n.icon}</span>
                  <span style={{fontSize:".82rem",fontWeight:600}}>{n.label}</span>
                  {n.badge && <span style={{background:"rgba(255,193,7,0.18)",color:"var(--yellow)",fontSize:".58rem",fontWeight:700,padding:"2px 7px",borderRadius:8}}>{n.badge}</span>}
                </button>
              ))}
            </div>
            <div style={{borderTop:"1px solid var(--border)",paddingTop:14,display:"flex",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,var(--primary),var(--accent))",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"#fff"}}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{fontSize:".85rem",fontWeight:600,color:"var(--text)"}}>{user?.name}</div>
                  {isPremium && <div style={{fontSize:".7rem",color:"var(--yellow)",fontWeight:600}}>👑 Premium</div>}
                </div>
              </div>
              <button onClick={logout} style={{background:"rgba(244,67,54,0.1)",border:"1px solid rgba(244,67,54,0.2)",color:"#ef5350",borderRadius:10,padding:"8px 14px",fontSize:".82rem",fontWeight:600}}>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
