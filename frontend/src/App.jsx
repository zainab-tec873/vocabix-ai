import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import SplashPage    from "./pages/SplashPage";
import WelcomePage   from "./pages/WelcomePage";
import LoginPage     from "./pages/LoginPage";
import RegisterPage  from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"var(--bg)",gap:16}}>
      <img src="/logo.png" alt="Vocabix AI" style={{width:56,height:56,objectFit:"contain",filter:"drop-shadow(0 0 12px rgba(0,188,212,0.5))",animation:"float 2s ease-in-out infinite"}}/>
      <div style={{width:36,height:36,border:"3px solid rgba(0,188,212,0.3)",borderTopColor:"var(--primary)",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
    </div>
  );
  return user ? children : <Navigate to="/login" replace/>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"           element={<SplashPage/>}/>
            <Route path="/welcome"    element={<WelcomePage/>}/>
            <Route path="/login"      element={<LoginPage/>}/>
            <Route path="/register"   element={<RegisterPage/>}/>
            <Route path="/dashboard/*" element={<PrivateRoute><DashboardPage/></PrivateRoute>}/>
            <Route path="*"           element={<Navigate to="/" replace/>}/>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
