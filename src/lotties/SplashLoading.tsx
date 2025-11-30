import React from 'react'
import animationData from './splash.json'
import Lottie from 'react-lottie';

const SplashLoading = () => {
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice',
        },
    };
    return (
        <div className="fixed inset-0 bg-[#00000082] flex items-center justify-center z-50">
            <Lottie options={defaultOptions} height={100} width={100} />
        </div>
    )
}

export default SplashLoading
