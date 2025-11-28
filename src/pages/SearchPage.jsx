import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import MasonryFeed from "../components/common/MasonryFeed";
import DashboardLayout from "../components/layout/DashboardLayout";

export default function SearchPage() {
    const [params] = useSearchParams();
    const term = params.get("q")?.toLowerCase().trim();
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (!term) return;

        const fetchSearch = async () => {
            const q = query(
                collection(db, "artworks"),
                where("searchIndex", "array-contains", term)
            );

            const snap = await getDocs(q);
            const items = snap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            }));

            setResults(items);
        };

        fetchSearch();
    }, [term]);

    return (
        <DashboardLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">
                    Results for "{term}"
                </h1>

                <MasonryFeed items={results} />
            </div>
        </DashboardLayout>
    );
}
