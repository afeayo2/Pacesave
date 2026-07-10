import { createContext, useContext, useState, useCallback } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("gt_token"));
  const [role, setRole] = useState(localStorage.getItem("gt_role"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("gt_user");
    return raw ? JSON.parse(raw) : null;
  });

  const login = useCallback((data) => {
    localStorage.setItem("gt_token", data.token);
    localStorage.setItem("gt_role", data.role);
    localStorage.setItem("gt_user", JSON.stringify(data.user));
    setToken(data.token);
    setRole(data.role);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("gt_token");
    localStorage.removeItem("gt_role");
    localStorage.removeItem("gt_user");
    setToken(null);
    setRole(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await api.get("/auth/me");
    localStorage.setItem("gt_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  return (
    <AuthContext.Provider value={{ token, role, user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
