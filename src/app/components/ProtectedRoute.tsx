import { Navigate } from "react-router";
import { useAppContext } from "../context/AppContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  type?: "member" | "admin";
}

export default function ProtectedRoute({ children, type = "member" }: ProtectedRouteProps) {
  const { user, admin } = useAppContext();

  if (type === "admin" && !admin) {
    return <Navigate to="/login" replace />;
  }

  if (type === "member" && !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
