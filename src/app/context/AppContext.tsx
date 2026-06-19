import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Member, Admin } from "../types";
import { MEMBERS, ADMINS, CURRENT_USER_ID } from "../components/mockData";

interface AppContextValue {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  toggleDark: () => void;
  lang: "fr" | "en";
  setLang: (v: "fr" | "en") => void;
  toggleLang: () => void;
  user: Member | null;
  setUser: (u: Member | null) => void;
  admin: Admin | null;
  setAdmin: (a: Admin | null) => void;
  loginUser: (memberId: string) => void;
  loginAdmin: (adminId: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [user, setUser] = useState<Member | null>(() => MEMBERS.find((m) => m.id === CURRENT_USER_ID) ?? null);
  const [admin, setAdmin] = useState<Admin | null>(null);

  const toggleDark = useCallback(() => setDarkMode((d) => !d), []);
  const toggleLang = useCallback(() => setLang((l) => (l === "fr" ? "en" : "fr")), []);

  const loginUser = useCallback((memberId: string) => {
    const found = MEMBERS.find((m) => m.id === memberId);
    if (found) setUser(found);
  }, []);

  const loginAdmin = useCallback((adminId: string) => {
    const found = ADMINS.find((a) => a.id === adminId);
    if (found) setAdmin(found);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAdmin(null);
  }, []);

  return (
    <AppContext.Provider value={{
      darkMode, setDarkMode, toggleDark,
      lang, setLang, toggleLang,
      user, setUser, admin, setAdmin,
      loginUser, loginAdmin, logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
