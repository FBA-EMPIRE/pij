import { useState } from "react";
import { Plus, Edit3, Trash2, X, CheckCircle } from "lucide-react";
import { TONTINE_TYPES } from "./mockData";
import type { TontineType } from "../types";
import { useAppContext } from "../context/AppContext";

const emptyForm = { name: "", nameEn: "", frequency: "weekly" as const, description: "", descriptionEn: "", defaultContribution: "", defaultCapacity: "" };

export default function AdminTontineTypes() {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<TontineType | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (t: TontineType) => {
    setEditing(t);
    setForm({ name: t.name, nameEn: t.nameEn, frequency: t.frequency, description: t.description, descriptionEn: t.descriptionEn, defaultContribution: String(t.defaultContribution), defaultCapacity: String(t.defaultCapacity) });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editing) {
      editing.name = form.name;
      editing.nameEn = form.nameEn;
      editing.frequency = form.frequency;
      editing.description = form.description;
      editing.descriptionEn = form.descriptionEn;
      editing.defaultContribution = Number(form.defaultContribution);
      editing.defaultCapacity = Number(form.defaultCapacity);
    } else {
      const newType: TontineType = {
        id: `TT-${String(TONTINE_TYPES.length + 1).padStart(3, "0")}`,
        name: form.name,
        nameEn: form.nameEn,
        frequency: form.frequency,
        description: form.description,
        descriptionEn: form.descriptionEn,
        defaultContribution: Number(form.defaultContribution),
        defaultCapacity: Number(form.defaultCapacity),
        status: "Active",
      };
      TONTINE_TYPES.push(newType);
    }
    setShowModal(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    const idx = TONTINE_TYPES.findIndex((t) => t.id === id);
    if (idx !== -1) {
      TONTINE_TYPES.splice(idx, 1);
    }
    setDeleteConfirm(null);
  };

  const toggleStatus = (id: string) => {
    const t = TONTINE_TYPES.find((t) => t.id === id);
    if (t) t.status = t.status === "Active" ? "Inactive" : "Active";
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "DM Sans, sans-serif" }}>
            {fr ? "Types de Tontine" : "Tontine Types"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {fr ? "Gérez les types de tontine disponibles sur la plateforme." : "Manage tontine types available on the platform."}
          </p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all" style={{ background: "#4CAF68" }}>
          <Plus size={16} /> {fr ? "Nouveau type" : "New type"}
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1.5fr] gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/30">
          <span>{fr ? "NOM" : "NAME"}</span>
          <span>{fr ? "FRÉQUENCE" : "FREQUENCY"}</span>
          <span>{fr ? "COTISATION" : "CONTRIBUTION"}</span>
          <span>{fr ? "PLACES" : "CAPACITY"}</span>
          <span>STATUS</span>
          <span>ACTIONS</span>
        </div>
        <div className="divide-y divide-border">
          {TONTINE_TYPES.map((t) => (
            <div key={t.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1.5fr] gap-2 md:gap-4 px-5 py-4 items-center">
              <div>
                <p className="text-sm font-semibold">{fr ? t.name : t.nameEn}</p>
                <p className="text-xs text-muted-foreground truncate">{fr ? t.description : t.descriptionEn}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                {t.frequency === "weekly" ? (fr ? "Hebdo" : "Weekly") : t.frequency === "biweekly" ? (fr ? "Bihebdo" : "Biweekly") : (fr ? "Mensuel" : "Monthly")}
              </div>
              <div className="text-sm font-mono">{t.defaultContribution.toLocaleString()} XAF</div>
              <div className="text-sm">{t.defaultCapacity}</div>
              <div>
                <button onClick={() => toggleStatus(t.id)} className={`px-2.5 py-1 rounded-md text-xs font-medium ${t.status === "Active" ? "bg-[#E8F5EC] text-[#1F9D55]" : "bg-red-50 text-[#E5484D]"}`}>
                  {t.status === "Active" ? (fr ? "Actif" : "Active") : (fr ? "Inactif" : "Inactive")}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(t)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Edit3 size={12} /> Edit
                </button>
                <button onClick={() => setDeleteConfirm(t.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 size={12} /> {fr ? "Suppr." : "Del"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ fontFamily: "DM Sans, sans-serif" }}>
                {editing ? (fr ? "Modifier le type" : "Edit type") : (fr ? "Nouveau type de tontine" : "New tontine type")}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-muted"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">{fr ? "Nom (FR)" : "Name (FR)"}</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
                </div>
                <div>
                  <label className="text-sm font-medium">{fr ? "Nom (EN)" : "Name (EN)"}</label>
                  <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                    className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">{fr ? "Description (FR)" : "Description (FR)"}</label>
                  <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
                </div>
                <div>
                  <label className="text-sm font-medium">{fr ? "Description (EN)" : "Description (EN)"}</label>
                  <input value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                    className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">{fr ? "Fréquence" : "Frequency"}</label>
                <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value as any })}
                  className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40">
                  <option value="weekly">{fr ? "Hebdomadaire" : "Weekly"}</option>
                  <option value="biweekly">{fr ? "Bihebdomadaire" : "Biweekly"}</option>
                  <option value="monthly">{fr ? "Mensuel" : "Monthly"}</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">{fr ? "Cotisation par défaut (XAF)" : "Default contribution"}</label>
                  <input type="number" value={form.defaultContribution} onChange={(e) => setForm({ ...form, defaultContribution: e.target.value })}
                    className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
                </div>
                <div>
                  <label className="text-sm font-medium">{fr ? "Places par défaut" : "Default capacity"}</label>
                  <input type="number" value={form.defaultCapacity} onChange={(e) => setForm({ ...form, defaultCapacity: e.target.value })}
                    className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground">
                {fr ? "Annuler" : "Cancel"}
              </button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90" style={{ background: "#4CAF68" }}>
                {fr ? "Enregistrer" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-sm p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
                <Trash2 size={22} color="#E5484D" />
              </div>
              <h3 className="font-semibold mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>
                {fr ? "Supprimer ce type ?" : "Delete this type?"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {fr ? "Cette action est irréversible." : "This action cannot be undone."}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground">
                {fr ? "Annuler" : "Cancel"}
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90" style={{ background: "#E5484D" }}>
                {fr ? "Supprimer" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
