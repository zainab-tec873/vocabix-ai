import { useState } from "react";
import Footer from "../components/Footer";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function LoginPage() {
  const { login } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:"", password:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await login(form.email, form.password); navigate("/dashboard"); }
    catch (err) { setError(err?.response?.data?.message || "Login failed. Check your credentials."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:"100vh",width:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"var(--bg)",padding:"16px",position:"relative",overflow:"hidden",boxSizing:"border-box"}}>
      <div style={{position:"absolute",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,188,212,0.12) 0%,transparent 70%)",top:"-20%",right:"-10%",pointerEvents:"none"}}/>

      <div style={{background:"var(--card)",border:"1px solid var(--border2)",borderRadius:22,padding:"32px 24px",width:"100%",maxWidth:400,position:"relative",zIndex:1,boxShadow:"var(--shadow)",boxSizing:"border-box"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>navigate("/welcome")}>
            <img src="/logo.png" alt="Vocabix AI" style={{width:26,height:26,objectFit:"contain"}}/>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:"1.2rem",fontWeight:800,background:"linear-gradient(135deg,var(--text),var(--primary2))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Vocabix AI</span>
          </div>
          <button onClick={toggle} style={{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:8,padding:"6px 10px",color:"var(--text2)",fontSize:15}}>{theme==="dark"?"☀":"🌙"}</button>
        </div>

        <h2 style={{fontSize:"1.5rem",fontWeight:700,color:"var(--text)",marginBottom:4}}>Welcome back</h2>
        <p style={{color:"var(--text3)",fontSize:".88rem",marginBottom:20}}>Sign in to continue your journey</p>

        {error && <div style={{background:"rgba(244,67,54,0.1)",border:"1px solid rgba(244,67,54,0.3)",color:"#ef5350",borderRadius:10,padding:"10px 14px",fontSize:".86rem",marginBottom:16}}>{error}</div>}

        <form onSubmit={handle} style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={{fontSize:".81rem",fontWeight:600,color:"var(--text2)",display:"block",marginBottom:5}}>Email</label>
            <input className="input-field" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required autoComplete="email"/>
          </div>
          <div>
            <label style={{fontSize:".81rem",fontWeight:600,color:"var(--text2)",display:"block",marginBottom:5}}>Password</label>
            <input className="input-field" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required autoComplete="current-password"/>
          </div>
          <button className="btn-primary" type="submit" disabled={loading} style={{width:"100%",padding:"13px",fontSize:".95rem",marginTop:4}}>
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        <p style={{textAlign:"center",color:"var(--text3)",fontSize:".86rem",marginTop:18}}>
          No account? <Link to="/register" style={{color:"var(--primary2)",fontWeight:600}}>Create one free</Link>
        </p>
      </div>
      <div style={{marginTop:16,width:"100%",maxWidth:400}}>
        <Footer/>
      </div>
    </div>
  );
}