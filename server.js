// server.js
import "dotenv/config";
import express from "express";
import Stripe from "stripe";
import cors from "cors";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const app = express();
const stripe = new Stripe(process.env.STRIPE_PUBLISHABLE_KEY);

app.use(cors());
app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
    const { artistId, amount, donorName } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `Donation to artist ${artistId}`,
                        },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `http://localhost:5173/donation-success?artistId=${artistId}&amount=${amount}&donorName=${encodeURIComponent(
                donorName
            )}`,
            cancel_url: "http://localhost:5173/",
            metadata: { artistId, donorName },
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(4242, () => console.log("Server running on http://localhost:4242"));
