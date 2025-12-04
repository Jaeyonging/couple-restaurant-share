import React from "react";
import { RiKakaoTalkFill } from "react-icons/ri"; // 카카오 아이콘
import { useLoginStore } from "../../store/data";

const KakaoLoginButton = () => {
  const { setIsLogin } = useLoginStore();
  
  const handleKakaoLogin = () => {
    console.log("카카오 로그인");
    setIsLogin(true);
  };

  return (
    <div
      onClick={handleKakaoLogin}
      className="
        flex w-[80%] h-[50px]
        bg-[#FEE500]
        rounded-lg
        items-center justify-center
        cursor-pointer
        shadow-[0_2px_4px_rgba(0,0,0,0.1)]
        hover:bg-[#F1D900]
        active:bg-[#E5C800]
        transition-all duration-150
      "
    >
      <div className="flex items-center gap-2">
        <RiKakaoTalkFill className="text-[24px] text-[#3C1E1E]" />
        <span className="text-[#3C1E1E] text-lg font-semibold">
          카카오로 로그인
        </span>
      </div>
    </div>
  );
};

export default KakaoLoginButton;
