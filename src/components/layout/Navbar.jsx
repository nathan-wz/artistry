import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { auth, db } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState, useRef } from "react";

export default function Navbar() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [allTerms, setAllTerms] = useState([]); // Loaded once
    const [highlightIndex, setHighlightIndex] = useState(-1);

    const inputRef = useRef(null);
    const wrapperRef = useRef(null);

    // Load all search terms ONCE
    useEffect(() => {
        async function loadSearchTerms() {
            const snap = await getDocs(collection(db, "artworks"));

            // Use a Map to avoid duplicates
            const uniqueMap = new Map();

            snap.forEach((doc) => {
                const data = doc.data();

                if (data.searchIndex && Array.isArray(data.searchIndex)) {
                    data.searchIndex.forEach((term) => {
                        const lower = term.toLowerCase();

                        // Only keep unique terms
                        if (!uniqueMap.has(lower)) {
                            uniqueMap.set(lower, {
                                term: lower,
                                id: doc.id, // keep first artwork containing this term
                            });
                        }
                    });
                }
            });

            // Convert Map → array
            setAllTerms(Array.from(uniqueMap.values()));
        }

        loadSearchTerms();
    }, []);

    // Filter suggestions locally
    useEffect(() => {
        if (!search.trim()) {
            setSuggestions([]);
            return;
        }

        const filtered = allTerms
            .filter((item) =>
                item.term.toLowerCase().includes(search.toLowerCase())
            )
            .slice(0, 7); // Limit for clarity

        setSuggestions(filtered);
    }, [search, allTerms]);

    // Click outside to close suggestions
    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setSuggestions([]);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        await signOut(auth);
        navigate("/login");
    };

    // Keyboard navigation + Enter selection
    const handleKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            setHighlightIndex((prev) =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === "ArrowUp") {
            setHighlightIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter") {
            if (highlightIndex >= 0 && suggestions[highlightIndex]) {
                const selected = suggestions[highlightIndex];
                navigate(`/search?q=${selected.term}`);
                setSuggestions([]);
            } else {
                navigate(`/search?q=${search}`);
            }
        }
    };

    return (
        <header className="bg-white sticky top-0 w-full px-6 py-4 flex items-center justify-between z-100 shadow-sm">
            {/* Left: Brand */}
            <Link to={"/"}>
                <div className="text-dark-red text-xl font-bold tracking-wide">
                    Artistry
                </div>
            </Link>

            {/* Center: Search Bar */}
            <div className="flex-1 mx-6 relative" ref={wrapperRef}>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search artworks..."
                    className="bg-light border-copper-orange text-rich-black w-full px-4 py-2 rounded-full border outline-none"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setHighlightIndex(-1);
                    }}
                    onKeyDown={handleKeyDown}
                />

                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
                        {suggestions.map((s, index) => (
                            <div
                                key={`${s.id}-${s.term}`}
                                className={`px-4 py-2 cursor-pointer ${
                                    highlightIndex === index
                                        ? "bg-dark-red text-white"
                                        : "hover:bg-light hover:text-rich-black"
                                }`}
                                onClick={() => {
                                    navigate(`/search?q=${s.term}`);
                                    setSuggestions([]);
                                }}
                            >
                                {s.term}
                            </div>
                        ))}
                    </div>
                )}
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
                        className="bg-dark text-dark-red px-5 py-2.5 rounded-full font-semibold uppercase shadow-sm hover:bg-dark/90 hover:shadow-md active:scale-95 transition-all duration-200 "
                    >
                        Sign out
                    </button>
                )}
            </div>
        </header>
    );
}
