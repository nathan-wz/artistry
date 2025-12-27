const functions = require("firebase-functions");
const Stripe = require("stripe");
const stripe = new Stripe(functions.config().stripe.secret);

exports.createCheckoutSession = functions.https.onCall(
    async (data, context) => {
        const { artistId, amount } = data;

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
                success_url: `http://localhost:5173/donation-success`,
                cancel_url: `http://localhost:5173/`,
                metadata: { artistId },
            });

            return { url: session.url };
        } catch (err) {
            console.error(err);
            throw new functions.https.HttpsError(
                "internal",
                "Stripe checkout failed"
            );
        }
    }
);
