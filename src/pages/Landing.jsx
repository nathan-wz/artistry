import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Landing() {
    const fadeInUp = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: "easeOut" },
        },
    };

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 1 } },
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-light via-rich-black to-dark-red text-light flex flex-col overflow-hidden">
            {/* Hero Section */}
            <main className="flex-1 relative z-10">
                <section className="flex flex-col items-center justify-center text-center px-6 py-32 space-y-8">
                    <motion.h1
                        className="text-6xl md:text-7xl font-extrabold leading-tight max-w-4xl bg-clip-text text-transparent bg-linear-to-r from-dark-red to-pale-sand"
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                    >
                        Showcase Your Art. Connect with your Audience.
                    </motion.h1>

                    <motion.p
                        className="text-lg md:text-xl max-w-2xl text-light/80"
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.3 }}
                    >
                        Artistry is your digital canvas — a platform for African
                        artists to share portfolios, get feedback, and build
                        community.
                    </motion.p>

                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.6 }}
                    >
                        <Link to="/signup">
                            <Button className="bg-dark-red text-light hover:bg-dark-red/80 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                                Get Started{" "}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </motion.div>
                </section>

                {/* Decorative background shapes */}
                <motion.div
                    className="absolute top-0 left-0 w-[600px] h-[600px] bg-dark-red rounded-full opacity-30 blur-3xl -z-10 animate-pulse"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 2 }}
                />
                <motion.div
                    className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pale-sand rounded-full opacity-20 blur-2xl -z-10 animate-pulse"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 2, delay: 0.5 }}
                />
            </main>

            {/* Features Section */}
            <section className="bg-rich-black/90 text-light py-20 px-6 relative overflow-hidden">
                <motion.div
                    className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center"
                    variants={fadeIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <motion.div
                        className="p-6 rounded-xl bg-dark-red/20 backdrop-blur-md hover:scale-105 transition-transform shadow-xl"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h3 className="text-pale-sand text-2xl font-bold mb-2">
                            🎨 Share your work
                        </h3>
                        <p className="text-light/70">
                            Create stunning multimedia portfolios with
                            drag-and-drop uploads and custom layouts.
                        </p>
                    </motion.div>

                    <motion.div
                        className="p-6 rounded-xl bg-dark-red/20 backdrop-blur-md hover:scale-105 transition-transform shadow-xl"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h3 className="text-pale-sand text-2xl font-bold mb-2">
                            💬 Community Feedback
                        </h3>
                        <p className="text-light/70">
                            Get thoughtful critiques and reactions from fellow
                            creatives and viewers in real time.
                        </p>
                    </motion.div>

                    <motion.div
                        className="p-6 rounded-xl bg-dark-red/20 backdrop-blur-md hover:scale-105 transition-transform shadow-xl"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h3 className="text-pale-sand text-2xl font-bold mb-2">
                            🌐 Continent-Wide Discovery
                        </h3>
                        <p className="text-light/70">
                            Explore exhibitions, trending artists, and curated
                            showcases from all over Africa.
                        </p>
                    </motion.div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="bg-dark-red text-light py-6 text-center text-sm relative z-10">
                © {new Date().getFullYear()} Artistry. Built for creators, by
                creators.
            </footer>
        </div>
    );
}
