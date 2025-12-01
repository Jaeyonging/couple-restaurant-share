import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaHome, FaMap, FaStar } from "react-icons/fa";

const NavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleNavigate = (path: string) => {
        navigate(path);
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className='fixed bottom-0 left-0 right-0 h-[50px] bg-white shadow-[0_-2px_20px_rgba(0,0,0,0.08)] z-50'>
            <div className='flex justify-around items-center w-full h-full'>
                <span className='flex flex-col items-center justify-center w-full h-full p-1 cursor-pointer' onClick={() => handleNavigate('/map')}>
                    <FaMap className={`text-xl transition-all duration-200 ${isActive('/map') ? 'text-blue-600 scale-110' : 'text-gray-400'}`}/>
                    <span className={`text-[10px] mt-1 ${isActive('/map') ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                        Map
                    </span>
                    {isActive('/map') && <div className='w-6 h-[3px] bg-blue-600 rounded-full mt-1'></div>}
                </span>

                <span className='flex flex-col items-center justify-center w-full h-full p-1 cursor-pointer' onClick={() => handleNavigate('/')}>
                    <FaHome className={`text-xl transition-all duration-200 ${isActive('/') ? 'text-emerald-500 scale-110' : 'text-gray-400'}`}/>
                    <span className={`text-[10px] mt-1 ${isActive('/') ? 'text-emerald-500 font-semibold' : 'text-gray-400'}`}>
                        Home
                    </span>

                    {isActive('/') && <div className='w-6 h-[3px] bg-emerald-500 rounded-full mt-1'></div>}
                </span>

                <span className='flex flex-col items-center justify-center w-full h-full p-1 cursor-pointer' onClick={() => handleNavigate('/review')}>
                    <FaStar className={`text-xl transition-all duration-200 ${isActive('/review') ? 'text-yellow-500 scale-110' : 'text-gray-400'}`}/>
                    <span className={`text-[10px] mt-1 ${isActive('/review') ? 'text-yellow-500 font-semibold' : 'text-gray-400'}`}>
                        Review
                    </span>
                    {isActive('/review') && <div className='w-6 h-[3px] bg-yellow-500 rounded-full mt-1'></div>}
                </span>
            </div>
        </div>
    );
};

export default NavBar;
