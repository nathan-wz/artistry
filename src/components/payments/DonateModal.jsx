import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function DonateModal({ open, setOpen, artistId }) {
    const [amount, setAmount] = useState("");
    const { user } = useAuth();

    const handleDonate = async () => {
        if (!amount || amount <= 0) return;

        const res = await axios.post("/api/create-donation-session", {
            amount: Number(amount),
            email: user.email,
            artistId,
        });

        window.location.href = res.data.url;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Donate to the Artist</DialogTitle>
                </DialogHeader>

                <Input
                    type="number"
                    placeholder="Enter amount (KES)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />

                <Button onClick={handleDonate} className="w-full mt-4">
                    Proceed to Paystack
                </Button>
            </DialogContent>
        </Dialog>
    );
}
