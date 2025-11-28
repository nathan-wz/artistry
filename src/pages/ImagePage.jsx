import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    onSnapshot,
    query,
    orderBy,
} from "firebase/firestore";
import MasonryFeed from "../components/common/MasonryFeed";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Heart,
    MessageSquare,
    DollarSign,
    CircleUserRound,
} from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import CommentSection from "../components/common/CommentSection";

export default function ImagePage() {
    const { id } = useParams();
    const { user } = useAuth();
    const userId = user?.uid;

    const [author, setAuthor] = useState(null);
    const [image, setImage] = useState(null);
    const [likes, setLikes] = useState([]);
    const [commentsCount, setCommentsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [artworks, setArtworks] = useState([]);

    // Real-time listener for this artwork
    useEffect(() => {
        const artworkRef = doc(db, "artworks", id);
        const unsubscribe = onSnapshot(artworkRef, async (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setImage(data);
                setLikes(data.likes || []);
                setCommentsCount(data.commentsCount || 0);

                // Fetch author info
                if (data.userId) {
                    try {
                        const userRef = doc(db, "users", data.userId);
                        const userSnap = await getDoc(userRef);
                        if (userSnap.exists()) {
                            setAuthor(userSnap.data());
                        } else {
                            setAuthor({ username: "Unknown", photoUrl: null });
                        }
                    } catch (err) {
                        console.error("Error fetching author:", err);
                    }
                }
            } else {
                setImage(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id]);

    // Fetch artworks for Masonry feed
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

    const handleLikeToggle = async () => {
        if (!userId) return toast.error("You must be logged in to like!");
        const ref = doc(db, "artworks", id);

        if (likes.includes(userId)) {
            await updateDoc(ref, { likes: arrayRemove(userId) });
        } else {
            await updateDoc(ref, { likes: arrayUnion(userId) });
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-6 text-lg">Loading...</div>
            </DashboardLayout>
        );
    }

    if (!image) {
        return (
            <DashboardLayout>
                <div className="p-6 text-lg">Artwork not found</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="w-[80%] border-2 rounded-lg p-5 mb-5 flex gap-10">
                {/* Left side: image + actions */}
                <div className="flex flex-col space-y-5 shrink-0">
                    <h4>Author Name</h4>
                    <img
                        src={image.imageUrl}
                        className="max-w-full max-h-[500px] object-contain rounded-xl"
                        alt=""
                    />
                    <div className="flex space-x-5 items-center">
                        <Button>
                            <DollarSign /> Donate
                        </Button>
                        <div
                            className="text-center cursor-pointer"
                            onClick={handleLikeToggle}
                        >
                            <Heart
                                size={32}
                                color={likes.includes(userId) ? "red" : "black"}
                            />
                            {likes.length}
                        </div>
                        <div className="text-center items-center gap-1">
                            <MessageSquare size={32} />
                            {commentsCount}
                        </div>
                    </div>
                </div>

                {/* Right side: title, description, comments */}
                <div className="flex flex-col flex-1 max-h-[500px]">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold">{image.title}</h2>
                        <p>{image.description}</p>
                    </div>

                    {image.tags && image.tags.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                                Tags
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {image.tags.map((tag, index) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className="px-2 py-1 rounded-md"
                                    >
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Comment Section */}
                    <div className="flex-1 min-h-0">
                        <CommentSection artworkId={id} />
                    </div>
                </div>
            </div>

            {/* Masonry feed below */}
            <MasonryFeed items={artworks} />
        </DashboardLayout>
    );
}
