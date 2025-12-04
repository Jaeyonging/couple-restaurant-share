import React from 'react'
import ProfileCard from '../../component/Card/ProfileCard/ProfileCard'
import RecommendCard from '../../component/Card/RecommendCard/RecommendCard'
import KakaoLoginButton from '../../component/Login/KakaoLoginButton'
import NaverLoginButton from '../../component/Login/NaverLoginButton'
import GoogleLoginButton from '../../component/Login/GoogleLoginButton'
import { useIsLogin } from '../../hooks/isLogin'

const Home = () => {
  const isLogin = useIsLogin()

  return (
    <div className='relative flex flex-col w-full h-[100vh] overflow-hidden'>
      <div className={`flex flex-col items-center gap-4 p-6 ${!isLogin ? 'blur-sm opacity-30 pointer-events-none' : ''}`}>
        <span className='text-xl font-semibold'>오늘 우리는 1000일이 되었어요!</span>
        <div className='flex gap-2 justify-center items-center'>
          <ProfileCard />
          <ProfileCard />
        </div>
      </div>

      {!isLogin && (
        <div className='absolute inset-0 flex flex-col items-center justify-end pb-20 gap-4 z-10'>
          <div className='flex flex-col items-center gap-3 w-full px-4'>
            <KakaoLoginButton/>
            <NaverLoginButton/>
            <GoogleLoginButton/>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
