import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "../components/layout/DashboardLayout";

export default function UploadPage() {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!file || !title || !description) return;

        console.log("Uploading:", {
            fileName: file.name,
            title,
            description,
        });

        // TODO: Add Firebase or API upload logic here
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
                className="max-w-xl mx-auto mt-20 space-y-6"
            >
                <h1 className="text-3xl font-bold text-rich-black">
                    Upload Artwork
                </h1>

                {/* Title */}
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Dreamscape"
                        className="bg-light text-rich-black"
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your artwork..."
                        className="bg-light text-rich-black"
                    />
                </div>

                {/* Dropzone */}
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

                {/* Preview */}
                {previewUrl && (
                    <div className="mt-4">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="rounded-lg border border-muted w-full max-h-96 object-contain"
                        />
                    </div>
                )}

                {/* Submit */}
                <Button
                    className="bg-dark-red text-pale-sand hover:bg-dark-red/80"
                    type="submit"
                >
                    Upload
                </Button>
            </form>
        </DashboardLayout>
    );
}
