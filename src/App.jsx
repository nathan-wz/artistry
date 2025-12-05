import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import ImagePage from "./pages/ImagePage";
import UploadPage from "./pages/UploadPage";
import ProtectedRoute from "./pages/routes/ProtectedRoute";
import { Toaster } from "sonner";
import Profile from "./pages/Profile";
import SearchPage from "./pages/SearchPage";
import EditProfile from "./pages/EditProfile";

function App() {
    return (
        <div className="min-h-screen">
            <Toaster richColors position="top-right" />
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/image/:id" element={<ImagePage />} />
                    <Route path="/search" element={<SearchPage />} />

                    {/* Protected routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/upload" element={<UploadPage />} />
                        <Route
                            path="/profile/:username"
                            element={<Profile />}
                        />
                        <Route path="/edit-profile" element={<EditProfile />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
