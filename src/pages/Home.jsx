import { useState, useEffect } from "react";
import MasonryFeed from "../components/common/MasonryFeed";
import DashboardLayout from "../components/layout/DashboardLayout";
import { db } from "../lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Loader2 } from "lucide-react";

export default function Home() {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtworks = async () => {
            const q = query(
                collection(db, "artworks"),
                orderBy("createdAt", "desc")
            );

            const snapshot = await getDocs(q);
            const items = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setArtworks(items);
        };

        fetchArtworks();
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center mt-40">
                    <Loader2 className="animate-spin w-10 h-10 text-dark-red" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <MasonryFeed items={artworks} />
        </DashboardLayout>
    );
}
