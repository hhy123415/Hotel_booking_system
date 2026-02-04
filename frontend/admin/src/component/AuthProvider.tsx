import React, { useState, type ReactNode } from "react";
import {
  AuthContext,
  type AuthState,
  type AuthContextType,
} from "./AuthContext";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    return {
      isLoggedIn: localStorage.getItem("isLoggedIn") === "true",
      username: localStorage.getItem("username") || "",
      isAdmin: localStorage.getItem("isAdmin") === "true", //该值仅用于页面显示用途，执行权限时需要进行后端验证
    };
  });

  const login = (username: string, isAdmin: boolean) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", username);
    localStorage.setItem("isAdmin", String(isAdmin));
    setAuth({
      isLoggedIn: true,
      username,
      isAdmin,
    });
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("isAdmin");
    setAuth({
      isLoggedIn: false,
      username: "",
      isAdmin: false,
    });
  };

  const value: AuthContextType = { auth, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
