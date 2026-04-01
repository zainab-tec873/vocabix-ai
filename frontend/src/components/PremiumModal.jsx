// ============================================
// Premium Upgrade Modal
// Jab free user AI use karne ki koshish kare
// ============================================

export default function PremiumModal({ onClose }) {
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()} className="slide-up">
        {/* Header */}
        <div style={S.header}>
          <div style={S.crown}>👑</div>
          <h2 style={S.title}>Premium Feature</h2>
          <p style={S.sub}>This feature is for Premium users only</p>
        </div>

        {/* Features List */}
        <div style={S.featuresBox}>
          <div style={S.featLabel}>What you get with Premium:</div>
          {[
            "✦ AI Explanations — 3 levels (Kid/Beginner/Expert)",
            "🧬 Word DNA — origin, emotion, fun facts",
            "◎ AI Quiz Generation",
            "♡ Unlimited Favorites",
            "◷ Full Search History + Heatmap",
            "⚡ Double XP on every search",
          ].map((f, i) => (
            <div key={i} style={S.featItem}>
              <span style={S.featCheck}>✓</span>
              <span style={S.featText}>{f}</span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div style={S.pricingRow}>
          <div style={S.priceCard}>
            <div style={S.planName}>Monthly</div>
            <div style={S.price}>Rs. 299<span style={S.per}>/month</span></div>
          </div>
          <div style={{...S.priceCard, ...S.priceCardBest}}>
            <div style={S.bestBadge}>Best Value</div>
            <div style={S.planName}>Yearly</div>
            <div style={S.price}>Rs. 1499<span style={S.per}>/year</span></div>
            <div style={S.saving}>Save Rs. 1,089!</div>
          </div>
        </div>

        {/* Contact Info */}
        <div style={S.contactBox}>
          <p style={S.contactText}>Contact us to activate Premium:</p>
          <div style={S.contactMethods}>
            <div style={S.contactItem}>📱 <strong>JazzCash / Easypaisa:</strong> 03XX-XXXXXXX</div>
            <div style={S.contactItem}>📧 <strong>Email:</strong> premium@vocabixai.com</div>
          </div>
          <p style={S.contactNote}>Send your transaction ID via email after payment — activated within 24 hours!</p>
        </div>

        {/* Buttons */}
        <div style={S.btnRow}>
          <button onClick={onClose} style={S.cancelBtn}>Maybe Later</button>
          <button className="btn-primary" style={{flex:1, padding:"12px"}}
            onClick={() => { window.open("mailto:premium@vocabixai.com?subject=Premium Activation", "_blank"); }}>
            👑 Get Premium →
          </button>
        </div>
      </div>
    </div>
  );
}

const S = {
  overlay:{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(4px)"},
  modal:{background:"var(--card)",border:"1px solid rgba(124,111,247,0.3)",borderRadius:22,padding:"32px 28px",width:"100%",maxWidth:460,boxShadow:"0 20px 60px rgba(0,0,0,0.5)"},
  header:{textAlign:"center",marginBottom:22},
  crown:{fontSize:"3rem",marginBottom:8},
  title:{fontFamily:"'Playfair Display',serif",fontSize:"1.6rem",fontWeight:800,color:"var(--text)",marginBottom:6},
  sub:{color:"var(--text3)",fontSize:".9rem"},
  featuresBox:{background:"var(--card2)",borderRadius:14,padding:"16px",marginBottom:18},
  featLabel:{fontSize:".75rem",fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"var(--text3)",marginBottom:10},
  featItem:{display:"flex",alignItems:"flex-start",gap:8,marginBottom:7},
  featCheck:{color:"var(--green)",fontWeight:700,flexShrink:0},
  featText:{color:"var(--text2)",fontSize:".87rem"},
  pricingRow:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16},
  priceCard:{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:14,padding:"14px",textAlign:"center",position:"relative"},
  priceCardBest:{border:"2px solid var(--primary)",background:"rgba(124,111,247,0.08)"},
  bestBadge:{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,var(--primary),var(--accent))",color:"#fff",fontSize:".65rem",fontWeight:700,padding:"2px 10px",borderRadius:10,whiteSpace:"nowrap"},
  planName:{color:"var(--text3)",fontSize:".8rem",fontWeight:600,marginBottom:4},
  price:{fontFamily:"'Playfair Display',serif",fontSize:"1.4rem",fontWeight:800,color:"var(--text)"},
  per:{fontSize:".8rem",color:"var(--text3)",fontWeight:400},
  saving:{color:"var(--green)",fontSize:".75rem",fontWeight:600,marginTop:4},
  contactBox:{background:"rgba(124,111,247,0.07)",border:"1px solid rgba(124,111,247,0.2)",borderRadius:12,padding:"14px",marginBottom:18},
  contactText:{color:"var(--text2)",fontSize:".85rem",fontWeight:600,marginBottom:8},
  contactMethods:{display:"flex",flexDirection:"column",gap:5,marginBottom:8},
  contactItem:{color:"var(--text2)",fontSize:".83rem"},
  contactNote:{color:"var(--text3)",fontSize:".78rem",fontStyle:"italic"},
  btnRow:{display:"flex",gap:10},
  cancelBtn:{background:"transparent",border:"1px solid var(--border2)",borderRadius:10,padding:"12px 16px",color:"var(--text3)",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:".87rem"},
};
