import React from 'react'
import { AiFillStar, AiOutlineStar } from "react-icons/ai";

interface Props {
    title: string;
    category: string;
}
const TitleBar = ({ title, category }: Props) => {
    return (
        <div className='flex flex-col gap-1'>
            <div className='flex justify-between items-center'>
                <span className='text-lg font-semibold text-slate-900 line-clamp-1 w-full' dangerouslySetInnerHTML={{ __html: title }} />
                <span><AiOutlineStar className='text-yellow-500' /></span>
            </div>
            <span className='text-xs font-semibold uppercase tracking-wide text-indigo-500'>{category || '업종 정보 없음'}</span>
        </div>
    )
}

export default TitleBar
