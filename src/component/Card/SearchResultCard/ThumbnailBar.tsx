import React from 'react'
import { RenderImg } from '../../RenderImg';

interface Props {
    thumbnail: string;
    alt: string;
}
const ThumbnailBar = ({ thumbnail, alt }: Props) => {
    return (
        <div className='h-[110px] w-[110px] overflow-hidden rounded-2xl bg-gray-100'>
            {thumbnail ? (
                <RenderImg imgurl={thumbnail} alt={alt} className='h-full w-full object-cover' />
            ) : (
                <div className='flex h-full w-full items-center justify-center text-sm text-gray-400'>No Image</div>
            )}
        </div>
    )
}

export default ThumbnailBar
