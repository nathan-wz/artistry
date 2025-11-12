import { Link } from "react-router-dom";
export default function Navbar() {
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
                />
            </div>

            {/* Right: Auth Buttons */}
            <div className="flex gap-3">
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
            </div>
        </header>
    );
}
