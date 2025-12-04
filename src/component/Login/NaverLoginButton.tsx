import React from "react";
import { SiNaver } from "react-icons/si";
import { useLoginStore } from "../../store/data";

const NaverLoginButton = () => {
    const { setIsLogin } = useLoginStore();
    
    const handleNaverLogin = () => {
        console.log("네이버 로그인");
        setIsLogin(true);
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
