import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { PostKakaoLogin } from '../../api/Login/fetch';
import { useLoginStore } from '../../store/data';

const Auth = () => {
    const navigate = useNavigate()
    const code = new URL(window.location.href).searchParams.get("code");
    const [status, setStatus] = useState<string>('loading');
    const { setIsLogin } = useLoginStore();
    
    useEffect(() => {
        if (code) {
            PostKakaoLogin(code).then((res) => {
                console.log(res)
                // 토큰 저장
                if (res.token) {
                    localStorage.setItem('token', res.token)
                    setIsLogin(true)
                }
                setStatus('success');
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            }).catch((err) => {
                console.log(err)
                setStatus('error');
            })
        }
    }, [code, navigate, setIsLogin])

    return (
        <div className='flex items-center justify-center h-screen'>
            {status === 'success' ? (
                <div className='text-center'>
                    <div className='text-xl font-semibold text-green-600 mb-2'>인증완료되었습니다.</div>
                    <div className='text-sm text-gray-500'>잠시 후 홈으로 이동합니다...</div>
                </div>
            ) : (
                <div className='text-center'>
                    {status === 'loading' ? (
                        <>
                            <div className='text-xl font-semibold mb-2'>잠시만 기다려주세요</div>
                            <div className='text-sm text-gray-500'>로그인 처리 중...</div>
                        </>
                    ) : (
                        <div className='text-red-600'>인증실패</div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Auth
