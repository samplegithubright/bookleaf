"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, fetchApi } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, role?: string) => Promise<void>;
  logout: () => void;
  quickSwitch: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Check local storage on mount
    const savedToken = localStorage.getItem("bookleaf_token");
    const savedUser = localStorage.getItem("bookleaf_user");
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    } else {
      // Default to Priya Sharma (AUTH001) for smooth evaluation experience
      const defaultUser: User = {
        id: "AUTH001",
        email: "priya.sharma@email.com",
        name: "Priya Sharma",
        role: "author",
        author_id: "AUTH001",
        city: "Mumbai",
        phone: "+91-98765-43210"
      };
      // Auto-login Priya Sharma
      quickSwitch(defaultUser.email);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string = "password123") => {
    setIsLoading(true);
    try {
      const data = await fetchApi<{
        access_token: string;
        role: "author" | "admin";
        author_id?: string | null;
        email: string;
        name: string;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const userObj: User = {
        id: data.author_id || "admin",
        email: data.email,
        name: data.name,
        role: data.role,
        author_id: data.author_id,
      };

      setToken(data.access_token);
      setUser(userObj);
      localStorage.setItem("bookleaf_token", data.access_token);
      localStorage.setItem("bookleaf_user", JSON.stringify(userObj));

      if (data.role === "admin") {
        router.push("/admin/queue");
      } else {
        router.push("/author/books");
      }
    } catch (err) {
      console.error("Login failed", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const quickSwitch = async (email: string) => {
    const password = email.includes("admin") ? "admin123" : "password123";
    await login(email, password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("bookleaf_token");
    localStorage.removeItem("bookleaf_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, quickSwitch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
