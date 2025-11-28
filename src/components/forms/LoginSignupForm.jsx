import { useNavigate } from "react-router-dom";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";

// Firestore
import {
    doc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    getDoc,
} from "firebase/firestore";

// React Hook Form + Zod
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// shadcn/ui
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

// zod schemas
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

    // --------------------------------------------------------------------
    // HELPERS
    // --------------------------------------------------------------------

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

        // 1️⃣ Username uniqueness check
        if (await checkUsernameExists(username)) {
            form.setError("username", { message: "Username already taken" });
            return;
        }

        try {
            // 2️⃣ Create Auth account
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            await updateProfile(user, { displayName: username });

            // 3️⃣ Create Firestore user profile
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

            // Check if Firestore profile already exists
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // Create Firestore profile
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

    // --------------------------------------------------------------------
    // UI
    // --------------------------------------------------------------------

    return (
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg w-full max-w-sm">
            <Form {...form}>
                <form
                    className="space-y-6"
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
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="you@example.com"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Username */}
                    {formType === "signup" && (
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="your_username"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {/* Password */}
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full">
                        {formType === "login" ? "Sign in" : "Sign up"}
                    </Button>

                    <div className="text-center text-gray-300">or</div>

                    <Button
                        type="button"
                        className="w-full"
                        onClick={handleGoogleLogin}
                    >
                        Sign in with Google
                    </Button>
                </form>
            </Form>
        </div>
    );
}
