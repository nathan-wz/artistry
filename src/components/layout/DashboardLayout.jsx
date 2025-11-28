import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="flex">
                <Sidebar />

                <main className="flex flex-col justify-center grow p-6 transition-all duration-300">
                    {children}
                </main>
            </div>
        </div>
    );
}
