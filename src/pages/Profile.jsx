import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { auth, db } from "../lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleUserRound, ImageOff } from "lucide-react";
import MasonryFeed from "../components/common/MasonryFeed";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
    const { username } = useParams();
    const { user } = useAuth();

    const [profile, setProfile] = useState(null);
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileAndArtworks = async () => {
            setLoading(true);
            try {
                // Fetch the user document by username
                const usersRef = collection(db, "users");
                const qUser = query(
                    usersRef,
                    where("username", "==", username)
                );
                const userSnap = await getDocs(qUser);

                if (userSnap.empty) {
                    setProfile(null);
                    setArtworks([]);
                    return;
                }

                const userData = userSnap.docs[0].data();
                const uid = userSnap.docs[0].id;
                setProfile({ uid, ...userData });

                // Fetch artworks using the UID
                const artworksRef = collection(db, "artworks");
                const qArtworks = query(
                    artworksRef,
                    where("userId", "==", uid),
                    orderBy("createdAt", "desc")
                );
                const artworksSnap = await getDocs(qArtworks);
                const items = artworksSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setArtworks(items);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileAndArtworks();
    }, [username]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-6 text-lg">Loading profile...</div>
            </DashboardLayout>
        );
    }

    if (!profile) {
        return (
            <DashboardLayout>
                <div className="p-6 text-lg">User not found</div>
            </DashboardLayout>
        );
    }

    const isOwner = user?.uid === profile.uid; // profile.uid may need to be saved in Firestore

    return (
        <DashboardLayout>
            <Card className="w-full max-w-3xl mx-auto space-y-6">
                <CardHeader className="flex flex-col justify-center items-center gap-4">
                    {profile.photoURL ? (
                        <img src={profile.photoURL} className="rounded-full" />
                    ) : (
                        <CircleUserRound size={120} />
                    )}
                    <h2>{profile.displayName || profile.username}</h2>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p>
                        <strong>Username:</strong> {profile.username}
                    </p>
                    <p>
                        <strong>Display Name:</strong> {profile.displayName}
                    </p>
                    <p>
                        <strong>Email:</strong> {profile.email}
                    </p>
                </CardContent>
                {isOwner && (
                    <CardFooter>
                        <Link to={"/edit-profile"}>
                            <Button>Update Profile</Button>
                        </Link>
                    </CardFooter>
                )}
            </Card>

            <div className="mt-20">
                {artworks.length > 0 ? (
                    <MasonryFeed items={artworks} />
                ) : (
                    <div className="flex flex-col items-center text-gray-400 py-10">
                        <ImageOff size={60} />
                        <p className="mt-3 text-lg">
                            {isOwner ? "You have" : "This user has"} not
                            published any artworks yet.
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
