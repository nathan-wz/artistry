import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/home";
import ImagePage from "./pages/ImagePage";
import UploadPage from "./pages/UploadPage";

function App() {
    return (
        <div className="min-h-screen">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/image" element={<ImagePage />} />
                    <Route path="/upload" element={<UploadPage />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
