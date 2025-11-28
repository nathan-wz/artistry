import { useState } from "react";
import { db } from "../../lib/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { CircleUserRound, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";

function timeAgo(timestamp) {
    if (!timestamp) return "Just now";
    const now = new Date();
    const commentDate = new Date(timestamp.seconds * 1000);
    const diff = now - commentDate;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return commentDate.toLocaleDateString();
}

export default function Comment({ comment, artworkId, onDelete }) {
    const { user } = useAuth();
    const canDelete = user && user.uid === comment.userId;
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        try {
            const commentRef = doc(
                db,
                "artworks",
                artworkId,
                "comments",
                comment.id
            );
            await deleteDoc(commentRef);
            onDelete(comment.id);
            // decrement handled by onSnapshot in parent
            setOpen(false);
            toast.success("Comment deleted!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete comment");
        }
    };

    return (
        <Card className="mb-2 p-2">
            <div className="flex items-start justify-between">
                <div className="flex flex-col space-y-1 w-full">
                    <div className="flex items-center space-x-2">
                        <CircleUserRound size={32} />
                        <p className="font-semibold">
                            {comment.userName || "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-500">
                            {timeAgo(comment.createdAt)}
                        </p>
                    </div>
                    <p className="whitespace-pre-wrap mt-1">{comment.text}</p>
                </div>

                {canDelete && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                className="text-red-500 hover:text-red-700 p-1"
                            >
                                <Trash2 size={20} />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px]">
                            <DialogHeader>
                                <DialogTitle>Delete Comment?</DialogTitle>
                            </DialogHeader>
                            <p>This action cannot be undone.</p>
                            <DialogFooter className="mt-4 flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </Card>
    );
}
