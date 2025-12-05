import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
    updateProfile,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from "firebase/auth";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CircleUserRound, Edit2 } from "lucide-react";

import Cropper from "react-easy-crop";
import { Slider } from "@/components/ui/slider"; // shadcn slider
import { getCroppedImg } from "@/lib/cropImage"; // helper for cropping
import axios from "axios";
import DashboardLayout from "../components/layout/DashboardLayout";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const profileSchema = z
    .object({
        displayName: z.string().min(2, "Display name is too short"),
        username: z
            .string()
            .min(2, "Username is too short")
            .regex(
                /^[a-zA-Z0-9_]+$/,
                "Username can only contain letters, numbers and underscores"
            ),
        oldPassword: z.string().optional(),
        newPassword: z.string().optional(),
        confirmPassword: z.string().optional(),
    })
    .refine(
        (data) => {
            if (!data.newPassword) return true;
            return data.newPassword === data.confirmPassword;
        },
        { message: "Passwords do not match", path: ["confirmPassword"] }
    );

export default function EditProfile() {
    const { user } = useAuth();
    const isEmailPassword = user?.providerData[0]?.providerId === "password";

    const [imageSrc, setImageSrc] = useState("");
    const [preview, setPreview] = useState(user?.photoURL || "");
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [username, setUsername] = useState("");

    const navigate = useNavigate();

    // Fetch username from Firestore
    useEffect(() => {
        if (!user) return;

        const fetchUsername = async () => {
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUsername(docSnap.data().username);
                }
            } catch (err) {
                console.error("Failed to fetch username:", err);
            }
        };

        fetchUsername();
    }, [user]);

    const form = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            displayName: user?.displayName || "",
            username: username || "",
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    // Reset form once username is fetched
    useEffect(() => {
        if (!user) return;
        form.reset({
            displayName: user.displayName || "",
            username: username || "",
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
    }, [username, user]);

    const onCropComplete = useCallback((_, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        setFile(selectedFile);
        const url = URL.createObjectURL(selectedFile);
        setImageSrc(url);
    };

    const handleCropSave = async (close) => {
        if (!file || !croppedAreaPixels) return;

        try {
            const croppedFile = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                file
            );
            setFile(croppedFile);
            setPreview(URL.createObjectURL(croppedFile));
            close(); // close the dialog
        } catch (err) {
            console.error("Error cropping image:", err);
            toast.error("Failed to crop image");
        }
    };

    const handleUploadToCloudinary = async () => {
        if (!file) return null;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", UPLOAD_PRESET);

            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                formData
            );

            return res.data.secure_url;
        } catch (err) {
            console.error("Cloudinary upload failed:", err);
            toast.error("Failed to upload image");
            return null;
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (values) => {
        try {
            let newPhotoURL = preview;

            if (file) {
                const uploadedUrl = await handleUploadToCloudinary();
                if (!uploadedUrl) return;
                newPhotoURL = uploadedUrl;
            }

            if (isEmailPassword && values.newPassword) {
                const credential = EmailAuthProvider.credential(
                    user.email,
                    values.oldPassword
                );
                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, values.newPassword);
            }

            await updateProfile(user, {
                displayName: values.displayName,
                photoURL: newPhotoURL,
            });

            await updateDoc(doc(db, "users", user.uid), {
                displayName: values.displayName,
                username: values.username,
                photoURL: newPhotoURL,
            });

            toast.success("Profile updated successfully!");
            navigate(`/profile/${values.username}`);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile");
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen flex justify-center items-center p-6">
                <Card className="w-full max-w-xl p-6">
                    <CardHeader>
                        <h2 className="text-2xl font-bold">Edit Profile</h2>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-6 flex flex-col items-center"
                            >
                                {/* Profile Image Preview */}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer group">
                                            {preview ? (
                                                <img
                                                    src={preview}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                    <CircleUserRound
                                                        size={80}
                                                        className="text-gray-400"
                                                    />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                                <Edit2
                                                    size={24}
                                                    className="text-white"
                                                />
                                            </div>
                                        </div>
                                    </DialogTrigger>

                                    <DialogContent className="max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>
                                                Crop Profile Image
                                            </DialogTitle>
                                            <DialogDescription>
                                                Adjust your image and click save
                                                when done.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="relative w-full h-96 bg-gray-200 rounded">
                                            {imageSrc && (
                                                <Cropper
                                                    image={imageSrc}
                                                    crop={crop}
                                                    zoom={zoom}
                                                    aspect={1}
                                                    onCropChange={setCrop}
                                                    onZoomChange={setZoom}
                                                    onCropComplete={
                                                        onCropComplete
                                                    }
                                                />
                                            )}
                                        </div>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="mt-4"
                                            onChange={handleFileSelect}
                                        />

                                        <div className="mt-4 w-full">
                                            <p className="mb-1">Zoom</p>
                                            <Slider
                                                min={1}
                                                max={3}
                                                step={0.01}
                                                value={[zoom]}
                                                onValueChange={(val) =>
                                                    setZoom(val[0])
                                                }
                                            />
                                        </div>

                                        <DialogFooter>
                                            <Dialog.Close asChild>
                                                <Button
                                                    type="button"
                                                    onClick={(e) =>
                                                        handleCropSave(
                                                            e.currentTarget.closest(
                                                                "dialog"
                                                            )
                                                        )
                                                    }
                                                >
                                                    Save
                                                </Button>
                                            </Dialog.Close>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                {/* Display Name */}
                                <FormField
                                    control={form.control}
                                    name="displayName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Display Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Username */}
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Password Fields */}
                                {isEmailPassword && (
                                    <>
                                        <FormField
                                            control={form.control}
                                            name="oldPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Old Password
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="newPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        New Password
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Confirm New Password
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full mt-4"
                                    disabled={uploading}
                                >
                                    {uploading
                                        ? "Uploading..."
                                        : "Save Changes"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
