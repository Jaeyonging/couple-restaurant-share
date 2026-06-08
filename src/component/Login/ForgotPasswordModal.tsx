import React, { useState } from 'react'
import { requestPasswordReset, verifyPasswordCode, resetPassword } from '../../api/fetch'

interface Props {
  onClose: () => void
  initialEmail?: string
}

// 비밀번호 찾기: 이메일 인증번호 → 확인 → 새 비밀번호 등록
const ForgotPasswordModal = ({ onClose, initialEmail = '' }: Props) => {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setInfo('')
    if (!email) { setError('이메일을 입력해주세요.'); return }
    setLoading(true)
    try {
      await requestPasswordReset(email)
      setInfo('인증번호를 메일로 보냈습니다. (가입된 이메일인 경우)')
      setStep(2)
    } catch (err: any) {
      setError(err.response?.data?.error || '요청에 실패했습니다.')
    } finally { setLoading(false) }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setInfo('')
    if (!code) { setError('인증번호를 입력해주세요.'); return }
    setLoading(true)
    try {
      await verifyPasswordCode(email, code)
      setStep(3)
    } catch (err: any) {
      setError(err.response?.data?.error || '인증번호 확인에 실패했습니다.')
    } finally { setLoading(false) }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setInfo('')
    if (newPassword.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return }
    if (newPassword !== confirmPassword) { setError('비밀번호가 일치하지 않습니다.'); return }
    setLoading(true)
    try {
      await resetPassword(email, code, newPassword)
      setInfo('비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.')
      setTimeout(onClose, 1500)
    } catch (err: any) {
      setError(err.response?.data?.error || '비밀번호 변경에 실패했습니다.')
    } finally { setLoading(false) }
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500'

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]'>
      <div className='bg-white rounded-lg p-6 w-[90%] max-w-md'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-bold'>비밀번호 찾기</h2>
          <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>✕</button>
        </div>

        {/* 진행 단계 표시 */}
        <div className='flex items-center gap-2 mb-5'>
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full ${step >= s ? 'bg-primary-500' : 'bg-gray-200'}`} />
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleRequest} className='space-y-4'>
            <p className='text-sm text-gray-500'>가입한 이메일로 인증번호를 보내드립니다.</p>
            <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder='이메일을 입력하세요' />
            {error && <div className='text-red-500 text-sm'>{error}</div>}
            <button type='submit' disabled={loading} className='w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50'>
              {loading ? '전송 중...' : '인증번호 받기'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify} className='space-y-4'>
            <p className='text-sm text-gray-500'><span className='font-medium text-gray-700'>{email}</span> 으로 보낸 6자리 인증번호를 입력하세요. (10분 유효)</p>
            <input
              type='text' inputMode='numeric' maxLength={6} value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className={`${inputCls} text-center text-2xl tracking-[0.5em] font-mono`} placeholder='000000'
            />
            {info && <div className='text-green-600 text-sm'>{info}</div>}
            {error && <div className='text-red-500 text-sm'>{error}</div>}
            <button type='submit' disabled={loading} className='w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50'>
              {loading ? '확인 중...' : '인증번호 확인'}
            </button>
            <button type='button' onClick={handleRequest} className='w-full text-sm text-gray-400 hover:text-gray-600'>인증번호 다시 받기</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleReset} className='space-y-4'>
            <p className='text-sm text-gray-500'>새 비밀번호를 입력하세요.</p>
            <input type='password' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputCls} placeholder='새 비밀번호 (6자 이상)' />
            <input type='password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputCls} placeholder='새 비밀번호 확인' />
            {info && <div className='text-green-600 text-sm'>{info}</div>}
            {error && <div className='text-red-500 text-sm'>{error}</div>}
            <button type='submit' disabled={loading} className='w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50'>
              {loading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordModal
