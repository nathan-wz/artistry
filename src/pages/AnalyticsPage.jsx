import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";

import { Eye, Heart, MessageSquare, DollarSign, Loader2 } from "lucide-react";

export default function AnalyticsPage() {
    const { user } = useAuth();
    const userId = user?.uid;

    const [stats, setStats] = useState({
        views: 0,
        likes: 0,
        comments: 0,
        earnings: 0,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const loadAnalytics = async () => {
            try {
                const artworksQ = query(
                    collection(db, "artworks"),
                    where("userId", "==", userId)
                );
                const artworksSnap = await getDocs(artworksQ);

                let totalViews = 0;
                let totalLikes = 0;
                let totalComments = 0;

                for (const artDoc of artworksSnap.docs) {
                    const art = artDoc.data();
                    const artId = artDoc.id;

                    totalViews += art.views?.length || 0;
                    totalLikes += art.likes?.length || 0;

                    const commentsSnap = await getDocs(
                        collection(db, "artworks", artId, "comments")
                    );
                    totalComments += commentsSnap.size;
                }

                const donationsSnap = await getDocs(
                    collection(db, "users", userId, "donations")
                );

                const totalEarnings = donationsSnap.docs.reduce(
                    (sum, doc) => sum + (doc.data().amount || 0),
                    0
                );

                setStats({
                    views: totalViews,
                    likes: totalLikes,
                    comments: totalComments,
                    earnings: totalEarnings,
                });
            } catch (err) {
                console.error("Analytics load error:", err);
            }

            setLoading(false);
        };

        loadAnalytics();
    }, [userId]);

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
            <div className="p-10 flex flex-col items-center space-y-10">
                <h1 className="text-4xl font-bold text-dark-red">
                    Analytics Dashboard
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl">
                    <StatCard
                        label="Total Views"
                        value={stats.views}
                        icon={<Eye className="h-10 w-10 text-blue-700" />}
                        bg="bg-blue-100/70"
                        textColor="text-blue-800"
                    />

                    <StatCard
                        label="Total Likes"
                        value={stats.likes}
                        icon={<Heart className="h-10 w-10 text-pink-700" />}
                        bg="bg-pink-100/70"
                        textColor="text-pink-800"
                    />

                    <StatCard
                        label="Total Comments"
                        value={stats.comments}
                        icon={
                            <MessageSquare className="h-10 w-10 text-yellow-700" />
                        }
                        bg="bg-yellow-100/70"
                        textColor="text-yellow-800"
                    />

                    <StatCard
                        label="Total Earnings"
                        value={`$${stats.earnings.toFixed(2)}`}
                        icon={
                            <DollarSign className="h-10 w-10 text-green-700" />
                        }
                        bg="bg-green-100/70"
                        textColor="text-green-800"
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}

function StatCard({ label, value, icon, bg, textColor }) {
    return (
        <Card
            className={`${bg} rounded-2xl shadow-md hover:shadow-xl transition-all p-6 flex flex-col items-center text-center`}
        >
            <div className="mb-4">{icon}</div>
            <h3 className={`text-lg font-semibold ${textColor}`}>{label}</h3>
            <p className={`text-4xl font-bold mt-2 ${textColor}`}>{value}</p>
        </Card>
    );
}
