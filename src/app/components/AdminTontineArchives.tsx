import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Archive, Users, Calendar, Download, FileText, Eye } from "lucide-react";
import { ARCHIVES, formatXAF } from "./mockData";
import { useAppContext } from "../context/AppContext";

export default function AdminTontineArchives() {
  const navigate = useNavigate();
  const { lang } = useAppContext();
  const fr = lang === "fr";

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate("/admin/tontines")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={16} /> {fr ? "Retour aux tontines" : "Back to tontines"}
      </button>

      <div className="mb-6">
        <h2 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>{fr ? "Archives des tontines" : "Tontine archives"}</h2>
        <p className="text-sm text-muted-foreground mt-1">{ARCHIVES.length} {fr ? "tontine(s) archivée(s)" : "archived tontine(s)"}</p>
      </div>

      {ARCHIVES.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <Archive size={32} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">{fr ? "Aucune tontine archivée" : "No archived tontines"}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ARCHIVES.map((arc) => (
            <div key={arc.id} className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{arc.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{arc.id} · {arc.frequency === "weekly" ? (fr ? "Hebdomadaire" : "Weekly") : arc.frequency === "biweekly" ? (fr ? "Bihebdomadaire" : "Biweekly") : (fr ? "Mensuel" : "Monthly")}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/tontines/archives/${arc.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Eye size={13} /> {fr ? "Voir" : "View"}
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Download size={13} /> PDF
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <FileText size={13} /> Excel
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{fr ? "Participants" : "Participants"}</p>
                  <p className="text-sm font-bold mt-0.5">{arc.members.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{fr ? "Durée" : "Duration"}</p>
                  <p className="text-sm font-bold mt-0.5">{arc.total_weeks} {fr ? "semaines" : "weeks"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{fr ? "Début" : "Start"}</p>
                  <p className="text-sm font-bold mt-0.5">{arc.start_date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{fr ? "Fin" : "End"}</p>
                  <p className="text-sm font-bold mt-0.5">{arc.end_date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{fr ? "Total collecté" : "Total collected"}</p>
                  <p className="text-sm font-bold mt-0.5 text-[#4CAF68]" style={{ fontFamily: "Geist Mono, monospace" }}>{formatXAF(arc.total_collected)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
