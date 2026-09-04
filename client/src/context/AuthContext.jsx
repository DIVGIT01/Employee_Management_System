import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() =>
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    const storedToken = localStorage.getItem("token");

    // No token means user is not logged in
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      // axios interceptor automatically adds:
      // Authorization: Bearer <token>
      const { data } = await api.get("/auth/session");

      setUser(data.user);
      setToken(storedToken);
    } catch (error) {
      console.error(
        "Session restore failed:",
        error.response?.data || error.message
      );

      // Only remove token when authentication is actually rejected
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (email, password, role_type) => {
    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
        role_type,
      });

      localStorage.setItem("token", data.token);

      setToken(data.token);
      setUser(data.user);

      return data.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return ctx;
}