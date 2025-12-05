import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import {
    collection,
    doc,
    getDocs,
    getDoc,
    onSnapshot,
    query,
    orderBy,
    addDoc,
    serverTimestamp,
    updateDoc,
    arrayUnion,
    arrayRemove,
} from "firebase/firestore";
import DashboardLayout from "../components/layout/DashboardLayout";
import MasonryFeed from "../components/common/MasonryFeed";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import {
    Heart,
    MessageSquare,
    DollarSign,
    CircleUserRound,
    X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

export default function ImagePage() {
    const { id } = useParams();
    const { user } = useAuth();
    const userId = user?.uid;

    const [author, setAuthor] = useState({ username: "Unknown" });
    const [image, setImage] = useState(null);
    const [likes, setLikes] = useState([]);
    const [commentsCount, setCommentsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [artworks, setArtworks] = useState([]);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    // Load artwork & author
    useEffect(() => {
        const artworkRef = doc(db, "artworks", id);
        const unsubscribe = onSnapshot(artworkRef, async (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setImage(data);
                setLikes(data.likes || []);
                setCommentsCount(data.commentsCount || 0);

                if (data.userId) {
                    const userRef = doc(db, "users", data.userId);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        setAuthor(userSnap.data());
                    }
                }
            } else {
                setImage(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id]);

    // Load artworks for Masonry feed
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

    // Load comments
    useEffect(() => {
        if (!commentsOpen) return;
        const commentsRef = collection(db, "artworks", id, "comments");
        const q = query(commentsRef, orderBy("createdAt", "asc"));
        const unsubscribe = onSnapshot(q, async (snap) => {
            const loadedComments = await Promise.all(
                snap.docs.map(async (docSnap) => {
                    const c = docSnap.data();
                    if (c.userId) {
                        const userRef = doc(db, "users", c.userId);
                        const userSnap = await getDoc(userRef);
                        c.userData = userSnap.exists() ? userSnap.data() : null;
                    }
                    return { id: docSnap.id, ...c };
                })
            );
            setComments(loadedComments);
            setCommentsCount(loadedComments.length); // dynamically update
        });

        return () => unsubscribe();
    }, [commentsOpen, id]);

    const handleLikeToggle = async () => {
        if (!userId) return toast.error("You must be logged in to like!");
        const ref = doc(db, "artworks", id);

        if (likes.includes(userId)) {
            await updateDoc(ref, { likes: arrayRemove(userId) });
        } else {
            await updateDoc(ref, { likes: arrayUnion(userId) });
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        const commentRef = collection(db, "artworks", id, "comments");
        await addDoc(commentRef, {
            text: newComment.trim(),
            userId,
            createdAt: serverTimestamp(),
        });
        setNewComment("");
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
            <div className="w-[80%] border-2 rounded-lg p-5 mb-5 flex gap-10 relative">
                {/* Left side */}
                <div className="flex flex-col space-y-5 shrink-0">
                    <Link to={`/profile/${author.username}`}>
                        <h4 className="flex space-x-2 items-center">
                            {author.photoURL ? (
                                <img
                                    src={author.photoURL}
                                    className="rounded-full h-8 w-8"
                                />
                            ) : (
                                <CircleUserRound className="h-8 w-8" />
                            )}
                            <span>{author.username}</span>
                        </h4>
                    </Link>

                    <img
                        src={image.imageUrl}
                        className="max-w-full max-h-[500px] object-contain rounded-xl"
                        alt=""
                    />

                    <div className="flex space-x-5 items-center">
                        <Button
                            variant="outline"
                            onClick={() => setCommentsOpen(true)}
                            className="flex items-center gap-2 bg-white text-rich-black border border-gray-300 rounded-xl shadow-sm hover:bg-gray-100 hover:shadow-md transition-all"
                        >
                            <MessageSquare className="h-4 w-4" />
                            {commentsCount} comments
                        </Button>

                        {/* Likes Button */}
                        <Button
                            variant="outline"
                            onClick={handleLikeToggle}
                            className="
            flex items-center gap-2 
            bg-white 
            text-rich-black 
            border border-gray-300 
            rounded-xl 
            shadow-sm 
            hover:bg-gray-100 
            hover:shadow-md 
            transition-all
        "
                        >
                            <Heart
                                className="h-4 w-4"
                                color={likes.includes(userId) ? "red" : "black"}
                            />
                            {likes.length} likes
                        </Button>
                        {/* <Button>
                            <DollarSign /> Donate
                        </Button> */}
                    </div>
                </div>

                {/* Right side: title, description */}
                <div className="flex flex-col flex-1 max-h-[500px] overflow-hidden">
                    <h2 className="text-xl font-bold">{image.title}</h2>
                    <p className="mb-4">{image.description}</p>

                    {image.tags?.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                            {image.tags.map((tag, idx) => (
                                <Badge
                                    key={idx}
                                    variant="outline"
                                    className="px-2 py-1 rounded-md"
                                >
                                    #{tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                {/* Comments drawer with animation */}
                <AnimatePresence>
                    {commentsOpen && (
                        <motion.div
                            initial={{ x: 350, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 350, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            }}
                            className="absolute top-0 right-0 w-[500px] h-full bg-white rounded-l-lg shadow-xl p-4 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg">Comments</h3>
                                <X
                                    className="cursor-pointer"
                                    onClick={() => setCommentsOpen(false)}
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3">
                                {comments.map((c) => (
                                    <div
                                        key={c.id}
                                        className="flex items-start space-x-2 bg-gray-100 p-2 rounded-lg"
                                    >
                                        {c.userData?.photoURL ? (
                                            <img
                                                src={c.userData.photoURL}
                                                className="h-8 w-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <CircleUserRound className="h-8 w-8" />
                                        )}
                                        <div>
                                            <p className="font-semibold text-black">
                                                {c.userData?.username ||
                                                    "Unknown"}
                                            </p>
                                            <p className="text-black text-sm whitespace-pre-wrap">
                                                {c.text}
                                            </p>
                                            {c.createdAt?.toDate && (
                                                <p className="text-gray-500 text-xs">
                                                    {formatDistanceToNow(
                                                        c.createdAt.toDate(),
                                                        { addSuffix: true }
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex flex-col gap-2">
                                <Textarea
                                    placeholder="Add a comment..."
                                    value={newComment}
                                    onChange={(e) =>
                                        setNewComment(e.target.value)
                                    }
                                    className="flex-1 resize-none"
                                    rows={1}
                                />
                                <Button onClick={handleAddComment}>Send</Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Masonry feed below */}
            <MasonryFeed items={artworks} />
        </DashboardLayout>
    );
}
