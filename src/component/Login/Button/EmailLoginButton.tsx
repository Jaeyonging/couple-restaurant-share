import React, { useState } from 'react'
import { emailLogin, emailRegister } from '../../../api/fetch'
import { useLoginStore } from '../../../store/data'
import ForgotPasswordModal from '../ForgotPasswordModal'

const EmailLoginButton = () => {
  const [showModal, setShowModal] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const { setIsLogin } = useLoginStore()

  const handleEmailLogin = () => {
    setShowModal(true)
    setIsLoginMode(true)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      let response
      if (isLoginMode) {
        if (!email || !password) {
          setError('이메일과 비밀번호를 입력해주세요.')
          return
        }
        response = await emailLogin(email, password)
      } else {
        if (!email || !password || !nickname) {
          setError('모든 필드를 입력해주세요.')
          return
        }
        response = await emailRegister(email, password, nickname)
      }

      // 토큰 저장
      if (response.token) {
        localStorage.setItem('token', response.token)
        setIsLogin(true)
        setShowModal(false)
        setEmail('')
        setPassword('')
        setNickname('')
      }
    } catch (error: any) {
      setError(error.response?.data?.error || '로그인에 실패했습니다.')
    }
  }

  return (
    <>
      <div 
        onClick={handleEmailLogin} 
        className='flex w-full h-[50px] bg-white border border-gray-300 rounded-lg items-center justify-center cursor-pointer shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:bg-gray-50 active:bg-gray-100 transition-all duration-150'
      >
        다른 이메일로 로그인
      </div>

      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-[90%] max-w-md'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-bold'>
                {isLoginMode ? '로그인' : '회원가입'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setError('')
                  setEmail('')
                  setPassword('')
                  setNickname('')
                }}
                className='text-gray-500 hover:text-gray-700'
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4'>
              {!isLoginMode && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    닉네임
                  </label>
                  <input
                    type='text'
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500'
                    placeholder='닉네임을 입력하세요'
                  />
                </div>
              )}
              
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  이메일
                </label>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500'
                  placeholder='이메일을 입력하세요'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  비밀번호
                </label>
                <input
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500'
                  placeholder='비밀번호를 입력하세요'
                />
              </div>

              {error && (
                <div className='text-red-500 text-sm'>{error}</div>
              )}

              <button
                type='submit'
                className='w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors'
              >
                {isLoginMode ? '로그인' : '회원가입'}
              </button>
            </form>

            <div className='mt-4 text-center space-y-2'>
              <button
                onClick={() => {
                  setIsLoginMode(!isLoginMode)
                  setError('')
                }}
                className='block w-full text-sm text-indigo-600 hover:text-indigo-700'
              >
                {isLoginMode ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
              </button>
              {isLoginMode && (
                <button
                  onClick={() => setShowForgot(true)}
                  className='block w-full text-sm text-gray-400 hover:text-gray-600'
                >
                  비밀번호를 잊으셨나요?
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showForgot && (
        <ForgotPasswordModal initialEmail={email} onClose={() => setShowForgot(false)} />
      )}
    </>
  )
}

export default EmailLoginButton
