import LoginSignupForm from "../components/forms/LoginSignupForm";
import LoginSignupLayout from "../components/layout/LoginSignupLayout";

export default function Signup() {
    return (
        <LoginSignupLayout>
            <div className="bg-hero min-h-screen flex items-center justify-center bg-artistry-background">
                <LoginSignupForm formType={"signup"} />
            </div>
        </LoginSignupLayout>
    );
}
