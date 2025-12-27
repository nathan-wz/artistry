import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function DonatePage() {
    const { artistId } = useParams(); // artist's userId from URL
    const [artistUsername, setArtistUsername] = useState("");
    const [amount, setAmount] = useState("");
    const [donorName, setDonorName] = useState(""); // optional donor name
    const navigate = useNavigate();

    const handleDonate = async () => {
        const numericAmount = parseFloat(amount);
        if (!numericAmount || numericAmount <= 0) {
            return toast.error("Enter a valid donation amount");
        }

        try {
            const res = await fetch(
                "http://localhost:4242/create-checkout-session",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        artistId,
                        amount: numericAmount,
                        donorName,
                    }),
                }
            );

            const data = await res.json();

            if (data.url) {
                // Redirect user to Stripe Checkout
                window.location.href = data.url;
            } else {
                toast.error("Failed to initiate donation");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to initiate donation");
        }
    };

    useEffect(() => {
        const getArtistName = async () => {
            try {
                const docRef = doc(db, "users", artistId);
                const docSnap = await getDoc(docRef);
                setArtistUsername(docSnap.data().username);
            } catch (err) {
                console.error("Failed to fetch artist username:", err);
            }
        };

        getArtistName();
    }, [artistId]);

    return (
        <DashboardLayout>
            <div className="max-w-lg mx-auto mt-20 p-6 border rounded-xl shadow-lg flex flex-col gap-6">
                <h2 className="text-2xl font-bold">
                    Donate to Artist: {artistUsername}
                </h2>
                <Input
                    type="text"
                    placeholder="Your Name (optional)"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                />
                <Input
                    type="number"
                    placeholder="Amount in USD"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <Button onClick={handleDonate}>Donate via Stripe</Button>
            </div>
        </DashboardLayout>
    );
}
