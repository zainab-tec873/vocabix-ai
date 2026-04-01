import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",color:"var(--text)",position:"relative",overflow:"hidden"}}>
      {/* Background orbs */}
      <div style={{position:"fixed",width:700,height:700,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,188,212,0.12) 0%,transparent 70%)",top:"-20%",left:"-15%",pointerEvents:"none",animation:"orbMove 10s ease-in-out infinite"}}/>
      <div style={{position:"fixed",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(76,175,80,0.08) 0%,transparent 70%)",bottom:"-15%",right:"-5%",pointerEvents:"none",animation:"orbMove 12s ease-in-out infinite reverse"}}/>

      {/* Nav */}
      <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 24px",borderBottom:"1px solid var(--border)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100,background:"rgba(8,12,14,0.8)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src="/logo.png" alt="Vocabix AI" style={{width:30,height:30,objectFit:"contain",filter:"drop-shadow(0 0 6px rgba(0,188,212,0.5))"}}/>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",fontWeight:800,background:"linear-gradient(135deg,var(--text),var(--primary2))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Vocabix AI</span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={toggle} style={{background:"var(--card2)",border:"1px solid var(--border2)",borderRadius:10,padding:"8px 12px",color:"var(--text2)",fontSize:15}}>{theme==="dark"?"☀":"🌙"}</button>
          <button className="btn-ghost" onClick={()=>navigate("/login")} style={{padding:"9px 18px",fontSize:".88rem"}}>Sign In</button>
          <button className="btn-primary" onClick={()=>navigate("/register")} style={{padding:"9px 18px",fontSize:".88rem"}}>Get Started →</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{maxWidth:760,margin:"70px auto 50px",textAlign:"center",padding:"0 20px",position:"relative",zIndex:1}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"6px 18px",borderRadius:20,background:"rgba(0,188,212,0.1)",color:"var(--primary2)",fontSize:".78rem",fontWeight:700,letterSpacing:1,border:"1px solid rgba(0,188,212,0.25)",marginBottom:22}}>
          <img src="/logo.png" alt="" style={{width:16,height:16,objectFit:"contain"}}/>
          AI-Powered Smart Dictionary
        </div>

        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(2.2rem,5vw,3.8rem)",fontWeight:800,lineHeight:1.12,marginBottom:20}}>
          Your Smartest<br/>
          <span style={{background:"linear-gradient(135deg,var(--primary),var(--accent))",backgroundSize:"200%",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"gradMove 4s ease infinite"}}>Word Companion</span>
        </h1>

        <p style={{color:"var(--text2)",fontSize:"1.05rem",lineHeight:1.75,marginBottom:32,maxWidth:520,margin:"0 auto 32px"}}>
          Search millions of words, get AI explanations, discover words by mood, track your vocabulary journey with XP &amp; streaks — all free.
        </p>

        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:48}}>
          <button className="btn-primary" style={{padding:"13px 32px",fontSize:".97rem"}} onClick={()=>navigate("/register")}>Start for Free →</button>
          <button className="btn-ghost" style={{padding:"13px 32px",fontSize:".97rem"}} onClick={()=>navigate("/login")}>Sign In</button>
        </div>

        {/* Stats */}
        <div style={{display:"flex",gap:32,justifyContent:"center",flexWrap:"wrap",marginBottom:60}}>
          {[["200K+","Words"],["3-Level","AI Explain"],["Mood","Discovery"],["XP & Streak","System"]].map(([n,l])=>(
            <div key={l} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <span style={{fontSize:"1.3rem",fontWeight:800,background:"linear-gradient(135deg,var(--primary),var(--accent))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{n}</span>
              <span style={{color:"var(--text3)",fontSize:".75rem",fontWeight:600,letterSpacing:.8,textTransform:"uppercase"}}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feature cards */}
      <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",padding:"0 20px 70px",position:"relative",zIndex:1}}>
        {[
          {icon:"🧬",title:"Word DNA",desc:"Etymology, difficulty, emotion & fun facts",color:"var(--primary)"},
          {icon:"🎭",title:"Mood Discovery",desc:"Pick your mood, find matching words",color:"var(--accent)"},
          {icon:"⚡",title:"XP & Levels",desc:"Earn XP, level up your vocabulary",color:"var(--yellow)"},
          {icon:"🔥",title:"Daily Streaks",desc:"Build vocabulary habits with tracking",color:"var(--orange)"},
        ].map(c=>(
          <div key={c.title} style={{background:"var(--card)",border:`1px solid ${c.color}33`,borderRadius:18,padding:"22px 20px",width:190,animation:"float 4s ease-in-out infinite"}}>
            <div style={{fontSize:28,marginBottom:10}}>{c.icon}</div>
            <div style={{fontWeight:700,marginBottom:6,fontSize:".93rem",color:"var(--text)"}}>{c.title}</div>
            <div style={{color:"var(--text3)",fontSize:".8rem",lineHeight:1.5}}>{c.desc}</div>
          </div>
        ))}
      </div>

      <Footer/>
    </div>
  );
}
