import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { toast } from "sonner";
import { Award, BookOpen, CheckCircle, ChevronRight, Clock, FileText, GraduationCap, Play, Send, Star, Users, ArrowLeft, Video, Link as LinkIcon, Upload, X } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { useAppContext } from "../context/AppContext";
import { supabase } from "../lib/supabase/client";
import { trainerService } from "../lib/api/trainers";
import type { FormateurRequest } from "../types";
import {
  getCurrentUserId, fetchFormations, fetchFormationCourses, fetchFormationContent,
  fetchMyEnrollments, fetchMyCompletions, ensureEnrolled, markContentComplete, unmarkContentComplete,
} from "../lib/supabase/queries";

interface FormationsProps { view?: "dashboard" | "course" | "learning" | "consultation" | "trainer"; }

const consultationTypes = [
  { fr: "Mentorat", en: "Mentorship" },
  { fr: "Consultation", en: "Consultation" },
  { fr: "Business Review", en: "Business Review" },
  { fr: "Évaluation de Projet", en: "Project Evaluation" },
];

export default function Formations({ view = "dashboard" }: FormationsProps) {
  const { lang } = useAppContext();
  const [formations, setFormations] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [completions, setCompletions] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEnrollmentState = async (uid: string, baseCourses: any[]) => {
    const [enrollments, myCompletions] = await Promise.all([
      fetchMyEnrollments(uid),
      fetchMyCompletions(uid),
    ]);
    const progressByCourse = new Map(enrollments.map((e: any) => [e.course_id, e.progress]));
    setCompletions(myCompletions);
    return baseCourses.map((c: any) => ({ ...c, progress: progressByCourse.get(c.id) ?? 0 }));
  };

  useEffect(() => {
    (async () => {
      try {
        const [allFormations, crs, conts, consults, uid] = await Promise.all([
          fetchFormations(),
          fetchFormationCourses({ publishedOnly: true }),
          fetchFormationContent(),
          supabase.from("consultation_requests").select("*, course:formation_courses(title, title_en)"),
          getCurrentUserId().catch(() => null),
        ]);
        setFormations(allFormations.filter((f: any) => f.status === "Published"));
        setContents(conts);
        setConsultations(consults.data ?? []);
        setUserId(uid);
        setCourses(uid ? await loadEnrollmentState(uid, crs) : crs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refreshConsultations = async () => {
    const { data } = await supabase.from("consultation_requests").select("*, course:formation_courses(title, title_en)");
    setConsultations(data ?? []);
  };

  const handleToggleComplete = async (contentId: string, courseId: string, isComplete: boolean) => {
    if (!userId) return;
    const newProgress = isComplete
      ? await unmarkContentComplete(userId, contentId, courseId)
      : await markContentComplete(userId, contentId, courseId);
    setCompletions((prev) => {
      const next = new Set(prev);
      if (isComplete) next.delete(contentId); else next.add(contentId);
      return next;
    });
    setCourses((prev) => prev.map((c: any) => (c.id === courseId ? { ...c, progress: newProgress } : c)));
  };

  const handleEnroll = async (courseId: string) => {
    if (!userId) return;
    await ensureEnrolled(userId, courseId);
  };

  if (view === "course") return <CourseDetail courses={courses} contents={contents} completions={completions} onEnroll={handleEnroll} onToggleComplete={handleToggleComplete} />;
  if (view === "learning") return <MyLearning courses={courses} />;
  if (view === "consultation") return <ConsultationRequest consultations={consultations} onRefresh={refreshConsultations} />;
  if (view === "trainer") return <BecomeTrainerRequest />;
  return <FormationDashboard formations={formations} courses={courses} />;
}

function FormationDashboard({ formations, courses }: { formations: any[]; courses: any[] }) {
  const { lang, userProfile } = useAppContext();
  const fr = lang === "fr";
  const navigate = useNavigate();
  const isAlreadyStaff = userProfile?.role === "formateur" || userProfile?.role === "admin" || userProfile?.role === "super_admin";
  const inProgress = courses.filter((c: any) => c.progress > 0 && c.progress < 100);
  const completed = courses.filter((c: any) => c.progress === 100);
  const avgProgress = courses.length ? Math.round(courses.reduce((s: number, c: any) => s + (c.progress ?? 0), 0) / courses.length) : 0;

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors inline-flex items-center mb-2 sm:mb-4">
        <ArrowLeft size={20} className="text-muted-foreground" />
      </button>
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
            {!isAlreadyStaff && (
              <button onClick={() => navigate("/formations/trainer")} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted min-h-[44px]"><GraduationCap size={16} />{fr ? "Devenir Formateur" : "Become a Trainer"}</button>
            )}
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
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-[#4CAF68]" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Formations" : "Formations"}</h2><span className="text-xs text-muted-foreground">{fr ? "Découverte en 1 clic" : "Discover in 1 click"}</span></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {formations.length ? formations.map((formation: any) => (
            <button key={formation.id} onClick={() => navigate(`/formations/courses/${courses.find((c: any) => c.formation_id === formation.id)?.id ?? ""}`)} className="bg-card rounded-2xl border border-border p-5 text-left hover:border-[#4CAF68]/40 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-[#4CAF68]/15"><BookOpen size={18} color="#4CAF68" /></div>
              <p className="font-semibold text-sm">{fr ? formation.title : (formation.title_en || formation.title)}</p><p className="text-xs text-muted-foreground mt-1">{fr ? formation.description : (formation.description_en || formation.description)}</p>
            </button>
          )) : <p className="text-sm text-muted-foreground col-span-full text-center py-8">{fr ? "Aucune formation disponible" : "No formations available"}</p>}
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
  return <div className="bg-card rounded-2xl border border-border overflow-hidden group hover:border-[#4CAF68]/40 transition-all"><div className="relative h-36 sm:h-40" style={course.cover_image_path ? { backgroundImage: `url(${course.cover_image_path})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: course.image }}><div className="absolute inset-0 bg-black/20 group-hover:bg-black/10" /><span className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white text-xs"><Clock size={12} />{course.duration}</span></div><div className="p-3 sm:p-4"><h3 className="text-xs sm:text-sm font-semibold mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? course.title : course.title_en}</h3><p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2 sm:line-clamp-none">{course.description}</p><div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground mb-2"><span>{course.lesson_count} {fr ? "leçons" : "lessons"}</span><span className="text-[#4CAF68] font-bold">{course.progress}%</span></div><div className="w-full bg-muted rounded-full h-1.5 sm:h-2 mb-3 sm:mb-4"><div className="h-1.5 sm:h-2 rounded-full bg-[#4CAF68]" style={{ width: `${course.progress}%` }} /></div><button onClick={() => navigate(`/formations/courses/${course.id}`)} className="w-full py-2.5 rounded-xl text-white text-xs sm:text-sm font-medium hover:opacity-90 min-h-[44px]" style={{ background: "#4CAF68" }}>{fr ? "Voir le cours" : "View course"}</button></div></div>;
}

function CourseRow({ course }: { course: any }) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const navigate = useNavigate();
  return <div className="flex flex-col sm:flex-row gap-4 sm:items-center"><div className="h-24 sm:w-36 rounded-xl shrink-0" style={course.cover_image_path ? { backgroundImage: `url(${course.cover_image_path})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: course.image }} /><div className="flex-1"><p className="font-semibold" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? course.title : course.title_en}</p><p className="text-xs text-muted-foreground mt-1">{course.lesson_count} {fr ? "leçons" : "lessons"} · {course.duration}</p><div className="w-full bg-muted rounded-full h-2 mt-3"><div className="h-2 rounded-full bg-[#4CAF68]" style={{ width: `${course.progress}%` }} /></div></div><button onClick={() => navigate(`/formations/courses/${course.id}`)} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: "#4CAF68" }}>{fr ? "Reprendre" : "Resume"}</button></div>;
}

function CourseDetail({ courses, contents, completions, onEnroll, onToggleComplete }: { courses: any[]; contents: any[]; completions: Set<string>; onEnroll: (courseId: string) => void; onToggleComplete: (contentId: string, courseId: string, isComplete: boolean) => void }) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const course = courses.find((c: any) => c.id === id) ?? courses[0];

  useEffect(() => {
    if (course) onEnroll(course.id);
  }, [course?.id]);

  if (!course) return <div className="p-4 lg:p-8 max-w-5xl mx-auto text-center text-muted-foreground">{fr ? "Cours introuvable" : "Course not found"}</div>;
  const items = contents.filter((c: any) => c.course_id === course.id);
  const tabs = [{ key: "overview", label: fr ? "Aperçu" : "Overview" }, { key: "video", label: fr ? "Vidéos" : "Videos" }, { key: "pdf", label: "PDF" }, { key: "external_link", label: fr ? "Liens" : "Links" }];
  return <div className="p-4 lg:p-8 max-w-5xl mx-auto"><button onClick={() => navigate("/formations")} className="text-sm text-[#4CAF68] mb-4 hover:underline">← {fr ? "Retour aux formations" : "Back to formations"}</button><div className="bg-card rounded-2xl border border-border overflow-hidden mb-6"><div className="h-40 sm:h-48" style={course.cover_image_path ? { backgroundImage: `url(${course.cover_image_path})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: course.image }} /><div className="p-4 sm:p-6"><div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"><div><h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? course.title : course.title_en}</h1><p className="text-sm text-muted-foreground mt-2 max-w-2xl">{course.description}</p></div><button onClick={() => navigate("/formations/consultation", { state: { courseId: course.id, courseTitle: fr ? course.title : course.title_en } })} className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted w-full sm:w-auto min-h-[44px]">{fr ? "Demander une consultation" : "Request consultation"}</button></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-5 text-sm"><Stat label={fr ? "Durée" : "Duration"} value={course.duration} /><Stat label={fr ? "Leçons" : "Lessons"} value={`${course.lesson_count}`} /><Stat label={fr ? "Niveau" : "Level"} value={course.level} /><Stat label={fr ? "Progression" : "Progress"} value={`${course.progress}%`} /></div></div></div><div className="flex gap-2 mb-5 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">{tabs.map((t: any) => <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border whitespace-nowrap min-h-[44px] ${tab === t.key ? "bg-[#4CAF68] text-white border-[#4CAF68]" : "bg-card border-border text-muted-foreground"}`}>{t.label}</button>)}</div>{tab === "overview" ? <div className="bg-card rounded-2xl border border-border p-4 sm:p-6"><h3 className="text-sm sm:text-base" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Ce que vous allez apprendre" : "What you will learn"}</h3><p className="text-sm text-muted-foreground mt-2">{course.description}</p></div> : <ContentList items={items.filter((i: any) => i.type === tab)} fr={fr} courseId={course.id} completions={completions} onToggleComplete={onToggleComplete} />}</div>;
}

function ContentList({ items, fr, courseId, completions, onToggleComplete }: { items: any[]; fr: boolean; courseId: string; completions: Set<string>; onToggleComplete: (contentId: string, courseId: string, isComplete: boolean) => void }) {
  const icon = (type: string) => (type === "video" ? Video : type === "external_link" ? LinkIcon : FileText);
  const href = (item: any) => item.external_url || item.storage_path || undefined;
  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-2">
      {items.length ? items.map((item: any) => {
        const Icon = icon(item.type);
        const url = href(item);
        const isComplete = completions.has(item.id);
        return (
          <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
            <a
              href={url}
              target={url ? "_blank" : undefined}
              rel="noreferrer"
              className={`flex items-center gap-3 flex-1 min-w-0 ${url ? "hover:opacity-80 cursor-pointer" : "cursor-default"}`}
            >
              <div className="w-9 h-9 rounded-xl bg-[#E8F5EC] dark:bg-[#1A3326] flex items-center justify-center shrink-0">
                <Icon size={16} color="#4CAF68" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.format} · {item.duration}</p>
              </div>
            </a>
            <button
              onClick={() => onToggleComplete(item.id, courseId, isComplete)}
              className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${isComplete ? "bg-[#E8F5EC] dark:bg-[#1A3326] text-[#1F9D55] dark:text-[#4CAF68]" : "border border-border text-muted-foreground hover:text-foreground"}`}
            >
              {isComplete ? (fr ? "✓ Terminé" : "✓ Done") : (fr ? "Marquer terminé" : "Mark done")}
            </button>
          </div>
        );
      }) : <p className="text-sm text-muted-foreground">{fr ? "Aucun contenu disponible pour cet onglet." : "No content available for this tab."}</p>}
    </div>
  );
}

function MyLearning({ courses }: { courses: any[] }) {
  const { lang } = useAppContext();
  const navigate = useNavigate();
  const fr = lang === "fr";
  return <div className="p-4 lg:p-8 max-w-5xl mx-auto"><button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors inline-flex items-center mb-2 sm:mb-4"><ArrowLeft size={20} className="text-muted-foreground" /></button><h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Mon apprentissage" : "My learning"}</h1><p className="text-sm text-muted-foreground mb-6">{fr ? "Suivez vos cours terminés et en cours." : "Track completed and in-progress courses."}</p><div className="space-y-6"><section className="bg-card rounded-2xl border border-border p-4 sm:p-5"><h2 className="text-sm sm:text-lg font-bold mb-4">{fr ? "En cours" : "In progress"}</h2><div className="space-y-4">{courses.filter((c: any) => c.progress < 100).map((c: any) => <CourseRow key={c.id} course={c} />)}</div></section><section className="bg-card rounded-2xl border border-border p-4 sm:p-5"><h2 className="text-sm sm:text-lg font-bold mb-4">{fr ? "Terminés" : "Completed"}</h2><div className="space-y-4">{courses.filter((c: any) => c.progress === 100).map((c: any) => <CourseRow key={c.id} course={c} />)}</div></section></div></div>;
}

function ConsultationRequest({ consultations, onRefresh }: { consultations: any[]; onRefresh?: () => void }) {
  const { lang } = useAppContext();
  const fr = lang === "fr";
  const navigate = useNavigate();
  const location = useLocation();
  const linkedCourse = (location.state as { courseId?: string; courseTitle?: string } | null) ?? null;
  const [type, setType] = useState(consultationTypes[0].fr);
  const [project, setProject] = useState("");
  const [need, setNeed] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendRequest = async () => {
    if (!project || !need) return;
    setSending(true);
    try {
      const userId = await getCurrentUserId();
      const { error } = await supabase.from("consultation_requests").insert({
        user_id: userId, type, project, need, status: "pending", course_id: linkedCourse?.courseId ?? null,
      });
      if (error) throw error;
      setSent(true);
      setProject("");
      setNeed("");
      await onRefresh?.();
    } catch (err) {
      console.error("Failed to send consultation request:", err);
    } finally {
      setSending(false);
    }
  };

  return <div className="p-4 lg:p-8 max-w-5xl mx-auto">
    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors inline-flex items-center mb-3">
      <ArrowLeft size={20} className="text-muted-foreground" />
    </button>
    <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Demande de consultation" : "Consultation request"}</h1>
    <p className="text-sm text-muted-foreground mb-6">{fr ? "Mentorat, consultation, revue business ou évaluation de projet." : "Mentorship, consultation, business review or project evaluation."}</p>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 space-y-4">
        {sent ? (
          <div className="text-center py-8">
            <CheckCircle size={48} className="mx-auto text-[#4CAF68] mb-3" />
            <p className="font-medium text-lg">{fr ? "Demande envoyée !" : "Request sent!"}</p>
            <p className="text-sm text-muted-foreground mt-1">{fr ? "Nous reviendrons vers vous rapidement." : "We'll get back to you soon."}</p>
            <button onClick={() => setSent(false)} className="mt-4 px-4 py-2 rounded-xl bg-[#4CAF68] text-white text-sm">{fr ? "Nouvelle demande" : "New request"}</button>
          </div>
        ) : (<>
        {linkedCourse?.courseTitle && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F0E8FF] text-[#6E3A9A] text-xs font-medium">
            {fr ? "Concernant" : "Regarding"}: {linkedCourse.courseTitle}
          </div>
        )}
        <div><label className="text-sm font-medium">{fr ? "Type" : "Type"}</label><select value={type} onChange={(e) => setType(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40">{consultationTypes.map((t) => <option key={t.fr} value={t.fr}>{fr ? t.fr : t.en}</option>)}</select></div>
        <div><label className="text-sm font-medium">{fr ? "Projet" : "Project"}</label><input value={project} onChange={(e) => setProject(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" placeholder={fr ? "Nom de votre projet" : "Project name"} /></div>
        <div><label className="text-sm font-medium">{fr ? "Besoin" : "Need"}</label><textarea value={need} onChange={(e) => setNeed(e.target.value)} rows={4} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 resize-none" placeholder={fr ? "Décrivez votre besoin..." : "Describe your need..."} /></div>
        <button onClick={handleSendRequest} disabled={sending || !project || !need} className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-medium text-sm disabled:opacity-50" style={{ background: "linear-gradient(135deg, #4CAF68, #1F9D55)" }}>
          {sending ? <span className="animate-spin">⟳</span> : <Send size={16} />}{sending ? (fr ? "Envoi..." : "Sending...") : (fr ? "Envoyer la demande" : "Send request")}
        </button>
        </>)}
      </div>
      <div className="bg-card rounded-2xl border border-border p-6"><h2 className="text-lg font-bold mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Suivi des demandes" : "Request tracking"}</h2><div className="space-y-4">{consultations.length ? consultations.map((r: any) => <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"><div><p className="text-sm font-medium">{r.type}</p><p className="text-xs text-muted-foreground">{r.project}{r.course ? ` · ${fr ? r.course.title : r.course.title_en ?? r.course.title}` : ""}</p></div><StatusBadge status={r.status as any} size="sm" /></div>) : <p className="text-sm text-muted-foreground">{fr ? "Aucune demande pour le moment." : "No requests yet."}</p>}</div></div></div></div>;
}

const ALLOWED_DOC_TYPES: Record<string, string> = {
  "application/pdf": "PDF",
  "image/png": "PNG",
  "image/jpeg": "JPEG",
};
const MAX_DOC_BYTES = 10 * 1024 * 1024;
const MAX_DOC_FILES = 3;

function BecomeTrainerRequest() {
  const { lang, userProfile } = useAppContext();
  const fr = lang === "fr";
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [requests, setRequests] = useState<FormateurRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [name, setName] = useState(userProfile?.name ?? "");
  const [email, setEmail] = useState(userProfile?.email ?? "");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const loadRequests = async () => {
    setLoadingRequests(true);
    try {
      const data = await trainerService.myRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to load trainer requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const mostRecent = requests[0];
  const hasPending = mostRecent?.status === "pending";

  const addFiles = (picked: FileList | File[] | null) => {
    setError("");
    if (!picked) return;
    const incoming = Array.from(picked);
    if (files.length + incoming.length > MAX_DOC_FILES) {
      setError(fr ? `Vous pouvez joindre au maximum ${MAX_DOC_FILES} documents.` : `You can attach at most ${MAX_DOC_FILES} documents.`);
      return;
    }
    for (const f of incoming) {
      if (!ALLOWED_DOC_TYPES[f.type]) {
        setError(fr ? "Type de fichier non autorisé. Formats acceptés : PDF, PNG, JPEG." : "File type not allowed. Accepted formats: PDF, PNG, JPEG.");
        return;
      }
      if (f.size > MAX_DOC_BYTES) {
        setError(fr ? `"${f.name}" dépasse la taille maximale de 10 Mo.` : `"${f.name}" exceeds the 10MB size limit.`);
        return;
      }
    }
    setFiles((prev) => [...prev, ...incoming]);
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !category.trim()) {
      setError(fr ? "Veuillez remplir tous les champs obligatoires." : "Please fill in all required fields.");
      return;
    }
    if (files.length < 1) {
      setError(fr ? "Veuillez joindre au moins 1 document justificatif." : "Please attach at least 1 supporting document.");
      return;
    }
    setSending(true);
    try {
      const result = await trainerService.submitRequest({ name: name.trim(), email: email.trim(), category: category.trim(), message: message.trim() || undefined, files });
      if (!result.success) {
        setError(result.error || (fr ? "Une erreur est survenue." : "An error occurred."));
        toast.error(result.error || (fr ? "Une erreur est survenue." : "An error occurred."));
        return;
      }
      toast.success(fr ? "Candidature envoyée !" : "Application submitted!");
      setCategory("");
      setMessage("");
      setFiles([]);
      await loadRequests();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors inline-flex items-center mb-3">
        <ArrowLeft size={20} className="text-muted-foreground" />
      </button>
      <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Devenir Formateur" : "Become a Trainer"}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {fr ? "Soumettez votre candidature pour devenir Formateur sur la plateforme PIJ." : "Submit your application to become a Trainer on the PIJ platform."}
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
          {loadingRequests ? (
            <p className="text-sm text-muted-foreground text-center py-8">{fr ? "Chargement..." : "Loading..."}</p>
          ) : hasPending ? (
            <div className="text-center py-8">
              <Clock size={48} className="mx-auto text-amber-500 mb-3" />
              <p className="font-medium text-lg">{fr ? "Candidature en attente" : "Application pending"}</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                {fr ? "Votre candidature est en cours d'examen par un administrateur. Vous serez notifié dès qu'une décision sera prise." : "Your application is under review by an administrator. You'll be notified as soon as a decision is made."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm">{error}</div>
              )}
              <div>
                <label className="text-sm font-medium">{fr ? "Nom" : "Name"}</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
              </div>
              <div>
                <label className="text-sm font-medium">{fr ? "Adresse e-mail" : "Email address"}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
              </div>
              <div>
                <label className="text-sm font-medium">{fr ? "Catégorie de formations" : "Category of trainings"}</label>
                <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder={fr ? "ex. Développement Web, Marketing digital..." : "e.g. Web Development, Digital Marketing..."} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40" />
              </div>
              <div>
                <label className="text-sm font-medium">{fr ? "Message (optionnel)" : "Message (optional)"}</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF68]/40 resize-none" />
              </div>

              <div>
                <label className="text-sm font-medium">{fr ? "Documents justificatifs" : "Supporting documents"}</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
                  onClick={() => inputRef.current?.click()}
                  className={`mt-1.5 flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${dragging ? "border-[#4CAF68] bg-[#4CAF68]/5" : "border-border"}`}
                >
                  <Upload size={22} className="text-muted-foreground" />
                  <p className="text-sm text-center">{fr ? "Glissez-déposez ou cliquez pour parcourir" : "Drag and drop or click to browse"}</p>
                  <p className="text-xs text-muted-foreground">PDF, PNG, JPEG · {fr ? "10 Mo max" : "Max 10MB"} · {fr ? `1 à ${MAX_DOC_FILES} fichiers` : `1 to ${MAX_DOC_FILES} files`}</p>
                  <input ref={inputRef} type="file" multiple accept={Object.keys(ALLOWED_DOC_TYPES).join(",")} className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
                </div>
                {files.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 text-sm">
                        <FileText size={14} className="text-muted-foreground shrink-0" />
                        <span className="flex-1 truncate">{f.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                        <button type="button" onClick={() => removeFile(i)} className="shrink-0 text-[#E5484D] hover:opacity-70">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" disabled={sending} className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-medium text-sm disabled:opacity-50" style={{ background: "linear-gradient(135deg, #4CAF68, #1F9D55)" }}>
                {sending ? <span className="animate-spin">⟳</span> : <Send size={16} />}{sending ? (fr ? "Envoi..." : "Sending...") : (fr ? "Envoyer la candidature" : "Submit application")}
              </button>
            </form>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>{fr ? "Suivi des candidatures" : "Application tracking"}</h2>
          <div className="space-y-4">
            {requests.length ? requests.map((r) => (
              <div key={r.id} className="p-3 rounded-xl bg-muted/30">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.category}</p>
                    <p className="text-xs text-muted-foreground">{r.created_at.split("T")[0]}</p>
                  </div>
                  <StatusBadge status={r.status as any} size="sm" />
                </div>
                {r.status === "rejected" && r.admin_notes && (
                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                    {fr ? "Motif : " : "Reason: "}{r.admin_notes}
                  </p>
                )}
              </div>
            )) : <p className="text-sm text-muted-foreground">{fr ? "Aucune candidature pour le moment." : "No applications yet."}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-muted/40 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-bold mt-0.5" style={{ fontFamily: "Geist Mono, monospace" }}>{value}</p></div>;
}
