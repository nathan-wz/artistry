import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
} from "firebase/auth";
import { useState } from "react";
import { auth, db } from "../../firebase";

export default function LoginSignupForm({ formType }) {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const googleProvider = new GoogleAuthProvider();

    const handleLogin = async (e) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Signed in successfully: " + email);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSignup = async (e) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            await updateProfile(user, { displayName: username });
            console.log("Sign up done: " + email);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formType === "login") {
            handleLogin(e);
        } else if (formType === "signup") {
            handleSignup(e);
        }
        navigate("/home");
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            navigate("/home");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg w-full max-w-sm">
            <form className="space-y-6">
                <div>
                    <label
                        htmlFor="email"
                        className="text-lg font-medium"
                        style={{ color: "var(--color-pale-sand)" }}
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="text-lg text-rich-black bg-light border-dark-red w-full px-4 py-3 rounded border"
                    />
                </div>

                {formType === "signup" && (
                    <div>
                        <label
                            htmlFor="username"
                            className="text-lg font-medium"
                            style={{ color: "var(--color-pale-sand)" }}
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            required
                            placeholder="user132"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="text-lg text-rich-black bg-light border-dark-red w-full px-4 py-3 rounded border"
                        />
                    </div>
                )}

                <div>
                    <label
                        htmlFor="password"
                        className="text-lg font-medium"
                        style={{ color: "var(--color-pale-sand)" }}
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="text-lg text-rich-black bg-light border-dark-red w-full px-4 py-3 rounded border"
                    />
                </div>
                <button
                    type="submit"
                    className="text-lg bg-dark-red text-light w-full py-3 px-4 rounded font-semibold"
                >
                    {formType === "login" ? "Sign in" : "Sign up"}
                </button>
                <div className="text-base text-pale-sand text-center">or</div>
                <button
                    className="text-lg text-light bg-deep-teal w-full py-3 px-4 rounded font-semibold"
                    onClick={handleGoogleLogin}
                >
                    Sign in with Google
                </button>
            </form>
        </div>
    );
}
