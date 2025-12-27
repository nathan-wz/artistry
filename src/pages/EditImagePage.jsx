import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { db } from "../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "../components/layout/DashboardLayout";
import axios from "axios";

export default function EditImagePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    useEffect(() => {
        const fetchArtwork = async () => {
            const docRef = doc(db, "artworks", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setTitle(data.title);
                setDescription(data.description);
                setTags(data.tags || []);
                setPreviewUrl(data.imageUrl);
            } else {
                toast.error("Artwork not found");
                navigate("/");
            }
        };
        fetchArtwork();
    }, [id]);

    const onDrop = useCallback((acceptedFiles) => {
        const selected = acceptedFiles[0];
        if (selected) {
            setFile(selected);
            setPreviewUrl(URL.createObjectURL(selected));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [] },
        multiple: false,
    });

    const handleAddTag = () => {
        const value = tagInput.trim();
        if (value && !tags.includes(value.toLowerCase())) {
            setTags([...tags, value.toLowerCase()]);
        }
        setTagInput("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            handleAddTag();
        }
    };

    const removeTag = (indexToRemove) => {
        setTags(tags.filter((_, i) => i !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !description) {
            toast.error("Please fill all fields!");
            return;
        }

        setUploading(true);
        let imageUrl = previewUrl;

        try {
            if (file) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("upload_preset", UPLOAD_PRESET);

                const res = await axios.post(
                    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                    formData,
                    {
                        onUploadProgress: (progressEvent) => {
                            const percent = Math.round(
                                (progressEvent.loaded * 100) /
                                    progressEvent.total
                            );
                            setProgress(percent);
                        },
                    }
                );
                imageUrl = res.data.secure_url;
            }

            const docRef = doc(db, "artworks", id);
            await updateDoc(docRef, {
                title,
                description,
                tags,
                imageUrl,
            });

            toast.success("Artwork updated successfully!");
            navigate(`/image/${id}`);
        } catch (err) {
            console.error(err);
            toast.error("Update failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <DashboardLayout>
            <form
                onSubmit={handleSubmit}
                className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 px-6"
            >
                <div className="space-y-6">
                    <div
                        {...getRootProps()}
                        className={`border-4 border-dark-red rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 hover:shadow-2xl ${
                            isDragActive
                                ? "border-rust-red bg-light/20"
                                : "bg-light/10 border-dark-red"
                        }`}
                    >
                        <input {...getInputProps()} />
                        <p>
                            {isDragActive
                                ? "Drop image..."
                                : "Drag & drop or click"}
                        </p>
                    </div>

                    {previewUrl && (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full object-contain max-h-[400px] rounded-2xl border-2 border-dark-red shadow-lg"
                        />
                    )}
                </div>

                <div className="space-y-6 flex flex-col">
                    <div className="space-y-4">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title"
                        />
                    </div>
                    <div className="space-y-4">
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-3 p-3 rounded-xl border-2 border-dark-red bg-light/20">
                            {tags.map((tag, idx) => (
                                <Badge
                                    key={idx}
                                    className="px-3 py-1 rounded-full flex items-center gap-2 cursor-pointer"
                                    onClick={() => removeTag(idx)}
                                >
                                    {tag}
                                    <X
                                        size={16}
                                        className="hover:text-rust-red"
                                    />
                                </Badge>
                            ))}
                            <Input
                                placeholder="Add tag"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="border-none bg-transparent"
                            />
                        </div>
                    </div>

                    <Button type="submit" disabled={uploading}>
                        {uploading ? `Updating ${progress}%` : "Update Artwork"}
                    </Button>
                </div>
            </form>
        </DashboardLayout>
    );
}
