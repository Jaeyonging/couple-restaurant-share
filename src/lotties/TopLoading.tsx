import Lottie from 'lottie-react'
import React from 'react'
import loadingAnimation from '../lotties/loading.json';

const TopLoading = () => {
  return (
    <div className="fixed top-0 left-0 w-[100%] h-[100%] bg-black/50 z-50 flex justify-center items-center">
      <Lottie animationData={loadingAnimation} loop={true} style={{ width: '10%', height: '10%' }} />
      <span className="text-[20px] font-bold">Loading...</span>
    </div>
  )
}

export default TopLoading
