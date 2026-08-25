import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Video, Link as LinkIcon, Download } from "lucide-react";
import { StatusBadge } from "../StatusBadge";
import { useAppContext } from "../../context/AppContext";
import type { Course } from "../../lib/api/formations";

export interface CourseCardProps {
  course: Course;
  onEdit: () => void;
  onDelete: () => void;
}

const contentIcon = (type: string) => (type === "video" ? Video : type === "external_link" ? LinkIcon : FileText);

export default function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [expanded, setExpanded] = useState(false);
  // Populated when the course came from formations-get's nested embed
  // (formation_courses(*, formation_content(*))) -- absent elsewhere.
  const contents = course.formation_content ?? [];

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{course.title}</h3>
            <StatusBadge status={course.status as any} size="sm" />
          </div>
          <p className="text-xs text-muted-foreground">{fr ? "Durée" : "Duration"}: {course.duration}</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{course.description}</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button onClick={onEdit} className="px-3 py-1.5 rounded-lg border border-border text-xs">{fr ? "Modifier" : "Edit"}</button>
          <button onClick={onDelete} className="px-3 py-1.5 rounded-lg border border-border text-xs text-[#E5484D]">{fr ? "Supprimer" : "Delete"}</button>
        </div>
      </div>

      <button onClick={() => setExpanded((v) => !v)} className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground hover:text-foreground">
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {contents.length} {fr ? (contents.length > 1 ? "contenus" : "contenu") : `content item${contents.length === 1 ? "" : "s"}`}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          {contents.length === 0 ? (
            <p className="text-xs text-muted-foreground">{fr ? "Aucun contenu pour ce cours" : "No content for this course"}</p>
          ) : (
            contents.map((item) => {
              const Icon = contentIcon(item.type);
              const href = item.external_url || item.storage_path || undefined;
              return (
                <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F5EC] dark:bg-[#1A3326] flex items-center justify-center shrink-0">
                    <Icon size={14} color="#4CAF68" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{item.format} · {item.duration}</p>
                  </div>
                  {href && (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-2 py-1 rounded-md border border-border text-[10px] text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <Download size={10} /> {fr ? "Télécharger" : "Download"}
                    </a>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
