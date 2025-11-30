import React from "react";
import Lottie from "react-lottie";
import errorAnimation from '../lotties/error.json';

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: errorAnimation,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
};

export const GlobalErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void; }) => {
  const statusCode = (error as any)?.response?.status || null;
  console.log(error.message)
  return (
    <div role="alert" className="flex flex-col items-center justify-center w-[100vw] h-[100vh] p-2">
      <Lottie options={defaultOptions} width={'100%'} height={'auto'} />
      {error.message != 'Network Error' ? (
        <>
          <span className="text-white  text-center">데이터를 불러오는데 에러가 발생하였습니다. </span>
          <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={resetErrorBoundary}>
            홈으로 돌아가기
          </button>
        </>
      ) : (
        <>
          <span className="text-white  text-center">현재 서버가 다운되어있습니다. </span>
          <span className="text-white text-center mb-[10px]">잠시후 다시 시도해주세요.</span>
        </>
      )}
    </div>
  );
};
