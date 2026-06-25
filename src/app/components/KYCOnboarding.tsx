import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Upload, Camera, CheckCircle, Clock, ArrowRight, ArrowLeft, User, FileText, Scan, X, ImageIcon } from "lucide-react";
import { PIJLogo } from "./PIJLogo";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase/client";

const STEPS = [
  { icon: User, label: "Informations personnelles", labelEn: "Personal Information" },
  { icon: FileText, label: "Pièce d'identité", labelEn: "Identity Document" },
  { icon: Camera, label: "Selfie de vérification", labelEn: "Verification Selfie" },
  { icon: CheckCircle, label: "Révision & Soumission", labelEn: "Review & Submit" },
];

export default function KYCOnboarding() {
  const { darkMode, lang } = useAppContext();
  const navigate = useNavigate();
  const fr = lang === "fr";
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [city, setCity] = useState("");
  const [profession, setProfession] = useState("Entrepreneur");

  const [docType, setDocType] = useState(fr ? "Carte Nationale d'Identité" : "National ID Card");
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const idFrontRef = useRef<HTMLInputElement>(null);
  const idBackRef = useRef<HTMLInputElement>(null);

  const [selfie, setSelfie] = useState<File | null>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  const validate = (): string | null => {
    if (step === 0) {
      if (!firstName || !lastName) return fr ? "Prénom et nom requis." : "First and last name required.";
      if (!dob) return fr ? "Date de naissance requise." : "Date of birth required.";
    }
    if (step === 1) {
      if (!idFront) return fr ? "Veuillez télécharger le recto de la pièce." : "Please upload the front of your ID.";
      if (!idBack) return fr ? "Veuillez télécharger le verso de la pièce." : "Please upload the back of your ID.";
    }
    if (step === 2) {
      if (!selfie) return fr ? "Veuillez prendre votre selfie." : "Please take your selfie.";
    }
    return null;
  };

  const handleNext = () => {
    setError("");
    const err = validate();
    if (err) { setError(err); return; }
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const upload = async (file: File, prefix: string) => {
        const path = `${user.id}/${prefix}_${Date.now()}`;
        const { error: upErr } = await supabase.storage.from("kyc-documents").upload(path, file);
        if (upErr) throw upErr;
        return path;
      };

      const frontPath = await upload(idFront!, "id_front");
      const backPath = await upload(idBack!, "id_back");
      const selfiePath = await upload(selfie!, "selfie");

      const { error: insertErr } = await supabase.from("kyc_documents").insert([
        { user_id: user.id, document_type: docType, storage_path: frontPath, status: "pending" },
        { user_id: user.id, document_type: docType, storage_path: backPath, status: "pending" },
        { user_id: user.id, document_type: "selfie", storage_path: selfiePath, status: "pending" },
      ]);
      if (insertErr) throw insertErr;

      const { error: updateErr } = await supabase
        .from("users")
        .update({ kyc_status: "pending" })
        .eq("id", user.id);
      if (updateErr) throw updateErr;

      setSubmitted(true);
    } catch (err: any) {
      console.error("KYC submit error:", err);
      setError(err?.message || (fr ? "Erreur lors de la soumission." : "Submission error."));
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} Ko`
      : `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;

  if (submitted) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-background p-6 ${darkMode ? "dark" : ""}`} style={{ fontFamily: "Inter, sans-serif" }}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-[#E8F5EC] flex items-center justify-center mx-auto mb-6">
            <Clock size={32} color="#4CAF68" />
          </div>
          <h2 className="mb-3" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700 }}>
            {fr ? "Dossier en cours de révision" : "Application under review"}
          </h2>
          <p className="text-muted-foreground text-sm mb-2">
            {fr ? "Votre dossier KYC a été soumis avec succès. Notre équipe le traitera sous" : "Your KYC application has been submitted. Our team will process it within"}
          </p>
          <p className="text-[#4CAF68] font-semibold mb-8">{fr ? "24 à 48 heures ouvrables" : "24 to 48 business hours"}</p>
          <div className="flex flex-col gap-3 items-center">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#E8F5EC] text-[#1F9D55] text-sm font-medium w-full justify-center">
              <CheckCircle size={16} /> {fr ? "Informations personnelles — Reçu" : "Personal information — Received"}
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#E8F5EC] text-[#1F9D55] text-sm font-medium w-full justify-center">
              <CheckCircle size={16} /> {fr ? "Pièce d'identité — Reçue" : "Identity document — Received"}
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#E8F5EC] text-[#1F9D55] text-sm font-medium w-full justify-center">
              <CheckCircle size={16} /> {fr ? "Selfie de vérification — Reçu" : "Verification selfie — Received"}
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-amber-50 text-amber-600 text-sm font-medium w-full justify-center">
              <Clock size={16} /> {fr ? "Révision admin — En attente" : "Admin review — Pending"}
            </div>
          </div>
          <button onClick={() => navigate("/dashboard")} className="mt-8 px-6 py-3 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all" style={{ background: "#4CAF68" }}>
            {fr ? "Aller au tableau de bord" : "Go to dashboard"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${darkMode ? "dark" : ""}`} style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-10">
          <PIJLogo variant="full" size="sm" />
          <span className="text-xs text-muted-foreground">{fr ? "Étape" : "Step"} {step + 1} / 4</span>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-12 relative">
          <div className="absolute top-4 left-0 right-0 h-px bg-border" />
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div key={i} className="flex-1 flex flex-col items-center relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 text-xs font-bold transition-all
                  ${done ? "bg-[#4CAF68] text-white" : active ? "bg-[#4CAF68] text-white ring-4 ring-[#4CAF68]/20" : "bg-card border-2 border-border text-muted-foreground"}`}>
                  {done ? <CheckCircle size={14} /> : <span>{i + 1}</span>}
                </div>
                <span className={`text-xs text-center hidden sm:block ${active ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {fr ? s.label : s.labelEn}
                </span>
              </div>
            );
          })}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        {/* Step content */}
        <div className="bg-card rounded-2xl border border-border p-8">
          {step === 0 && (
            <div>
              <h3 className="mb-1" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Informations personnelles" : "Personal information"}</h3>
              <p className="text-sm text-muted-foreground mb-6">{fr ? "Ces informations sont utilisées pour créer votre profil PIJ." : "This information is used to create your PIJ profile."}</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">{fr ? "Prénom" : "First name"} *</label>
                    <input value={firstName} onChange={e => setFirstName(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder="Amara" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{fr ? "Nom de famille" : "Last name"} *</label>
                    <input value={lastName} onChange={e => setLastName(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder="Diallo" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">{fr ? "Date de naissance" : "Date of birth"} *</label>
                  <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
                </div>
                <div>
                  <label className="text-sm font-medium">{fr ? "Ville de résidence" : "City of residence"}</label>
                  <input value={city} onChange={e => setCity(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder="Douala" />
                </div>
                <div>
                  <label className="text-sm font-medium">{fr ? "Activité professionnelle" : "Professional activity"}</label>
                  <select value={profession} onChange={e => setProfession(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40">
                    <option>{fr ? "Entrepreneur" : "Entrepreneur"}</option>
                    <option>{fr ? "Étudiant" : "Student"}</option>
                    <option>{fr ? "Salarié" : "Employee"}</option>
                    <option>{fr ? "Commerçant" : "Trader"}</option>
                    <option>{fr ? "Autre" : "Other"}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 className="mb-1" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Pièce d'identité" : "Identity document"}</h3>
              <p className="text-sm text-muted-foreground mb-6">{fr ? "Téléchargez le recto et le verso de votre pièce d'identité nationale." : "Upload the front and back of your national identity document."}</p>
              <div className="mb-4">
                <label className="text-sm font-medium">{fr ? "Type de document" : "Document type"}</label>
                <select value={docType} onChange={e => setDocType(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40">
                  <option>{fr ? "Carte Nationale d'Identité" : "National ID Card"}</option>
                  <option>{fr ? "Passeport" : "Passport"}</option>
                  <option>{fr ? "Permis de conduire" : "Driver's license"}</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {[
                  { key: "front", label: fr ? "Recto (face)" : "Front", file: idFront, setFile: setIdFront, ref: idFrontRef },
                  { key: "back", label: fr ? "Verso (dos)" : "Back", file: idBack, setFile: setIdBack, ref: idBackRef },
                ].map(({ key, label, file, setFile, ref }) => (
                  <div key={key}>
                    <input
                      ref={ref}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={e => setFile(e.target.files?.[0] ?? null)}
                    />
                    <div
                      onClick={() => ref.current?.click()}
                      className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-[#4CAF68]/50 cursor-pointer transition-colors group relative"
                    >
                      {file ? (
                        <>
                          <div className="w-full flex flex-col items-center gap-2">
                            <ImageIcon size={24} className="text-[#4CAF68]" />
                            <p className="text-sm font-medium text-center break-all">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); setFile(null); }}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200"
                          >
                            <X size={12} color="#E5484D" />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-[#E8F5EC] transition-colors">
                            <Upload size={18} className="text-muted-foreground group-hover:text-[#4CAF68]" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground mt-1">{fr ? "JPG, PNG, PDF — max 5 Mo" : "JPG, PNG, PDF — max 5 MB"}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="mb-1" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Selfie de vérification" : "Verification selfie"}</h3>
              <p className="text-sm text-muted-foreground mb-6">{fr ? "Prenez une photo de vous-même pour confirmer votre identité. Assurez-vous que votre visage est bien visible." : "Take a photo of yourself to confirm your identity. Make sure your face is clearly visible."}</p>
              <input
                ref={selfieRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={e => setSelfie(e.target.files?.[0] ?? null)}
              />
              <div
                onClick={() => selfieRef.current?.click()}
                className="border-2 border-dashed border-border rounded-2xl p-12 flex flex-col items-center gap-4 hover:border-[#4CAF68]/50 cursor-pointer transition-colors group mx-auto max-w-sm relative"
              >
                {selfie ? (
                  <>
                    <img
                      src={URL.createObjectURL(selfie)}
                      alt="Selfie preview"
                      className="w-40 h-40 rounded-full object-cover border-4 border-[#4CAF68]/30"
                    />
                    <p className="text-sm font-medium text-[#4CAF68]">{fr ? "✓ Selfie capturé" : "✓ Selfie captured"}</p>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setSelfie(null); }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      {fr ? "Reprendre" : "Retake"}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center group-hover:bg-[#E8F5EC] transition-colors">
                        <Camera size={32} className="text-muted-foreground group-hover:text-[#4CAF68]" />
                      </div>
                      <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#4CAF68]/30" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{fr ? "Prendre mon selfie" : "Take my selfie"}</p>
                      <p className="text-xs text-muted-foreground mt-1">{fr ? "Visage centré, bonne lumière" : "Centered face, good lighting"}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-6 p-4 rounded-xl bg-[#F0E8FF] border border-[#6E3A9A]/20">
                <p className="text-xs text-[#6E3A9A] leading-relaxed">{fr ? "🔒 Votre selfie est utilisé uniquement pour la vérification d'identité et est stocké de façon sécurisée. Il ne sera jamais partagé." : "🔒 Your selfie is used solely for identity verification and is stored securely. It will never be shared."}</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="mb-1" style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>{fr ? "Révision & Soumission" : "Review & Submit"}</h3>
              <p className="text-sm text-muted-foreground mb-6">{fr ? "Vérifiez vos informations avant de soumettre votre dossier." : "Verify your information before submitting your application."}</p>
              <div className="space-y-3">
                {[
                  { label: fr ? "Nom complet" : "Full name", value: `${firstName} ${lastName}` },
                  { label: fr ? "Date de naissance" : "Date of birth", value: dob },
                  { label: fr ? "Ville" : "City", value: city || "-" },
                  { label: fr ? "Type de document" : "Document type", value: docType },
                  { label: fr ? "Recto (face)" : "Front side", value: idFront ? `✓ ${idFront.name}` : "✗ Manquant", green: !!idFront },
                  { label: fr ? "Verso (dos)" : "Back side", value: idBack ? `✓ ${idBack.name}` : "✗ Manquant", green: !!idBack },
                  { label: fr ? "Selfie" : "Selfie", value: selfie ? "✓ Capturé" : "✗ Manquant", green: !!selfie },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2.5 px-4 rounded-xl bg-muted/40">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <span className={`text-sm font-medium ${row.green ? "text-[#1F9D55]" : "text-[#E5484D]"}`}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700 leading-relaxed">{fr ? "En soumettant ce dossier, vous confirmez que toutes les informations fournies sont exactes et que les documents sont authentiques." : "By submitting this application, you confirm that all information provided is accurate and the documents are authentic."}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : navigate("/register")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 text-sm transition-all"
          >
            <ArrowLeft size={15} /> {fr ? "Précédent" : "Previous"}
          </button>
          <button
            onClick={handleNext}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            style={{ background: "#4CAF68" }}
          >
            {submitting
              ? (fr ? "Soumission..." : "Submitting...")
              : step === 3 ? (fr ? "Soumettre mon dossier" : "Submit application") : (fr ? "Continuer" : "Continue")}
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}