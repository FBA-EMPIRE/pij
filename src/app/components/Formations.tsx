import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Award, BookOpen, CheckCircle, ChevronRight, Clock, FileText, GraduationCap, Play, Send, Star, Users } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase/client";

interface FormationsProps { view?: "dashboard" | "course" | "learning" | "consultation"; }

const consultationTypes = ["Mentorat", "Consultation", "Business Review", "Évaluation de Projet"];

export default function Formations({ view = "dashboard" }: FormationsProps) {
  const { lang } = useAppContext();
  const [categories, setCategories] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [cats, crs, conts, consults] = await Promise.all([
          supabase.from("formation_categories").select("*"),
          supabase.from("formation_courses").select("*"),
          supabase.from("formation_content").select("*"),
          supabase.from("consultation_requests").select("*"),
        ]);
        setCategories(cats.data ?? []);
        setCourses(crs.data ?? []);
        setContents(conts.data ?? []);
        setConsultations(consults.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (view === "course") return <CourseDetail courses={courses} contents={contents} />;
  if (view === "learning") return <MyLearning courses={courses} />;
  if (view === "consultation") return <ConsultationRequest consultations={consultations} />;
  return <FormationDashboard categories={categories} courses={courses} />;
}

function FormationDashboard({ categories, courses }: { categories: any[]; courses: any[] }) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const navigate = useNavigate();
  const inProgress = courses.filter((c: any) => c.progress > 0 && c.progress < 100);
  const completed = courses.filter((c: any) => c.progress === 100);
  const avgProgress = courses.length ? Math.round(courses.reduce((s: number, c: any) => s + (c.progress ?? 0), 0) / courses.length) : 0;

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6 p-4 sm:p-6 lg:p-8 rounded-2xl bg-card border border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #4CAF68 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-5">
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-[#4CAF68] mb-2">{fr ? "Formation PIJ" : "PIJ Learning"}</p>
            <h1 className="text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Apprendre, structurer, puis grandir" : "Learn, structure, then grow"}</h1>
            <p className="text-sm text-muted-foreground max-w-xl">{fr ? "Progressez dans les compétences entrepreneuriales clés avant de demander un accompagnement ou d'investir." : "Build core entrepreneurial skills before requesting guidance or investing."}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button onClick={() => navigate("/formations/courses/course-entreprendre")} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-medium text-sm hover:opacity-90 min-h-[44px]" style={{ background: "linear-gradient(135deg, #4CAF68, #1F9D55)" }}><Play size={16} />{fr ? "Continuer" : "Continue"}</button>
            <button onClick={() => navigate("/formations/consultation")} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted min-h-[44px]"><Users size={16} />{fr ? "Demander conseil" : "Request guidance"}</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[{ label: fr ? "En cours" : "In progress", value: inProgress.length, icon: Play }, { label: fr ? "Terminés" : "Completed", value: completed.length, icon: Award }, { label: fr ? "Progression moyenne" : "Average progress", value: `${avgProgress}%`, icon: GraduationCap }].map((s) => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2"><p className="text-xs sm:text-sm text-muted-foreground">{s.label}</p><s.icon size={18} color="#4CAF68" className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /></div>
            <p className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "Geist Mono, monospace" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {inProgress[0] && (
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 mb-8">
          <div className="flex items-center justify-between mb-4"><h2 className="text-sm sm:text-lg font-bold" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Continuer l'apprentissage" : "Continue learning"}</h2><button onClick={() => navigate("/formations/learning")} className="text-xs text-[#4CAF68] font-medium flex items-center gap-1 hover:underline shrink-0">{fr ? "Mon apprentissage" : "My learning"}<ChevronRight size={12} /></button></div>
          <CourseRow course={inProgress[0]} />
        </div>
      )}

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-[#4CAF68]" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Catégories" : "Categories"}</h2><span className="text-xs text-muted-foreground">{fr ? "Découverte en 1 clic" : "Discover in 1 click"}</span></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.length ? categories.map((cat: any) => (
            <button key={cat.id} onClick={() => navigate(`/formations/courses/${courses.find((c: any) => c.categoryId === cat.id)?.id ?? ""}`)} className="bg-card rounded-2xl border border-border p-5 text-left hover:border-[#4CAF68]/40 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${cat.color}20` }}><BookOpen size={18} color={cat.color} /></div>
              <p className="font-semibold text-sm">{fr ? cat.name : cat.nameEn}</p><p className="text-xs text-muted-foreground mt-1">{cat.description}</p>
            </button>
          )) : <p className="text-sm text-muted-foreground col-span-full text-center py-8">{fr ? "Aucune catégorie disponible" : "No categories available"}</p>}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-[#4CAF68]" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Formations à la une" : "Featured courses"}</h2><button onClick={() => navigate("/formations/learning")} className="text-xs text-[#4CAF68] font-medium flex items-center gap-1 hover:underline">{fr ? "Voir tout" : "View all"}<ChevronRight size={12} /></button></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">{courses.filter((c: any) => c.featured).map((course: any) => <CourseCard key={course.id} course={course} />)}</div>
      </section>
    </div>
  );
}

function CourseCard({ course }: { course: any }) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const navigate = useNavigate();
  return <div className="bg-card rounded-2xl border border-border overflow-hidden group hover:border-[#4CAF68]/40 transition-all"><div className="relative h-36 sm:h-40" style={{ background: course.image }}><div className="absolute inset-0 bg-black/20 group-hover:bg-black/10" /><span className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white text-xs"><Clock size={12} />{course.duration}</span></div><div className="p-3 sm:p-4"><h3 className="text-xs sm:text-sm font-semibold mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? course.title : course.titleEn}</h3><p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2 sm:line-clamp-none">{course.description}</p><div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground mb-2"><span>{course.lessonCount} {fr ? "leçons" : "lessons"}</span><span className="text-[#4CAF68] font-bold">{course.progress}%</span></div><div className="w-full bg-muted rounded-full h-1.5 sm:h-2 mb-3 sm:mb-4"><div className="h-1.5 sm:h-2 rounded-full bg-[#4CAF68]" style={{ width: `${course.progress}%` }} /></div><button onClick={() => navigate(`/formations/courses/${course.id}`)} className="w-full py-2.5 rounded-xl text-white text-xs sm:text-sm font-medium hover:opacity-90 min-h-[44px]" style={{ background: "#4CAF68" }}>{fr ? "Voir le cours" : "View course"}</button></div></div>;
}

function CourseRow({ course }: { course: any }) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const navigate = useNavigate();
  return <div className="flex flex-col sm:flex-row gap-4 sm:items-center"><div className="h-24 sm:w-36 rounded-xl shrink-0" style={{ background: course.image }} /><div className="flex-1"><p className="font-semibold" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? course.title : course.titleEn}</p><p className="text-xs text-muted-foreground mt-1">{course.lessonCount} {fr ? "leçons" : "lessons"} · {course.duration}</p><div className="w-full bg-muted rounded-full h-2 mt-3"><div className="h-2 rounded-full bg-[#4CAF68]" style={{ width: `${course.progress}%` }} /></div></div><button onClick={() => navigate(`/formations/courses/${course.id}`)} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: "#4CAF68" }}>{fr ? "Reprendre" : "Resume"}</button></div>;
}

function CourseDetail({ courses, contents }: { courses: any[]; contents: any[] }) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const course = courses.find((c: any) => c.id === id) ?? courses[0];
  if (!course) return <div className="p-4 lg:p-8 max-w-5xl mx-auto text-center text-muted-foreground">{fr ? "Cours introuvable" : "Course not found"}</div>;
  const items = contents.filter((c: any) => c.courseId === course.id);
  const tabs = [{ key: "overview", label: fr ? "Aperçu" : "Overview" }, { key: "video", label: fr ? "Vidéos" : "Videos" }, { key: "book", label: fr ? "Livres" : "Books" }, { key: "note", label: "Notes" }, { key: "assignment", label: fr ? "Devoirs" : "Assignments" }];
  return <div className="p-4 lg:p-8 max-w-5xl mx-auto"><button onClick={() => navigate("/formations")} className="text-sm text-[#4CAF68] mb-4 hover:underline">← {fr ? "Retour aux formations" : "Back to formations"}</button><div className="bg-card rounded-2xl border border-border overflow-hidden mb-6"><div className="h-40 sm:h-48" style={{ background: course.image }} /><div className="p-4 sm:p-6"><div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"><div><h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? course.title : course.titleEn}</h1><p className="text-sm text-muted-foreground mt-2 max-w-2xl">{course.description}</p></div><button onClick={() => navigate("/formations/consultation")} className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted w-full sm:w-auto min-h-[44px]">{fr ? "Demander une consultation" : "Request consultation"}</button></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-5 text-sm"><Stat label={fr ? "Durée" : "Duration"} value={course.duration} /><Stat label={fr ? "Leçons" : "Lessons"} value={`${course.lessonCount}`} /><Stat label={fr ? "Niveau" : "Level"} value={course.level} /><Stat label={fr ? "Progression" : "Progress"} value={`${course.progress}%`} /></div></div></div><div className="flex gap-2 mb-5 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">{tabs.map((t: any) => <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border whitespace-nowrap min-h-[44px] ${tab === t.key ? "bg-[#4CAF68] text-white border-[#4CAF68]" : "bg-card border-border text-muted-foreground"}`}>{t.label}</button>)}</div>{tab === "overview" ? <div className="bg-card rounded-2xl border border-border p-4 sm:p-6"><h3 className="text-sm sm:text-base" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Ce que vous allez apprendre" : "What you will learn"}</h3><p className="text-sm text-muted-foreground mt-2">{course.description}</p></div> : <ContentList items={items.filter((i: any) => tab === "overview" || i.type === tab)} fr={fr} />}</div>;
}

function ContentList({ items, fr }: { items: any[]; fr: boolean }) {
  return <div className="bg-card rounded-2xl border border-border p-5 space-y-2">{items.length ? items.map((item: any) => <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"><div className="w-9 h-9 rounded-xl bg-[#E8F5EC] flex items-center justify-center"><FileText size={16} color="#4CAF68" /></div><div className="flex-1"><p className="text-sm font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{item.format} · {item.duration}</p></div>{item.completed && <StatusBadge status="Completed" size="sm" />}</div>) : <p className="text-sm text-muted-foreground">{fr ? "Aucun contenu disponible pour cet onglet." : "No content available for this tab."}</p>}</div>;
}

function MyLearning({ courses }: { courses: any[] }) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  return <div className="p-4 lg:p-8 max-w-5xl mx-auto"><h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Mon apprentissage" : "My learning"}</h1><p className="text-sm text-muted-foreground mb-6">{fr ? "Suivez vos cours terminés et en cours." : "Track completed and in-progress courses."}</p><div className="space-y-6"><section className="bg-card rounded-2xl border border-border p-4 sm:p-5"><h2 className="text-sm sm:text-lg font-bold mb-4">{fr ? "En cours" : "In progress"}</h2><div className="space-y-4">{courses.filter((c: any) => c.progress < 100).map((c: any) => <CourseRow key={c.id} course={c} />)}</div></section><section className="bg-card rounded-2xl border border-border p-4 sm:p-5"><h2 className="text-sm sm:text-lg font-bold mb-4">{fr ? "Terminés" : "Completed"}</h2><div className="space-y-4">{courses.filter((c: any) => c.progress === 100).map((c: any) => <CourseRow key={c.id} course={c} />)}</div></section></div></div>;
}

function ConsultationRequest({ consultations }: { consultations: any[] }) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const [type, setType] = useState(consultationTypes[0]);
  return <div className="p-4 lg:p-8 max-w-5xl mx-auto"><h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Demande de consultation" : "Consultation request"}</h1><p className="text-sm text-muted-foreground mb-6">{fr ? "Mentorat, consultation, revue business ou évaluation de projet." : "Mentorship, consultation, business review or project evaluation."}</p><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="bg-card rounded-2xl border border-border p-4 sm:p-6 space-y-4"><div><label className="text-sm font-medium">{fr ? "Type" : "Type"}</label><select value={type} onChange={(e) => setType(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40">{consultationTypes.map((t) => <option key={t}>{t}</option>)}</select></div><div><label className="text-sm font-medium">{fr ? "Projet" : "Project"}</label><input className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder={fr ? "Nom de votre projet" : "Project name"} /></div><div><label className="text-sm font-medium">{fr ? "Besoin" : "Need"}</label><textarea rows={4} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 resize-none" placeholder={fr ? "Décrivez votre besoin..." : "Describe your need..."} /></div><button className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-medium text-sm" style={{ background: "linear-gradient(135deg, #1E2530, #2A3444)" }}><Send size={16} />{fr ? "Envoyer la demande" : "Send request"}</button></div><div className="bg-card rounded-2xl border border-border p-6"><h2 className="text-lg font-bold mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Suivi des demandes" : "Request tracking"}</h2><div className="space-y-4">{consultations.length ? consultations.map((r: any) => <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"><div><p className="text-sm font-medium">{r.type}</p><p className="text-xs text-muted-foreground">{r.project}</p></div><StatusBadge status={r.status as any} size="sm" /></div>) : <p className="text-sm text-muted-foreground">{fr ? "Aucune demande pour le moment." : "No requests yet."}</p>}</div></div></div></div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-bold mt-0.5" style={{ fontFamily: "Geist Mono, monospace" }}>{value}</p></div>;
}
