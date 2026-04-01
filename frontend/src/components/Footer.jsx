export default function Footer() {
  return (
    <footer style={S.footer}>
      <div style={S.inner}>
        <div style={S.left}>
          <img src="/logo.png" alt="Vocabix AI" style={{width:18,height:18,objectFit:"contain",filter:"drop-shadow(0 0 4px rgba(0,188,212,0.5))"}}/>
          <span style={S.logo}>Vocabix AI</span>
          <span style={S.sep}>—</span>
          <span style={S.credit}>AI-Powered Dictionary</span>
        </div>
        <div style={S.right}>
          By <span style={S.name}>Zainab Fatima</span>
          <span style={S.sep}>·</span>
          <span style={S.year}>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

const S = {
  footer:{ borderTop:"1px solid var(--border)", background:"var(--bg2)", padding:"14px 24px", marginTop:"auto" },
  inner:{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8, maxWidth:1100, margin:"0 auto" },
  left:{ display:"flex", alignItems:"center", gap:7 },
  logo:{ color:"var(--primary)", fontWeight:700, fontSize:".88rem" },
  sep:{ color:"var(--text3)", fontSize:".82rem" },
  credit:{ color:"var(--text3)", fontSize:".8rem" },
  right:{ display:"flex", alignItems:"center", gap:6, color:"var(--text3)", fontSize:".8rem" },
  name:{ color:"var(--primary2)", fontWeight:700 },
  year:{ color:"var(--text3)" },
};
