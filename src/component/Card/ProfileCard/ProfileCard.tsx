import React from 'react'
import { RenderImg } from '../../RenderImg'
import { FaMale } from "react-icons/fa";

const ProfileCard = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-3 p-4 bg-white rounded-2xl shadow-md border border-gray-100 w-[180px]">

            <div className="w-[110px] h-[110px] rounded-full overflow-hidden shadow-sm ring-2 ring-blue-100">
                <RenderImg
                    imgurl={'../noimg.jpeg'}
                    alt="profile"
                    className='w-full h-full object-cover'
                />
            </div>

            <div className="flex flex-col items-center text-center">
                <span className="text-lg font-semibold text-gray-800">
                    최재용
                </span>
                <span className="text-sm text-gray-500">
                    1997.05.23
                </span>
            </div>

            <FaMale className="text-3xl text-blue-500 mt-1 drop-shadow-sm" />
        </div>
    )
}

export default ProfileCard
