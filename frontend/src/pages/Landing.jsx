import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
    return (
        <div className="min-h-screen bg-light text-rich-black flex flex-col">
            {/* Hero Section */}

            <main className="flex-1">
                <section className="flex flex-col items-center justify-center text-center px-6 py-24 space-y-8">
                    <h1 className="text-5xl font-extrabold leading-tight max-w-3xl">
                        Showcase Your Art. Connect with your Audience.
                    </h1>
                    <p className="text-lg max-w-xl text-muted-foreground">
                        Artistry is your digital canvas — a platform for african
                        artists to share portfolios, get feedback, and build
                        community.
                    </p>
                    <Link to="/signup">
                        <Button
                            size="lg"
                            className="bg-dark-red text-light hover:bg-dark-red/80"
                        >
                            Get Started <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </section>

                {/* Features Section */}
                <section className="bg-rich-black text-light py-20 px-6">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div>
                            <h3 className="text-pale-sand text-xl font-semibold mb-2">
                                🎨 Share your work
                            </h3>
                            <p className="text-muted">
                                Create stunning multimedia portfolios with
                                drag-and-drop uploads and custom layouts.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-pale-sand text-xl font-semibold mb-2">
                                💬 Community Feedback
                            </h3>
                            <p className="text-muted">
                                Get thoughtful critiques and reactions from
                                fellow creatives and viewers in real time.
                            </p>
                        </div>
                        <div>
                            <h3 className=" text-pale-sand text-xl font-semibold mb-2">
                                🌐 Continent-Wide Discovery
                            </h3>
                            <p className="text-muted">
                                Explore exhibitions, trending artists, and
                                curated showcases from all over Africa.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            {/* Footer */}
            <footer className="bg-dark-red text-light py-6 text-center text-sm">
                © {new Date().getFullYear()} Artistry. Built for creators, by
                creators.
            </footer>
        </div>
    );
}
