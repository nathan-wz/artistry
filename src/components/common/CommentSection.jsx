import { useEffect, useState, useRef } from "react";
import { db } from "../../lib/firebase";
import {
    collection,
    getDocs,
    addDoc,
    query,
    orderBy,
    limit,
    startAfter,
    serverTimestamp,
} from "firebase/firestore";
import Comment from "./Comment";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function CommentSection({ artworkId }) {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [lastVisible, setLastVisible] = useState(null);
    const scrollRef = useRef(null);

    const INITIAL_LIMIT = 2;
    const LOAD_MORE_COUNT = 10;

    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            try {
                const commentsRef = collection(
                    db,
                    "artworks",
                    artworkId,
                    "comments"
                );
                const q = query(
                    commentsRef,
                    orderBy("createdAt", "desc"),
                    limit(INITIAL_LIMIT)
                );
                const snapshot = await getDocs(q);
                const fetchedComments = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setComments(fetchedComments);
                setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchComments();
    }, [artworkId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [comments]);

    const loadMoreComments = async () => {
        if (!lastVisible) return;
        try {
            const commentsRef = collection(
                db,
                "artworks",
                artworkId,
                "comments"
            );
            const q = query(
                commentsRef,
                orderBy("createdAt", "desc"),
                startAfter(lastVisible),
                limit(LOAD_MORE_COUNT)
            );
            const snapshot = await getDocs(q);
            const fetchedComments = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setComments((prev) => [...prev, ...fetchedComments]);
            setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddComment = async () => {
        if (!user) return toast.error("You must be logged in to comment!");
        if (!newComment.trim()) return;

        try {
            const commentsRef = collection(
                db,
                "artworks",
                artworkId,
                "comments"
            );
            await addDoc(commentsRef, {
                text: newComment.trim(),
                userId: user.uid,
                userName: user.displayName || "Anonymous",
                createdAt: serverTimestamp(),
            });

            setNewComment("");
            toast.success("Comment added!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to add comment");
        }
    };

    const handleDeleteComment = (id) => {
        setComments((prev) => prev.filter((c) => c.id !== id));
    };

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-2">Comments</h3>
            <div className="flex-1 overflow-y-auto mb-2 space-y-2">
                {loading && <p>Loading comments...</p>}

                {comments.map((c) => (
                    <Comment
                        key={c.id}
                        comment={c}
                        artworkId={artworkId}
                        onDelete={handleDeleteComment}
                    />
                ))}

                {lastVisible && (
                    <Button
                        variant="link"
                        className="mt-2 p-0"
                        onClick={loadMoreComments}
                    >
                        Show more
                    </Button>
                )}

                <div ref={scrollRef} />
            </div>

            <div className="mt-auto space-y-2">
                <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                    className="w-full resize-none"
                />
                <Button onClick={handleAddComment}>Post Comment</Button>
            </div>
        </div>
    );
}
