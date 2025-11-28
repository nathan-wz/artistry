import LoginSignupForm from "../components/forms/LoginSignupForm";
import LoginSignupLayout from "../components/layout/LoginSignupLayout";

function Login() {
    return (
        <LoginSignupLayout>
            <div className="bg-hero min-h-screen flex items-center justify-center bg-artistry-background">
                <LoginSignupForm formType={"login"} />
            </div>
        </LoginSignupLayout>
    );
}

export default Login;
