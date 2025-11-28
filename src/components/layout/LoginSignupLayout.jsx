import Navbar from "./Navbar";

export default function LoginSignupLayout({ children }) {
    return (
        <div>
            <Navbar />
            <main>{children}</main>
        </div>
    );
}
