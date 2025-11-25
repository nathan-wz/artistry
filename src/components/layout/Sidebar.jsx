import { useState } from "react";
import { Home, User, ChevronLeft, ChevronRight, ImagePlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const { user } = useAuth();

    return (
        <aside
            className={`sticky top-20 h-[calc(100vh-5rem)] transition-all duration-300 z-40 bg-rich-black text-pale-sand flex flex-col items-center py-6 ${
                collapsed ? "w-20" : "w-64"
            }`}
        >
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="mb-6 text-light hover:text-pale-sand"
            >
                {collapsed ? (
                    <ChevronRight size={24} />
                ) : (
                    <ChevronLeft size={24} />
                )}
            </button>

            <nav className="flex flex-col space-y-3 w-full px-4">
                <Link to={"/home"} className="side-menu-button">
                    <Home size={24} />
                    {!collapsed && <span>Home</span>}
                </Link>
                <Link to={"/upload"} className="side-menu-button">
                    <ImagePlus size={24} />
                    {!collapsed && <span>Create</span>}
                </Link>
                <Link to={`/profile/${user.uid}`} className="side-menu-button">
                    <User size={24} />
                    {!collapsed && <span>Profile</span>}
                </Link>
            </nav>
        </aside>
    );
}
