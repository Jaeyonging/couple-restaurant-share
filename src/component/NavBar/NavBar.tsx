import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiHome, FiMap, FiStar, FiCalendar } from 'react-icons/fi'

const NavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleNavigate = (path: string) => {
        if (location.pathname !== path) navigate(path);
    };

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { path: '/map', icon: FiMap, label: '지도' },
        { path: '/', icon: FiHome, label: '홈' },
        { path: '/review', icon: FiStar, label: '리뷰' },
        { path: '/calendar', icon: FiCalendar, label: '달력' },
    ];

    return (
        <nav className='fixed bottom-0 left-0 right-0 safe-area-bottom' style={{ zIndex: 9999 }}>
            <div className='max-w-[430px] mx-auto'>
                <div className='mx-3 mb-3 rounded-2xl bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-card'>
                    <div className='flex items-center justify-around py-2'>
                        {navItems.map(({ path, icon: Icon, label }) => (
                            <button
                                key={path}
                                onClick={() => handleNavigate(path)}
                                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                                    isActive(path)
                                        ? 'text-primary-600 bg-primary-50'
                                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 active:scale-95'
                                }`}
                            >
                                <Icon className={`text-xl transition-transform duration-200 ${isActive(path) ? 'scale-110' : ''}`} />
                                <span className={`text-[11px] font-medium ${isActive(path) ? 'font-semibold' : ''}`}>
                                    {label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
