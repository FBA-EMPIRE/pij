import { useState } from "react";
import { Bell, CheckCheck, Send, Info, AlertTriangle, CheckCircle, Users, Mail, ArrowRight } from "lucide-react";
import { NOTIFICATIONS, MEMBERS, sendNotification, formatXAF } from "./mockData";
import { useAppContext } from "../context/AppContext";

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  info: { icon: Info, color: "#6E3A9A", bg: "#F0E8FF" },
  warning: { icon: AlertTriangle, color: "#F2994A", bg: "#FEF3C7" },
  success: { icon: CheckCircle, color: "#4CAF68", bg: "#E8F5EC" },
};

export default function AdminNotifications() {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [targetMode, setTargetMode] = useState<"single" | "multiple" | "all">("all");
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [notifType, setNotifType] = useState<"info" | "warning" | "success">("info");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const displayed = filter === "all" ? NOTIFICATIONS : NOTIFICATIONS.filter((n) => !n.read);
  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    NOTIFICATIONS.forEach((n) => { n.read = true; });
  };

  const handleSend = () => {
    if (!title || !message) return;
    setSending(true);

    const targets: string[] = [];
    if (targetMode === "all") {
      MEMBERS.forEach((m) => targets.push(m.id));
    } else if (targetMode === "single" && selectedMember) {
      targets.push(selectedMember);
    } else if (targetMode === "multiple") {
      targets.push(...selectedMembers);
    }

    targets.forEach((userId) => {
      sendNotification({
        userId,
        type: notifType,
        title: fr ? title : title,
        titleEn: !fr ? title : title,
        message: fr ? message : message,
        messageEn: !fr ? message : message,
      });
    });

    setTitle("");
    setMessage("");
    setSelectedMember("");
    setSelectedMembers([]);
    setTimeout(() => setSending(false), 500);
  };

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "DM Sans, sans-serif" }}>
            {fr ? "Centre de notifications" : "Notification Center"}
          </h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Left: notification list */}
        <div>
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

          <div className="space-y-2">
            {displayed.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border p-8 text-center">
                <Bell size={32} className="mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">{fr ? "Aucune notification" : "No notifications"}</p>
              </div>
            ) : (
              displayed.map((n) => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    className={`bg-card rounded-2xl border p-4 transition-all hover:border-[#4CAF68]/30 ${n.read ? "border-border" : "border-[#4CAF68]/20"}`}
                    style={!n.read ? { borderLeftColor: cfg.color, borderLeftWidth: 3 } : {}}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                        <Icon size={16} style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">{fr ? n.title : n.titleEn || n.title}</p>
                          <span className="text-xs text-muted-foreground shrink-0">{n.createdAt.split("T")[0]}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{fr ? n.message : n.messageEn || n.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Send notification */}
        <div className="bg-card rounded-2xl border border-border p-5 h-fit sticky top-24">
          <div className="flex items-center gap-2 mb-4">
            <Send size={15} color="#6E3A9A" />
            <h3 className="text-sm font-semibold" style={{ fontFamily: "DM Sans, sans-serif" }}>
              {fr ? "Envoyer une notification" : "Send notification"}
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">{fr ? "Destinataires" : "Target"}</label>
              <div className="flex gap-2 mb-2">
                {[
                  { key: "all" as const, label: fr ? "Tous" : "All" },
                  { key: "multiple" as const, label: fr ? "Plusieurs" : "Multiple" },
                  { key: "single" as const, label: fr ? "Un membre" : "Single" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => { setTargetMode(t.key); setSelectedMember(""); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${targetMode === t.key ? "bg-[#6E3A9A] text-white border-[#6E3A9A]" : "bg-muted border-border text-muted-foreground"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {targetMode === "single" && (
                <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#6E3A9A]/40">
                  <option value="">{fr ? "Sélectionner un membre" : "Select a member"}</option>
                  {MEMBERS.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
                  ))}
                </select>
              )}
              {targetMode === "multiple" && (
                <div className="max-h-32 overflow-y-auto space-y-1 border border-border rounded-xl p-2">
                  {MEMBERS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => toggleMember(m.id)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all ${selectedMembers.includes(m.id) ? "bg-[#F0E8FF] text-[#6E3A9A]" : "hover:bg-muted"}`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">{fr ? "Type" : "Type"}</label>
              <div className="flex gap-2">
                {(["info", "warning", "success"] as const).map((t) => {
                  const cfg = TYPE_CONFIG[t];
                  return (
                    <button
                      key={t}
                      onClick={() => setNotifType(t)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${notifType === t ? "text-white" : "text-muted-foreground bg-muted border-border"}`}
                      style={notifType === t ? { background: cfg.color, borderColor: cfg.color } : {}}
                    >
                      <cfg.icon size={12} />
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">{fr ? "Titre" : "Title"}</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#6E3A9A]/40"
                placeholder={fr ? "Titre de la notification" : "Notification title"} />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">{fr ? "Message" : "Message"}</label>
              <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#6E3A9A]/40 resize-none"
                placeholder={fr ? "Contenu du message..." : "Message content..."} />
            </div>

            <button
              onClick={handleSend}
              disabled={!title || !message || (targetMode === "single" && !selectedMember) || sending}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-all"
              style={{ background: "linear-gradient(135deg, #6E3A9A, #9B6FCA)" }}
            >
              <Send size={15} />
              {sending ? (fr ? "Envoi..." : "Sending...") : (fr ? "Envoyer" : "Send")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
