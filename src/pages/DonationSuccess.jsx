import { useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function DonationSuccess() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const artistId = params.get("artistId");
        const amount = parseFloat(params.get("amount"));

        if (artistId && amount) {
            // Store donation under users/{artistId}/donations
            addDoc(collection(db, "users", artistId, "donations"), {
                amount,
                currency: "usd",
                status: "success",
                createdAt: serverTimestamp(),
            }).catch((err) => console.error("Failed to log donation:", err));
        }
    }, [location]);

    return (
        <div className="flex flex-col items-center justify-center mt-20 space-y-6">
            <h2 className="text-3xl font-bold text-dark-red">Thank You!</h2>
            <p className="text-lg text-rich-black">
                Your donation has been successfully recorded.
            </p>

            <Button
                onClick={() => navigate("/home")}
                className=" bg-dark-red text-light hover:bg-rust-red rounded-2xl px-6 py-3 text-lg font-semibold shadow-lg transition-transform hover:scale-105 "
            >
                Back to Home
            </Button>
        </div>
    );
}
