import React from "react";
import { FcGoogle } from "react-icons/fc";

const GoogleLoginButton = () => {
    const handleGoogleLogin = () => {
        console.log("구글 로그인");
    };

    return (
        <div
            onClick={handleGoogleLogin}
            className="
        flex w-[80%] h-[50px]
        bg-white
        border border-gray-300
        rounded-lg
        items-center justify-center
        cursor-pointer
        shadow-[0_1px_3px_rgba(0,0,0,0.1)]
        hover:bg-gray-50
        active:bg-gray-100
        transition-all duration-150
      "
        >
            <div className="flex items-center gap-2">
                <FcGoogle className="text-[24px]" />
                <span className="text-gray-700 text-lg font-semibold">
                    Google로 로그인
                </span>
            </div>
        </div>
    );
};

export default GoogleLoginButton;
