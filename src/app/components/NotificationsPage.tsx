import { useState } from "react";
import { Bell, CheckCircle, Clock, Trophy, Send, CreditCard, CheckCheck, ArrowRight } from "lucide-react";
import { NOTIFICATIONS, CURRENT_USER_ID } from "./mockData";
import { useAppContext } from "../context/AppContext";

const NOTIF_ICONS: Record<string, React.ElementType> = {
  join_request: Send,
  entry_fee: CreditCard,
  contribution: CheckCircle,
  payout: Trophy,
  completion: CheckCheck,
  general: Bell,
};

const NOTIF_COLORS: Record<string, string> = {
  join_request: "#6E3A9A",
  entry_fee: "#F2994A",
  contribution: "#4CAF68",
  payout: "#F2994A",
  completion: "#4CAF68",
  general: "#6E3A9A",
};

export default function NotificationsPage() {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const userNotifs = NOTIFICATIONS.filter((n) => n.userId === CURRENT_USER_ID);
  const displayed = filter === "all" ? userNotifs : userNotifs.filter((n) => !n.read);
  const unreadCount = userNotifs.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    NOTIFICATIONS.forEach((n) => { if (n.userId === CURRENT_USER_ID) n.read = true; });
  };

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Notifications" : "Notifications"}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0
              ? `${unreadCount} ${fr ? "non lue(s)" : "unread"}`
              : fr ? "Tout est à jour" : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
            <CheckCheck size={13} /> {fr ? "Tout marquer lu" : "Mark all read"}
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "all", label: fr ? "Toutes" : "All" },
          { key: "unread", label: fr ? "Non lues" : "Unread" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${filter === f.key ? "bg-[#4CAF68] text-white border-[#4CAF68]" : "bg-card border-border text-muted-foreground hover:text-foreground"}`}
          >
            {f.label}
            {f.key === "unread" && unreadCount > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] ${filter === f.key ? "bg-white/20" : "bg-[#4CAF68] text-white"}`}>{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {displayed.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <Bell size={32} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{fr ? "Aucune notification" : "No notifications"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((n) => {
            const Icon = NOTIF_ICONS[n.type] || Bell;
            const color = NOTIF_COLORS[n.type] || "#6E3A9A";
            return (
              <div
                key={n.id}
                className={`bg-card rounded-2xl border p-4 transition-all hover:border-[#4CAF68]/30 ${n.read ? "border-border" : "border-[#4CAF68]/20"}`}
                style={!n.read ? { borderLeftColor: color, borderLeftWidth: 3 } : {}}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{fr ? n.title : n.titleEn || n.title}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        {!n.read && <div className="w-2 h-2 rounded-full" style={{ background: color }} />}
                        <span className="text-xs text-muted-foreground">{n.createdAt.split("T")[0]}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{fr ? n.message : n.messageEn || n.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
