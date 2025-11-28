import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";

export default function Navbar() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <header className="bg-white sticky top-0 w-full px-6 py-4 flex items-center justify-between z-100">
            {/* Left: Brand */}
            <div className="text-dark-red text-xl font-bold tracking-wide">
                Artistry
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 mx-6">
                <input
                    type="text"
                    placeholder="search"
                    className="bg-light border-copper-orange text-rich-black w-full px-4 py-2 rounded-full border"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            navigate(`/search?q=${e.target.value}`);
                        }
                    }}
                />
            </div>

            {/* Right: Auth Buttons */}
            <div className="flex gap-3">
                {!user ? (
                    <>
                        <Link
                            to={"/login"}
                            className="bg-dark-red text-light px-4 py-2 rounded-full font-semibold uppercase"
                        >
                            Log in
                        </Link>
                        <Link
                            to={"/signup"}
                            className="bg-transparent text-dark-red border-dark-red px-4 py-2 rounded-full font-semibold uppercase border"
                        >
                            Sign up
                        </Link>
                    </>
                ) : (
                    <button
                        onClick={handleSignOut}
                        className="bg-dark text-light px-4 py-2 rounded-full font-semibold uppercase"
                    >
                        Signout
                    </button>
                )}
            </div>
        </header>
    );
}
