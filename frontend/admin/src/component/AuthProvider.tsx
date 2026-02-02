import React, { useState, type ReactNode } from "react";
import { AuthContext, type AuthState, type AuthContextType } from "./AuthContext";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const username = localStorage.getItem("username") || "";
    return {
      isLoggedIn: loggedIn,
      username,
    };
  });

  const login = (username: string) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", username);
    setAuth({
      isLoggedIn: true,
      username,
    });
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    setAuth({
      isLoggedIn: false,
      username: "",
    });
  };

  const value: AuthContextType = { auth, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};