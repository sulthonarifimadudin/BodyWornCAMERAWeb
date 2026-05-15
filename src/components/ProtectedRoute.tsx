import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import DashboardLayout from "./DashboardLayout";

export const ProtectedRoute = () => {
    const { isLoggedIn, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    return isLoggedIn ? (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    ) : <Navigate to="/login" replace />;
};
