import Lottie from 'lottie-react';
import React, { useEffect, useState } from 'react'
import loadingAnimation from '../lotties/loadingImg.json';

interface Props {
    className?: string
    onClick?: () => void
    imgurl: string
    alt: string
}

export const RenderImg = ({ imgurl, onClick, className = "learned-img", alt }: Props) => {
    const [imageSrc, setImageSrc] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const image = new Image();
        image.src = imgurl;
        image.onload = () => {
            setImageSrc(imgurl);
            setIsLoading(false);
        };
        image.onerror = () => {
            setImageSrc('../noimg.jpeg');
            setIsLoading(false);
        };
    }, [])
    return (
        <>
            {isLoading ? (
                <Lottie className={className} animationData={loadingAnimation} alt={alt} />
            ) : (
                <img className={className} src={imageSrc} onClick={onClick} alt={alt} />
            )}
        </>
    )
}
