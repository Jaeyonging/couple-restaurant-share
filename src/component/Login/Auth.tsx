import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { PostKakaoLogin, PostNaverLogin } from '../../api/Login/fetch';
import { linkSocial } from '../../api/fetch';
import { useLoginStore } from '../../store/data';

const Auth = () => {
    const navigate = useNavigate()
    const params = new URL(window.location.href).searchParams;
    const code = params.get("code");
    const state = params.get("state");
    const [status, setStatus] = useState<string>('loading');
    const { setIsLogin } = useLoginStore();

    useEffect(() => {
        if (!code) return;

        const intent = sessionStorage.getItem('oauth_intent') || 'login';
        const provider = (sessionStorage.getItem('oauth_provider') || (state ? 'naver' : 'kakao')) as 'kakao' | 'naver';

        // 네이버는 CSRF 방지용 state 대조
        if (provider === 'naver') {
            const saved = sessionStorage.getItem('naver_oauth_state');
            if (saved && state && saved !== state) {
                setStatus('error');
                return;
            }
        }

        const cleanup = () => {
            sessionStorage.removeItem('oauth_intent');
            sessionStorage.removeItem('oauth_provider');
            sessionStorage.removeItem('naver_oauth_state');
        };

        if (intent === 'link') {
            // 로그인된 계정에 소셜 추가 연동
            const label = provider === 'naver' ? '네이버' : '카카오';
            linkSocial(provider, code, state || undefined)
                .then(() => {
                    cleanup();
                    sessionStorage.setItem('link_toast', JSON.stringify({ type: 'success', msg: `${label} 계정이 연동되었습니다.` }));
                    setStatus('linked');
                    setTimeout(() => navigate('/', { replace: true }), 800);
                })
                .catch((err) => {
                    cleanup();
                    const data = err?.response?.data;
                    if (err?.response?.status === 409 && data?.conflict) {
                        // 이미 다른 계정에 연결됨 → 홈에서 "옮기기" 확인 모달
                        sessionStorage.setItem('link_conflict', JSON.stringify({
                            linkToken: data.linkToken,
                            label: data.label,
                            conflictNickname: data.conflictNickname,
                            conflictHasCouple: data.conflictHasCouple,
                            conflictType: data.conflictType,
                        }));
                        setStatus('linked');
                        setTimeout(() => navigate('/', { replace: true }), 500);
                        return;
                    }
                    const msg = data?.error || '연동에 실패했습니다.';
                    sessionStorage.setItem('link_toast', JSON.stringify({ type: 'error', msg }));
                    setStatus('error');
                    setTimeout(() => navigate('/', { replace: true }), 1200);
                });
            return;
        }

        // 일반 로그인
        const loginPromise = provider === 'naver' ? PostNaverLogin(code, state || '') : PostKakaoLogin(code);
        loginPromise.then((res) => {
            cleanup();
            if (res.token) {
                localStorage.setItem('token', res.token)
                setIsLogin(true)
            }
            setStatus('success');
            setTimeout(() => { navigate('/', { replace: true }); }, 1000);
        }).catch((err) => {
            cleanup();
            console.log(err)
            setStatus('error');
        })
    }, [code, state, navigate, setIsLogin])

    return (
        <div className='flex items-center justify-center h-screen'>
            {status === 'success' ? (
                <div className='text-center'>
                    <div className='text-xl font-semibold text-green-600 mb-2'>인증완료되었습니다.</div>
                    <div className='text-sm text-gray-500'>잠시 후 홈으로 이동합니다...</div>
                </div>
            ) : status === 'linked' ? (
                <div className='text-center'>
                    <div className='text-xl font-semibold text-green-600 mb-2'>계정이 연동되었습니다.</div>
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
