import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    // Dropzone setup
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

    // Uplaod handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !title || !description) {
            toast.error("Please fill all fields and select an image!");
            return;
        }

        setUploading(true);
        setProgress(0);

        try {
            // Upload to Cloudinary
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

            // Save metadata to firestore
            await addDoc(collection(db, "artworks"), {
                title,
                description,
                imageUrl,
                userId: auth.currentUser?.uid || null,
                createdAt: serverTimestamp(),
            });

            // Success feedback
            toast.success("Artwork uploaded successfully");

            // reset upload form fields
            setFile(null);
            setPreviewUrl(null);
            setTitle("");
            setDescription("");
            setProgress(0);
        } catch (err) {
            console.error("Upload error: ", err);
            toast.error("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    // Cleanup object URL
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    return (
        <DashboardLayout>
            <form
                onSubmit={handleSubmit}
                className="max-w-xl mx-auto mt-20 space-y-6"
            >
                <h1 className="text-3xl font-bold text-rich-black">
                    Upload Artwork
                </h1>

                <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. DreamScape"
                        className="bg-light text-rich-black"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your artwork..."
                        className="bg-light text-rich-black"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Image</Label>
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
                            isDragActive
                                ? "border-dark-red bg-light/50"
                                : "border-muted bg-light"
                        }`}
                    >
                        <input {...getInputProps()} />
                        <p className="text-center text-rich-black">
                            {isDragActive
                                ? "Drop the image here..."
                                : "Drag and drop an image, or click to select"}
                        </p>
                    </div>
                </div>

                {previewUrl && (
                    <div className="mt-4">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="rounded-lg border border-muted w-full max-h-96 object-contain"
                        />
                    </div>
                )}

                {uploading && (
                    <div className="w-full bg-muted rounded-full h-4 mt-2">
                        <div
                            className="bg-dark-red h-4 rounded-full"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                )}

                <Button
                    className="bg-dark-red text-pale-sand hover:bg-dark-red/80"
                    type="submit"
                    disabled={uploading}
                >
                    {uploading ? `Uploading ${progress}%` : "Upload"}
                </Button>
            </form>
        </DashboardLayout>
    );
}
