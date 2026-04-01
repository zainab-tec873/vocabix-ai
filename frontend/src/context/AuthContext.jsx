import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Set base URL from environment variable (for production deployment)
const API_BASE = import.meta.env.VITE_API_URL || "";
if (API_BASE) {
  axios.defaults.baseURL = API_BASE;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem("vocabix_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
      axios.get("/api/auth/me")
        .then(r => {
          setUser(r.data.user);
          return axios.get("/api/premium/status");
        })
        .then(r => setIsPremium(r.data.isPremium))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post("/api/auth/login", { email, password });
    localStorage.setItem("vocabix_token", data.token);
    axios.defaults.headers.common["Authorization"] = "Bearer " + data.token;
    setToken(data.token);
    setUser(data.user);
    try {
      const ps = await axios.get("/api/premium/status");
      setIsPremium(ps.data.isPremium);
    } catch {}
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post("/api/auth/register", { name, email, password });
    localStorage.setItem("vocabix_token", data.token);
    axios.defaults.headers.common["Authorization"] = "Bearer " + data.token;
    setToken(data.token);
    setUser(data.user);
    setIsPremium(false);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("vocabix_token");
    delete axios.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
    setIsPremium(false);
  };

  const refreshPremium = async () => {
    try {
      const r = await axios.get("/api/premium/status");
      setIsPremium(r.data.isPremium);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, token, isPremium, loading, login, register, logout, refreshPremium }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
