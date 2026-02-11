import React, { useState, useEffect, type ReactNode } from "react";
import {
  AuthContext,
  type AuthState,
  type AuthContextType,
} from "./AuthContext";
import api from "../api/axios";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    return {
      isLoggedIn: false,
      user_id: "",
      username: "",
      isAdmin: false,
    };
  });

  useEffect(() => {
    // 页面刷新时，从服务器确认身份
    const checkAuthStatus = async () => {
      try {
        const res = await api.get("/me");
        if (res.data.success) {
          setAuth({
            isLoggedIn: true,
            user_id: res.data.user.user_id,
            username: res.data.user.username,
            isAdmin: res.data.user.isAdmin,
          });
        }
      } catch (err) {
        console.log(err);
      }
    };
    checkAuthStatus();
  }, []);

  const login = (user_id: string, username: string, isAdmin: boolean) => {
    setAuth({ isLoggedIn: true, user_id, username, isAdmin });
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } finally {
      setAuth({
        isLoggedIn: false,
        user_id: "",
        username: "",
        isAdmin: false,
      });
    }
  };

  const value: AuthContextType = { auth, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
