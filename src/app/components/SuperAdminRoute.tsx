import { Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { CURRENT_ADMIN } from "./mockData";

interface SuperAdminRouteProps {
  children: React.ReactNode;
  lang?: "fr" | "en";
}

export default function SuperAdminRoute({ children, lang = "fr" }: SuperAdminRouteProps) {
  const navigate = useNavigate();
  const fr = lang === "fr";

  if (CURRENT_ADMIN.role !== "super_admin") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
            <Shield size={30} color="#E5484D" />
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
            {fr ? "Accès refusé" : "Access Denied"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {fr
              ? "Vous n'avez pas les permissions nécessaires pour accéder à cette page."
              : "You do not have permission to access this page."}
          </p>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium mx-auto hover:opacity-90 transition-all"
            style={{ background: "#4CAF68" }}
          >
            <ArrowLeft size={15} />
            {fr ? "Retour au tableau de bord" : "Back to dashboard"}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
