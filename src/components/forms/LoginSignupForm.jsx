import { useNavigate } from "react-router-dom";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import {
    doc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    getDoc,
} from "firebase/firestore";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const signupSchema = z.object({
    email: z.string().email("Invalid email format"),
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be less than 20 characters")
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers, underscores"
        ),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

export default function LoginSignupForm({ formType }) {
    const navigate = useNavigate();
    const googleProvider = new GoogleAuthProvider();

    const form = useForm({
        resolver: zodResolver(
            formType === "signup" ? signupSchema : loginSchema
        ),
        defaultValues: {
            email: "",
            username: "",
            password: "",
        },
    });

    const checkUsernameExists = async (username) => {
        const q = query(
            collection(db, "users"),
            where("username", "==", username.toLowerCase())
        );
        const snapshot = await getDocs(q);
        return !snapshot.empty;
    };

    const handleSignup = async (values) => {
        const { email, password, username } = values;

        if (await checkUsernameExists(username)) {
            form.setError("username", { message: "Username already taken" });
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            await updateProfile(user, { displayName: username });

            await setDoc(doc(db, "users", user.uid), {
                username: username.toLowerCase(),
                email,
                createdAt: new Date(),
            });

            navigate("/login");
        } catch (err) {
            if (err.code === "auth/email-already-in-use") {
                form.setError("email", { message: "Email already in use" });
            } else {
                console.error(err);
                form.setError("email", { message: err.message });
            }
        }
    };

    const handleLogin = async (values) => {
        const { email, password } = values;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/home");
        } catch (err) {
            form.setError("email", { message: "Invalid email or password" });
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    username: user.displayName?.toLowerCase() || "",
                    email: user.email,
                    createdAt: new Date(),
                });
            }

            navigate("/home");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="w-full max-w-md bg-light rounded-2xl shadow-2xl p-8 relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-goldenrod/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-copper-orange/20 rounded-full blur-3xl animate-pulse"></div>

            <h2 className="text-3xl font-extrabold text-rich-black mb-6 text-center">
                {formType === "signup" ? "Sign Up" : "Sign In"}
            </h2>

            <Form {...form}>
                <form
                    className="space-y-5"
                    onSubmit={form.handleSubmit((values) =>
                        formType === "signup"
                            ? handleSignup(values)
                            : handleLogin(values)
                    )}
                >
                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="relative group">
                                <FormLabel className="text-rich-black">
                                    Email
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="you@example.com"
                                        {...field}
                                        className="bg-pale-sand/20 border-rich-black focus:border-dark-red focus:ring-dark-red transition-all duration-300"
                                    />
                                </FormControl>
                                <FormMessage className="text-deep-vermilion" />
                            </FormItem>
                        )}
                    />

                    {/* Username */}
                    {formType === "signup" && (
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem className="relative group">
                                    <FormLabel className="text-rich-black">
                                        Username
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="your_username"
                                            {...field}
                                            className="bg-pale-sand/20 border-rich-black focus:border-dark-red focus:ring-dark-red transition-all duration-300"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-deep-vermilion" />
                                </FormItem>
                            )}
                        />
                    )}

                    {/* Password */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem className="relative group">
                                <FormLabel className="text-rich-black">
                                    Password
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        {...field}
                                        className="bg-pale-sand/20 border-rich-black focus:border-dark-red focus:ring-dark-red transition-all duration-300"
                                    />
                                </FormControl>
                                <FormMessage className="text-deep-vermilion" />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full bg-dark-red hover:bg-deep-vermilion text-light font-bold transition-all duration-300 shadow-lg"
                    >
                        {formType === "login" ? "Sign In" : "Sign Up"}
                    </Button>

                    <div className="text-center text-rich-black/70 my-2">
                        or
                    </div>

                    <Button
                        type="button"
                        className="w-full bg-teal hover:bg-deep-teal text-light font-bold transition-all duration-300 shadow-lg"
                        onClick={handleGoogleLogin}
                    >
                        Sign in with Google
                    </Button>
                </form>
            </Form>
        </div>
    );
}
