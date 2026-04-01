import { useState } from "react";
import axios from "axios";

const ST = { IDLE:"idle", LOADING:"loading", PLAYING:"playing", DONE:"done" };

export default function QuizPage() {
  const [state, setState] = useState(ST.IDLE);
  const [quiz, setQuiz] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [count, setCount] = useState(5);

  const start = async () => {
    setState(ST.LOADING);
    try {
      const { data } = await axios.get("/api/dictionary/quiz?limit=" + count);
      if (!data.data?.length) throw new Error();
      setQuiz(data.data); setIdx(0); setScore(0); setAnswers([]); setSelected(null);
      setState(ST.PLAYING);
    } catch { alert("Not enough words in DB. Search some words first!"); setState(ST.IDLE); }
  };

  const pick = (opt) => {
    if (selected) return;
    setSelected(opt);
    const correct = opt === quiz[idx].correctAnswer;
    if (correct) setScore(s => s + 1);
    setAnswers(a => [...a, { word: quiz[idx].word, chosen: opt, correct: quiz[idx].correctAnswer, isCorrect: correct }]);
  };

  const next = () => {
    if (idx + 1 >= quiz.length) { submitXP(); setState(ST.DONE); return; }
    setIdx(i => i + 1); setSelected(null);
  };

  const submitXP = async () => {
    try { await axios.post("/api/dictionary/quiz/xp", { score, total: quiz.length }); } catch {}
  };

  const pct = quiz.length > 0 ? Math.round((score / quiz.length) * 100) : 0;

  if (state === ST.IDLE) return (
    <div style={S.wrap} className="fade-in">
      <h1 style={S.title}>Vocabulary Quiz</h1>
      <p style={S.sub}>Test your knowledge and earn XP points</p>
      <div style={S.setupCard}>
        <div style={{fontSize:48,marginBottom:8}}>⚡</div>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.5rem",fontWeight:800,color:"var(--text)",marginBottom:8}}>Quick Quiz</h2>
        <p style={{color:"var(--text3)",fontSize:".9rem",marginBottom:22}}>How many questions?</p>
        <div style={{display:"flex",gap:10,marginBottom:22}}>
          {[5,10,15].map(n=>(
            <button key={n} onClick={() => setCount(n)} style={{background:count===n?"rgba(124,111,247,0.2)":"var(--card2)",border:count===n?"1px solid rgba(124,111,247,0.5)":"1px solid var(--border)",borderRadius:10,padding:"10px 26px",color:count===n?"var(--primary2)":"var(--text2)",fontSize:"1rem",fontWeight:700,cursor:"pointer",transition:"all .2s"}}>{n}</button>
          ))}
        </div>
        <p style={{color:"var(--text3)",fontSize:".8rem",marginBottom:18}}>Earn up to {count===5?25:count===10?50:75} XP for perfect score!</p>
        <button className="btn-primary" onClick={start} style={{padding:"13px 40px",fontSize:"1rem"}}>Start Quiz →</button>
      </div>
    </div>
  );

  if (state === ST.LOADING) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",gap:16}}>
      <div style={{width:44,height:44,border:"3px solid var(--primary)",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
      <p style={{color:"var(--text2)"}}>Preparing your quiz…</p>
    </div>
  );

  if (state === ST.PLAYING) {
    const q = quiz[idx];
    return (
      <div style={S.wrap} className="fade-in">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:"var(--text3)",fontSize:".88rem"}}>Question {idx+1} / {quiz.length}</span>
          <span style={{background:"rgba(124,111,247,0.15)",color:"var(--primary2)",borderRadius:20,padding:"4px 14px",fontSize:".87rem",fontWeight:700}}>Score: {score}</span>
        </div>
        <div style={{background:"var(--card3)",borderRadius:4,height:5,overflow:"hidden"}}>
          <div style={{height:"100%",background:"linear-gradient(90deg,var(--primary),var(--accent))",borderRadius:4,width:(idx/quiz.length*100)+"%",transition:"width .4s"}}/>
        </div>
        <div style={{background:"linear-gradient(135deg,rgba(124,111,247,0.1),rgba(244,114,182,0.06))",border:"1px solid rgba(124,111,247,0.2)",borderRadius:18,padding:"26px 28px"}}>
          <p style={{color:"var(--text3)",fontSize:".85rem",marginBottom:8}}>What is the meaning of:</p>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"2.2rem",fontWeight:800,color:"var(--text)"}}>{q.word}</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:10}}>
          {q.options.map((opt, i) => {
            let bg = "var(--card)", border = "1px solid var(--border)", color = "var(--text2)";
            if (selected) {
              if (opt === q.correctAnswer) { bg="rgba(74,222,128,0.12)"; border="1px solid rgba(74,222,128,0.4)"; color="var(--green)"; }
              else if (opt === selected) { bg="rgba(251,113,133,0.12)"; border="1px solid rgba(251,113,133,0.4)"; color="#fb7185"; }
            }
            return (
              <button key={i} onClick={() => pick(opt)} disabled={!!selected}
                style={{background:bg,border,borderRadius:14,padding:"14px 16px",color,fontSize:".88rem",fontWeight:500,cursor:selected?"default":"pointer",display:"flex",alignItems:"flex-start",gap:10,textAlign:"left",transition:"all .2s"}}>
                <span style={{width:24,height:24,borderRadius:"50%",background:"rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:".72rem",fontWeight:700,flexShrink:0}}>{String.fromCharCode(65+i)}</span>
                <span style={{lineHeight:1.4,fontSize:".86rem"}}>{opt}</span>
              </button>
            );
          })}
        </div>
        {selected && (
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",background:selected===q.correctAnswer?"rgba(74,222,128,0.08)":"rgba(251,113,133,0.08)",border:`1px solid ${selected===q.correctAnswer?"rgba(74,222,128,0.3)":"rgba(251,113,133,0.3)"}`,borderRadius:12,flexWrap:"wrap"}}>
            <span style={{color:selected===q.correctAnswer?"var(--green)":"#fb7185",fontWeight:700}}>{selected===q.correctAnswer?"✓ Correct! +5 XP":"✗ Incorrect"}</span>
            {selected !== q.correctAnswer && <span style={{color:"var(--text3)",fontSize:".87rem"}}>Answer: {q.correctAnswer.substring(0,60)}…</span>}
            <button className="btn-primary" onClick={next} style={{marginLeft:"auto",padding:"8px 22px",fontSize:".87rem"}}>{idx+1<quiz.length?"Next →":"Finish"}</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={S.wrap} className="fade-in">
      <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:22,padding:"40px",display:"flex",flexDirection:"column",alignItems:"center",gap:14,textAlign:"center"}}>
        <div style={{fontSize:"3.5rem"}}>{pct>=80?"🏆":pct>=50?"👍":"💪"}</div>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.8rem",fontWeight:800,color:"var(--text)"}}>{pct>=80?"Excellent!":pct>=50?"Good Job!":"Keep Practicing!"}</h2>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:"4rem",fontWeight:800,background:"linear-gradient(135deg,var(--primary),var(--accent))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:1}}>
          {score}<span style={{color:"var(--text3)",fontSize:"1.5rem"}}>/{quiz.length}</span>
        </div>
        <div style={{color:"var(--text3)"}}>Correct — {pct}% · +{Math.round((score/quiz.length)*50)} XP earned</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:8,width:"100%",maxWidth:400,marginTop:8}}>
          {answers.map((a,i) => (
            <div key={i} style={{background:"var(--card2)",border:`1px solid ${a.isCorrect?"rgba(74,222,128,0.25)":"rgba(251,113,133,0.25)"}`,borderRadius:10,padding:"9px 14px",display:"flex",gap:8,alignItems:"center",fontSize:".87rem"}}>
              <span style={{color:a.isCorrect?"var(--green)":"#fb7185",fontWeight:700}}>{a.isCorrect?"✓":"✗"}</span>
              <span style={{fontWeight:600}}>{a.word}</span>
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={()=>setState(ST.IDLE)} style={{padding:"12px 32px",marginTop:8}}>Play Again →</button>
      </div>
    </div>
  );
}

const S = {
  wrap:{display:"flex",flexDirection:"column",gap:18,maxWidth:680,margin:"0 auto"},
  title:{fontFamily:"'Playfair Display',serif",fontSize:"2rem",fontWeight:800,color:"var(--text)"},
  sub:{color:"var(--text3)",fontSize:".9rem",marginTop:-12},
  setupCard:{background:"var(--card)",border:"1px solid var(--border)",borderRadius:20,padding:"36px",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"},
};
