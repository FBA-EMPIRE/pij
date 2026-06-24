import { Navigate } from "react-router";
import { useAppContext } from "../context/AppContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, sessionLoading } = useAppContext();

  if (sessionLoading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
