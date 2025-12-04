import React from "react";
import { SiNaver } from "react-icons/si";

const NaverLoginButton = () => {
    const NAVER_CLIENT_KEY = import.meta.env.VITE_NAVER_CLIENT;
    const NAVER_CLIENT_SECRET = import.meta.env.VITE_NAVER_SECRET;
    const REDIRECT_URL = import.meta.env.PROD
        ? `${import.meta.env.VITE_API_URL}/login/auth`
        : "http://localhost:5173/login/auth";
    const handleNaverLogin = () => {
        window.location.href = `https://nid.naver.com/oauth2.0/authorize?client_id=${NAVER_CLIENT_KEY}&redirect_uri=${REDIRECT_URL}&response_type=code`;
    };

    return (
        <div
            onClick={handleNaverLogin}
            className="
        flex w-[80%] h-[50px]
        bg-[#03C75A]
        rounded-lg
        items-center justify-center
        cursor-pointer
        shadow-[0_2px_4px_rgba(0,0,0,0.1)]
        hover:bg-[#02b850]
        active:bg-[#019e44]
        transition-all duration-150
      "
        >
            <div className="flex items-center gap-2">
                <SiNaver className="text-[24px] text-white" />
                <span className="text-white text-lg font-semibold">
                    네이버로 로그인
                </span>
            </div>
        </div>
    );
};

export default NaverLoginButton;
