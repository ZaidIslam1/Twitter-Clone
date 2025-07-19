import { Navigate, Route, Routes } from "react-router-dom";
import Homepage from "./pages/home/Homepage.jsx";
import LoginPage from "./pages/auth/login/LoginPage.jsx";
import SignUpPage from "./pages/auth/signup/SignUpPage.jsx";
import Sidebar from "./components/common/Sidebar.jsx";
import RightPanel from "./components/common/RightPanel.jsx";
import NotificationPage from "./pages/notification/NotificationPage.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner.jsx";

function App() {
    const { data: authUser, isLoading } = useQuery({
        queryKey: ["authUser"],
        queryFn: async () => {
            try {
                const res = await fetch("/api/auth/check-auth");
                const data = await res.json();
                if (data.error) return null;
                if (!res.ok) throw new Error(data.error);
                return data;
            } catch (error) {
                throw new Error(error);
            }
        },
        retry: false,
    });

    if (isLoading) {
        return (
            <div className="h-screen flex justify-center items-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex max-w-6xl mx-auto">
            {authUser && <Sidebar authUser={authUser} />}
            <Routes>
                <Route path="/" element={authUser ? <Homepage /> : <Navigate to="/login" />} />
                <Route
                    path="/notifications"
                    element={authUser ? <NotificationPage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/profile/:username"
                    element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
                />
                <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
                <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
            </Routes>
            {authUser && <RightPanel authUser={authUser} />}
        </div>
    );
}

export default App;
