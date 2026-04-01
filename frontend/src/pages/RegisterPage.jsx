import { useState } from "react";
import Footer from "../components/Footer";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await register(form.name, form.email, form.password); navigate("/dashboard"); }
    catch (err) { setError(err?.response?.data?.message || "Registration failed. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)",padding:"24px 16px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",width:450,height:450,borderRadius:"50%",background:"radial-gradient(circle,rgba(76,175,80,0.1) 0%,transparent 70%)",bottom:"-20%",left:"-10%",pointerEvents:"none",animation:"orbMove 8s ease-in-out infinite"}}/>
      <div style={{background:"var(--card)",border:"1px solid var(--border2)",borderRadius:24,padding:"36px 30px",width:"100%",maxWidth:400,position:"relative",zIndex:1,boxShadow:"var(--shadow)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
          <div style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer"}} onClick={()=>navigate("/welcome")}>
            <img src="/logo.png" alt="Vocabix AI" style={{width:28,height:28,objectFit:"contain",filter:"drop-shadow(0 0 6px rgba(0,188,212,0.5))"}}/>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:"1.2rem",fontWeight:800,background:"linear-gradient(135deg,var(--text),var(--primary2))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Vocabix AI</span>
          </div>
          <button onClick={toggle} style={{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:9,padding:"6px 10px",color:"var(--text2)",fontSize:15}}>{theme==="dark"?"☀":"🌙"}</button>
        </div>
        <h2 style={{fontSize:"1.55rem",fontWeight:700,color:"var(--text)",marginBottom:5}}>Create account</h2>
        <p style={{color:"var(--text3)",fontSize:".88rem",marginBottom:24}}>Start your vocabulary journey today</p>
        {error && <div style={{background:"rgba(244,67,54,0.1)",border:"1px solid rgba(244,67,54,0.3)",color:"#ef5350",borderRadius:10,padding:"10px 14px",fontSize:".87rem",marginBottom:16}}>{error}</div>}
        <form onSubmit={handle} style={{display:"flex",flexDirection:"column",gap:14}}>
          {[["Full Name","text","Your name","name","name"],["Email","email","you@example.com","email","email"],["Password","password","Min 6 characters","password","new-password"]].map(([label,type,ph,key,ac])=>(
            <div key={key}>
              <label style={{fontSize:".82rem",fontWeight:600,color:"var(--text2)",display:"block",marginBottom:6}}>{label}</label>
              <input className="input-field" type={type} placeholder={ph} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} required minLength={key==="password"?6:undefined} autoComplete={ac}/>
            </div>
          ))}
          <button className="btn-primary" type="submit" disabled={loading} style={{width:"100%",padding:"13px",fontSize:".95rem",marginTop:4,borderRadius:12}}>
            {loading ? "Creating…" : "Create Account →"}
          </button>
        </form>
        <p style={{textAlign:"center",color:"var(--text3)",fontSize:".87rem",marginTop:20}}>
          Have account? <Link to="/login" style={{color:"var(--primary2)",fontWeight:600}}>Sign in</Link>
        </p>
      </div>
      <Footer/>
    </div>
  );
}
