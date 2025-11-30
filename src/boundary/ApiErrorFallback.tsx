import { IoIosRefresh } from "react-icons/io";

export const ApiErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void; }) => {
  const statusCode = (error as any)?.response?.status || null;
  console.log(error.message)
  if(error.message === 'Network Error') {
    throw error
  }

  return (
    <div role="alert" className="flex flex-col items-center justify-center w-[100%] h-[100%]">
      <span>{error.message}</span>
      <span>{statusCode}</span>
      <span className="text-[24px]">데이터를 불러오는데 에러가 발생하였습니다.</span>
      <IoIosRefresh className="text-[40px] text-gray-500 cursor-pointer hover:text-black" onClick={resetErrorBoundary} />
    </div>
  );
};
