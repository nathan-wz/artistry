import { useState, useEffect } from "react";
import { Home, User, ChevronLeft, ChevronRight, ImagePlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function Sidebar() {
    const [username, setUsername] = useState("");
    const [collapsed, setCollapsed] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userRef = doc(db, "users", user?.uid);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    console.warn("User document missing");
                    setUsername(null);
                } else {
                    const userData = userSnap.data();
                    setUsername(userData.username);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchUserData();
    }, [user]);

    return (
        <aside
            className={`sticky top-20 h-[calc(100vh-5rem)] transition-all duration-300 z-40 bg-rich-black text-pale-sand flex flex-col items-center py-6 ${
                collapsed ? "p-2" : "p-6"
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
                <Link to={`/profile/${username}`} className="side-menu-button">
                    <User size={24} />
                    {!collapsed && <span>Profile</span>}
                </Link>
            </nav>
        </aside>
    );
}
