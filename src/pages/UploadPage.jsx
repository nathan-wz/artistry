import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import axios from "axios";
import { db, auth } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

export default function UploadPage() {
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

    const removeTag = (tag) => {
        setTags(tags.filter((t) => t !== tag));
    };

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

    const buildSearchIndex = (title, description, tags) => {
        const words = [
            ...title.toLowerCase().split(" "),
            ...description.toLowerCase().split(" "),
            ...tags.map((t) => t.toLowerCase()),
        ];
        return [...new Set(words.filter(Boolean))];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !title || !description) {
            toast.error("Please fill all fields and select an image!");
            return;
        }

        setUploading(true);
        setProgress(0);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", UPLOAD_PRESET);

            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                formData,
                {
                    onUploadProgress: (progressEvent) => {
                        const percent = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setProgress(percent);
                    },
                }
            );

            const imageUrl = res.data.secure_url;

            await addDoc(collection(db, "artworks"), {
                title,
                description,
                imageUrl,
                tags,
                searchIndex: buildSearchIndex(title, description, tags),
                userId: auth.currentUser?.uid || null,
                createdAt: serverTimestamp(),
            });

            toast.success("Artwork uploaded successfully");

            setFile(null);
            setPreviewUrl(null);
            setTitle("");
            setDescription("");
            setTags([]);
            setTagInput("");
            setProgress(0);
        } catch (err) {
            console.error("Upload error: ", err);
            toast.error("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    return (
        <DashboardLayout>
            <form
                onSubmit={handleSubmit}
                className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 px-6"
            >
                {/* Left Column: Dropzone & Preview */}
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
                        <p className="text-dark-red text-lg font-semibold text-center">
                            {isDragActive
                                ? "Drop your artwork here..."
                                : "Drag & drop an image, or click to select"}
                        </p>
                    </div>

                    {previewUrl && (
                        <div className="rounded-2xl overflow-hidden border-2 border-dark-red shadow-lg">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full object-contain max-h-[400px]"
                            />
                        </div>
                    )}
                </div>

                {/* Right Column: Artwork Details */}
                <div className="space-y-6 flex flex-col">
                    <div className="space-y-4">
                        <Label className="text-dark-red font-bold">Title</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. DreamScape"
                            className="bg-light text-rich-black border-dark-red focus:border-rust-red focus:ring-rust-red shadow-sm"
                        />
                    </div>

                    <div className="space-y-4">
                        <Label className="text-dark-red font-bold">
                            Description
                        </Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your artwork..."
                            className="bg-light text-rich-black border-dark-red focus:border-rust-red focus:ring-rust-red shadow-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-dark-red font-bold">Tags</Label>
                        <div className="flex flex-wrap gap-3 p-3 rounded-xl border-2 border-dark-red bg-light/20">
                            {tags.map((tag, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-dark-red text-light transform transition hover:scale-110"
                                >
                                    {tag}
                                    <X
                                        size={16}
                                        className="cursor-pointer hover:text-rust-red"
                                        onClick={() => removeTag(tag)}
                                    />
                                </Badge>
                            ))}
                            <Input
                                className="border-none shadow-none w-32 bg-transparent placeholder:text-muted focus-visible:ring-0"
                                placeholder="Type tag & press Enter"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                    </div>

                    {uploading && (
                        <div className="relative w-full h-5 rounded-full bg-muted/30 overflow-hidden shadow-inner">
                            <div
                                className="absolute left-0 top-0 h-5 bg-gradient-to-r from-rust-red via-dark-red to-deep-vermilion animate-pulse rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={uploading}
                        className="w-half h-20 py-3 rounded-2xl bg-dark-red hover:bg-rust-red text-light font-extrabold text-xl shadow-lg transition-transform transform hover:scale-105 mt-auto"
                    >
                        {uploading
                            ? `Uploading ${progress}%`
                            : "Upload Artwork"}
                    </Button>
                </div>
            </form>
        </DashboardLayout>
    );
}
