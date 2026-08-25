import { FileText, Video, Link as LinkIcon, Download, Trash2 } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import type { Content } from "../../lib/api/formations";

export interface ContentItemProps {
  content: Content;
  onDelete: () => void;
}

export default function ContentItem({ content, onDelete }: ContentItemProps) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const Icon = content.type === "video" ? Video : content.type === "external_link" ? LinkIcon : FileText;
  const href = content.external_url || content.storage_path || undefined;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
      <div className="w-9 h-9 rounded-xl bg-[#E8F5EC] dark:bg-[#1A3326] flex items-center justify-center shrink-0">
        <Icon size={16} color="#4CAF68" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{content.title}</p>
        <p className="text-xs text-muted-foreground truncate">{content.format} · {content.duration}</p>
      </div>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground shrink-0"
        >
          <Download size={12} /> {fr ? "Télécharger" : "Download"}
        </a>
      )}
      <button onClick={onDelete} className="px-3 py-1.5 rounded-lg border border-border text-xs text-[#E5484D] shrink-0" aria-label={fr ? "Supprimer" : "Delete"}>
        <Trash2 size={13} />
      </button>
    </div>
  );
}
