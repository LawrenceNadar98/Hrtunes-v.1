import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import { isFirebaseConfigured } from "@/lib/firebase";

import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Instructor from "@/pages/Instructor";
import PlanDetails from "@/pages/PlanDetails";
import CoursesCatalog from "@/pages/CoursesCatalog";
import PlansCatalog from "@/pages/PlansCatalog";

function RequireAdmin({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-white/70">Checking admin access…</div>;
    }
    if (
        !isFirebaseConfigured ||
        !user?.uid ||
        !["admin", "instructor"].includes(user.role)
    ) {
        return <Navigate to="/admin/login" replace />;
    }
    return children;
}

function App() {
    useEffect(() => {
        document.getElementById("emergent-badge")?.remove();
    }, []);

    return (
        <AuthProvider>
            <div className="App">
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/courses" element={<CoursesCatalog />} />
                        <Route path="/plans" element={<PlansCatalog />} />
                        <Route path="/plans/:planId" element={<PlanDetails />} />
                        <Route path="/admin/login" element={<Auth mode="login" adminOnly />} />
                        <Route path="/admin/dashboard" element={<RequireAdmin><Instructor /></RequireAdmin>} />
                        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
                        <Route path="/instructor/*" element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="/book-trial" element={<Navigate to="/plans/free-trial" replace />} />
                        <Route path="/login" element={<Navigate to="/" replace />} />
                        <Route path="/signup" element={<Navigate to="/" replace />} />
                        <Route path="/dashboard/*" element={<Navigate to="/" replace />} />
                        <Route path="/checkout" element={<Navigate to="/plans" replace />} />
                        <Route path="/payment-status/*" element={<Navigate to="/plans" replace />} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
                <Toaster theme="dark" richColors position="bottom-right" />
            </div>
        </AuthProvider>
    );
}

export default App;
