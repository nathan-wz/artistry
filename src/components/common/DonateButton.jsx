import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import { useDonationPayment } from "@/lib/paystack";
import { toast } from "sonner";

export default function DonateButton({ artistId, userEmail }) {
    const [amount, setAmount] = useState("");

    const initializePayment = useDonationPayment({
        email: userEmail,
        amount: Number(amount),
        artistId,
    });

    const handleDonate = () => {
        if (!amount || Number(amount) <= 0) {
            return toast.error("Enter a valid amount");
        }

        initializePayment();
    };

    return (
        <div className="space-y-2">
            <input
                type="number"
                placeholder="Enter amount (KES)"
                className="border rounded-md p-2 w-full"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />

            <Button onClick={handleDonate} className="w-full">
                <DollarSign className="mr-2" />
                Donate
            </Button>
        </div>
    );
}
