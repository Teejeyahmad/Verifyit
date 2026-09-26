import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [business, setBusiness] = useState(() => {
    try {
      const s = localStorage.getItem("vi_business");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    // const token = localStorage.getItem('vi_token');
    // if (!token) { setLoading(false); return; }

    api
      .get("/auth/dashboard")
      .then((r) => {
        setBusiness(r.data.business);
        localStorage.setItem("vi_business", JSON.stringify(r.data.business));
      })
      .catch(() => {
        // localStorage.removeItem('vi_token');
        localStorage.removeItem("vi_business");
        setBusiness(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (biz) => {
    //localStorage.setItem('vi_token', token);
    localStorage.setItem("vi_business", JSON.stringify(biz));
    setLoggingOut(false);
    setBusiness(biz);
  };

  const logout = async () => {
    setLoggingOut(true);
    localStorage.removeItem("vi_business");
    setBusiness(null);
    try {
      await api.post("/auth/logout");
    } catch (_) {}
    //localStorage.removeItem('vi_token');
  };

  const refreshBusiness = async () => {
    try {
      const r = await api.get("/auth/dashboard");
      setBusiness(r.data.business);
      localStorage.setItem("vi_business", JSON.stringify(r.data.business));
    } catch (_) {}
  };

  return (
    <AuthContext.Provider
      value={{ business, loading, loggingOut, login, logout, refreshBusiness }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
