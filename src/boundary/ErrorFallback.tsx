import React from "react";

export const ErrorFallback = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) => {
  const statusCode = (error as any)?.response?.status || null;
  return (
    <div role="alert" className="flex flex-col items-center justify-center w-[100vw] h-[100vh]">
      <h1>{statusCode}</h1>
      <pre className="text-[18px] my-4 text-gray-700">{error.message}</pre>
      <div>
        <p className="text-[24px] font-bold">{error.name}</p>
      </div>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded"
        onClick={resetErrorBoundary}
      >
        Click to Refresh
      </button>
    </div>
  );
};
