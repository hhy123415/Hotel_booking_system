import { createContext } from "react";

export interface AuthState {
  isLoggedIn: boolean;
  username: string;
}

export interface AuthContextType {
  auth: AuthState;
  login: (username: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);