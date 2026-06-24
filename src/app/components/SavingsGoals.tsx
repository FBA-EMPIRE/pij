import { useState, useEffect } from "react";
import { Plus, Calendar, Bike, House, Book, Briefcase, Shield, Plane, Car, Pill, GraduationCap, Sprout, Baby, Dumbbell } from "lucide-react";
import { getCurrentUserId } from "../lib/supabase/queries";
import { supabase } from "../lib/supabase/client";
import { formatXAF } from "../lib/format";
import GoalDetailModal from "./GoalDetailModal";
import type { SavingsGoal } from "../types";
import { useAppContext } from "../context/AppContext";

export default function SavingsGoals() {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [showCreate, setShowCreate] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    getCurrentUserId().then(async (userId) => {
      const { data } = await supabase.from("savings_goals").select("*").eq("user_id", userId);
      if (data) setGoals(data);
    }).catch(() => {});
  }, []);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Objectifs d'épargne" : "Savings goals"}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{goals.length} {fr ? "objectifs actifs" : "active goals"}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all w-full sm:w-auto min-h-[44px]" style={{ background: "#4CAF68" }}>
          <Plus size={16} /> {fr ? "Nouvel objectif" : "New goal"}
        </button>
      </div>

      {/* Goals grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {goals.map((goal) => {
          const pct = Math.round((goal.current / goal.target) * 100);
          return (
            <button key={goal.id} onClick={() => setSelectedGoal(goal)} className="bg-card rounded-2xl border border-border p-4 sm:p-6 hover:border-[#4CAF68]/40 transition-all cursor-pointer group text-left w-full">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-3xl">{goal.icon}</span>
                <div>
                  <p className="font-medium text-sm">{goal.name}</p>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                    <Calendar size={11} />
                    {goal.deadline}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">{fr ? "Progression" : "Progress"}</span>
                  <span className="font-bold" style={{ color: goal.color, fontFamily: "Geist Mono, monospace" }}>{pct}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: goal.color }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{fr ? "Épargné" : "Saved"}</span>
                  <span className="font-semibold" style={{ fontFamily: "Geist Mono, monospace", color: goal.color }}>{formatXAF(goal.current)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{fr ? "Objectif" : "Target"}</span>
                  <span className="font-medium" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(goal.target)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                  <span className="text-muted-foreground">{fr ? "Manquant" : "Remaining"}</span>
                  <span className="font-medium text-[#E5484D]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(goal.target - goal.current)}</span>
                </div>
              </div>
            </button>
          );
        })}

        {/* Add goal card */}
        <button onClick={() => setShowCreate(true)} className="bg-card rounded-2xl border-2 border-dashed border-border p-4 sm:p-6 flex flex-col items-center justify-center gap-3 hover:border-[#4CAF68]/50 hover:bg-[#E8F5EC]/30 transition-all group min-h-[160px] sm:min-h-[200px]">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-[#E8F5EC] transition-colors">
            <Plus size={18} className="text-muted-foreground group-hover:text-[#4CAF68]" />
          </div>
          <p className="text-sm text-muted-foreground group-hover:text-[#4CAF68] font-medium">{fr ? "Ajouter un objectif" : "Add a goal"}</p>
        </button>
      </div>

      {/* Create Goal Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md">
            <h3 className="mb-1" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Créer un objectif d'épargne" : "Create savings goal"}</h3>
            <p className="text-sm text-muted-foreground mb-5">{fr ? "Définissez votre cible et commencez à épargner." : "Set your target and start saving."}</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{fr ? "Nom de l'objectif" : "Goal name"}</label>
                <input className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder={fr ? "Ex: Acheter une moto" : "E.g. Buy a motorbike"} />
              </div>
              <div>
                <label className="text-sm font-medium">{fr ? "Montant cible (XAF)" : "Target amount (XAF)"}</label>
                <input type="number" className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder="1 000 000" />
              </div>
              <div>
                <label className="text-sm font-medium">{fr ? "Date d'échéance" : "Target date"}</label>
                <input type="date" className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
              </div>
              <div>
                <label className="text-sm font-medium">{fr ? "Icône" : "Icon"}</label>
                <div className="mt-1.5 grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {[
                    Bike, House, Book, Briefcase,
                    Shield, Plane, Car, Pill,
                    GraduationCap, Sprout, Baby, Dumbbell,
                  ].map((Icon, i) => (
                    <button key={i} className="flex items-center justify-center py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-[#4CAF68] hover:bg-[#E8F5EC] transition-all min-h-[44px]">
                      <Icon size={20} className="sm:w-6 sm:h-6" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground">
                {fr ? "Annuler" : "Cancel"}
              </button>
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90" style={{ background: "#4CAF68" }}>
                {fr ? "Créer l'objectif" : "Create goal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedGoal && (
        <GoalDetailModal goal={selectedGoal} onClose={() => setSelectedGoal(null)} />
      )}
    </div>
  );
}
