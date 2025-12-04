import React from 'react'

const EmailLoginButton = () => {
  const handleEmailLogin = () => {
    console.log('이메일로 로그인');
  }
  return (
    <div onClick={handleEmailLogin} className='flex w-[80%] h-[50px] bg-white border border-gray-300 rounded-lg items-center justify-center cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-gray-50 active:bg-gray-100 transition-all duration-150'>
      다른 이메일로 로그인
    </div>
  )
}

export default EmailLoginButton
