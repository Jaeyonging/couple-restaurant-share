// 카카오/네이버 OAuth 시작 유틸 (로그인 + 계정 연동 공용)
// intent: 'login' = 로그인 / 'link' = 로그인한 계정에 소셜 추가 연동

const KAKAO_KEY = import.meta.env.VITE_KAKAO_RESTAPI
const NAVER_KEY = import.meta.env.VITE_NAVER_CLIENT
const REDIRECT_URL = import.meta.env.PROD
  ? `${import.meta.env.VITE_API_URL}/login/auth`
  : 'http://localhost:5173/login/auth'

type OAuthIntent = 'login' | 'link'

const setIntent = (intent: OAuthIntent, provider: 'kakao' | 'naver') => {
  sessionStorage.setItem('oauth_intent', intent)
  sessionStorage.setItem('oauth_provider', provider)
}

export const startKakaoOAuth = (intent: OAuthIntent = 'login') => {
  setIntent(intent, 'kakao')
  const url = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URL)}`
  window.location.href = url
}

export const startNaverOAuth = (intent: OAuthIntent = 'login') => {
  setIntent(intent, 'naver')
  // CSRF 방지용 state → 콜백에서 대조
  const state = Math.random().toString(36).slice(2) + Date.now().toString(36)
  sessionStorage.setItem('naver_oauth_state', state)
  const url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URL)}&state=${state}`
  window.location.href = url
}
