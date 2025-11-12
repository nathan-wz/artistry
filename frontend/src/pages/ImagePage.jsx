import MasonryFeed from "../components/common/MasonryFeed";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare } from "lucide-react";
import { DollarSign } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";

// sample images
import image1 from "../assets/sample_images/image1.jpg";
import image2 from "../assets/sample_images/image2.jpg";
import image3 from "../assets/sample_images/image3.jpg";
import image4 from "../assets/sample_images/image4.jpg";
import image5 from "../assets/sample_images/image5.jpg";
import image6 from "../assets/sample_images/image6.jpg";
import image7 from "../assets/sample_images/image7.jpg";
import image8 from "../assets/sample_images/image8.jpg";
import image9 from "../assets/sample_images/image9.jpg";
import image10 from "../assets/sample_images/image10.jpg";
import image11 from "../assets/sample_images/image11.jpg";
import image12 from "../assets/sample_images/image12.jpg";
import image13 from "../assets/sample_images/image13.jpg";
import image14 from "../assets/sample_images/image14.jpg";
import image15 from "../assets/sample_images/image15.jpg";
import image16 from "../assets/sample_images/image16.jpg";
import image17 from "../assets/sample_images/image17.jpg";
import image18 from "../assets/sample_images/image18.jpg";

export default function ImagePage() {
    const sampleItems = [
        { id: 1, image: image1, title: "Abstract art" },
        { id: 2, image: image2, title: "Abstract art" },
        { id: 3, image: image3, title: "Abstract art" },
        { id: 4, image: image4, title: "Abstract art" },
        { id: 5, image: image5, title: "Abstract art" },
        { id: 6, image: image6, title: "Abstract art" },
        { id: 7, image: image7, title: "Abstract art" },
        { id: 8, image: image8, title: "Abstract art" },
        { id: 9, image: image9, title: "Abstract art" },
        { id: 10, image: image10, title: "Abstract art" },
        { id: 11, image: image11, title: "Abstract art" },
        { id: 12, image: image12, title: "Abstract art" },
        { id: 13, image: image13, title: "Abstract art" },
        { id: 14, image: image14, title: "Abstract art" },
        { id: 15, image: image15, title: "Abstract art" },
        { id: 16, image: image16, title: "Abstract art" },
        { id: 17, image: image17, title: "Abstract art" },
        { id: 18, image: image18, title: "Abstract art" },
    ];
    return (
        <DashboardLayout>
            <div className="w-[80%] border-2 rounded-lg p-5  mb-5 flex space-x-10">
                <div className="flex flex-col space-y-5">
                    <h4>Author Name</h4>
                    <img src={image1} className="w-5xl" alt="" />
                    <div className="w-full flex space-x-5 ">
                        <Button>
                            <DollarSign />
                            Donate
                        </Button>
                        <div className="text-center">
                            <Heart size={32} />0
                        </div>
                        <div className="text-center">
                            <MessageSquare size={32} />0
                        </div>
                    </div>
                </div>
                <div className="flex flex-col space-y-5">
                    <h2>Carriers of Culture</h2>
                    <p>
                        Three elegant figures stride forward in vibrant
                        traditional attire, each balancing symbolic vessels atop
                        their heads — a nod to ancestral labor, wisdom, and
                        ritual. The cracked texture behind them evokes the
                        resilience of heritage, while bold patterns in orange,
                        blue, and white celebrate the diversity of African
                        identity. This piece honors the strength and grace of
                        women as cultural bearers across generations.
                    </p>
                </div>
            </div>
            <MasonryFeed items={sampleItems} />
        </DashboardLayout>
    );
}
