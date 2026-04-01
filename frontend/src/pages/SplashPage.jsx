import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SplashPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  useEffect(() => {
    const t = setTimeout(() => navigate(user ? "/dashboard" : "/welcome"), 2600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={S.wrap}>
      {/* Background orbs */}
      <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,188,212,0.15) 0%,transparent 70%)",top:"-15%",left:"-10%",animation:"orbMove 8s ease-in-out infinite"}}/>
      <div style={{position:"absolute",width:350,height:350,borderRadius:"50%",background:"radial-gradient(circle,rgba(76,175,80,0.1) 0%,transparent 70%)",bottom:"-10%",right:"-5%",animation:"orbMove 10s ease-in-out infinite reverse"}}/>

      <div style={S.center}>
        {/* Logo */}
        <div style={S.logoWrap}>
          <img src="/logo.png" alt="Vocabix AI" style={S.logoImg}/>
        </div>

        {/* Name */}
        <h1 style={S.name}>Vocabix AI</h1>
        <p style={S.tagline}>AI-POWERED DICTIONARY</p>

        {/* Loading dots */}
        <div style={{display:"flex",gap:8,marginTop:12}}>
          {[0,1,2].map(i=>(
            <div key={i} style={{width:8,height:8,borderRadius:"50%",background:"var(--primary)",animation:`pulse 1.4s ease-in-out ${i*.22}s infinite`}}/>
          ))}
        </div>
      </div>
    </div>
  );
}

const S = {
  wrap:{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"},
  center:{display:"flex",flexDirection:"column",alignItems:"center",gap:12,zIndex:1},
  logoWrap:{width:100,height:100,borderRadius:28,background:"rgba(0,188,212,0.1)",border:"1px solid rgba(0,188,212,0.3)",display:"flex",alignItems:"center",justifyContent:"center",animation:"float 3s ease-in-out infinite,glow 3s ease-in-out infinite",boxShadow:"0 0 40px rgba(0,188,212,0.3)"},
  logoImg:{width:72,height:72,objectFit:"contain",filter:"drop-shadow(0 0 12px rgba(0,188,212,0.6))"},
  name:{fontFamily:"'Playfair Display',serif",fontSize:"2.8rem",fontWeight:800,background:"linear-gradient(135deg,#00bcd4,#26c6da,#4caf50)",backgroundSize:"200%",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"gradMove 4s ease infinite"},
  tagline:{color:"var(--text3)",fontSize:".78rem",letterSpacing:3,textTransform:"uppercase",fontWeight:600},
};
