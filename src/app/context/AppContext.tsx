import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { supabase } from "../lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  role?: "member" | "admin" | "super_admin";
  avatar_url?: string;
  kyc_status?: string;
  [key: string]: any;
}

interface AppContextValue {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  toggleDark: () => void;
  lang: "fr" | "en";
  setLang: (v: "fr" | "en") => void;
  toggleLang: () => void;
  user: User | null;
  userProfile: UserProfile | null;
  sessionLoading: boolean;
  profileLoading: boolean;
  setUser: (u: User | null) => void;
  setUserProfile: (p: UserProfile | null) => void;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setSessionLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      setSessionLoading(false);
      if (u) fetchProfile(u.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id);
      else setUserProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    if (!supabase) return;
    setProfileLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (!error && data) {
      setUserProfile(data as UserProfile);
    }
    setProfileLoading(false);
  };

  const toggleDark = useCallback(() => setDarkMode((d) => !d), []);
  const toggleLang = useCallback(() => setLang((l) => (l === "fr" ? "en" : "fr")), []);

  const logout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
  }, []);

  return (
    <AppContext.Provider value={{
      darkMode, setDarkMode, toggleDark,
      lang, setLang, toggleLang,
      user, userProfile, sessionLoading, profileLoading,
      setUser, setUserProfile,
      logout,
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
