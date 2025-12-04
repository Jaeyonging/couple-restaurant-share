import React from 'react'
import ProfileCard from '../../component/Card/ProfileCard/ProfileCard'
import RecommendCard from '../../component/Card/RecommendCard/RecommendCard'
import KakaoLoginButton from '../../component/Login/KakaoLoginButton'
import NaverLoginButton from '../../component/Login/NaverLoginButton'
import GoogleLoginButton from '../../component/Login/GoogleLoginButton'

const Home = () => {
  return (
    <div className='flex flex-col w-full h-[100vh] overflow-hidden'>
      <span>오늘 우리는 1000일이 되었어요!</span>
      <div className='flex gap-2 justify-center items-center'>
        <ProfileCard />
        <ProfileCard />
      </div>
      <RecommendCard />
      <KakaoLoginButton/>
      <NaverLoginButton/>
      <GoogleLoginButton/>
    </div>
  )
}

export default Home
