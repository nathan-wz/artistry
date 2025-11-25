import { useState, useEffect } from "react";
import MasonryFeed from "../components/common/MasonryFeed";
import DashboardLayout from "../components/layout/DashboardLayout";
import { db } from "../lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function Home() {
    const [artworks, setArtworks] = useState([]);

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
    }, []);

    return (
        <DashboardLayout>
            <MasonryFeed items={artworks} />
        </DashboardLayout>
    );
}
