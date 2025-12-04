import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { PostKakaoLogin } from '../../api/Login/fetch';

const Auth = () => {
    const navigate = useNavigate()
    const code = new URL(window.location.href).searchParams.get("code");
    const [status, setStatus] = useState<string>('loading');
    useEffect(() => {
        if (code) {
            PostKakaoLogin(code).then((res) => {
                console.log(res)
                setStatus('success');
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            }).catch((err) => {
                console.log(err)
            })
        }
    }, [code])

    return (
        <div>
            {status === 'success' ? <div>인증완료되었습니다.</div> :
                <div>
                    {status === 'loading' ? <div>잠시만 기다려주세요</div> : <div>인증실패</div>}
                </div>}
        </div>
    )
}

export default Auth
