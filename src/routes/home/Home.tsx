import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileCard from '../../component/Card/ProfileCard/ProfileCard'
import RecommendCard from '../../component/Card/RecommendCard/RecommendCard'
import { useIsLogin } from '../../hooks/isLogin'
import EmailLoginButton from '../../component/Login/Button/EmailLoginButton'
import KakaoLoginButton from '../../component/Login/Button/KakaoLoginButton'
import NaverLoginButton from '../../component/Login/Button/NaverLoginButton'
import { getCoupleInfo, createCouple, joinCouple, updateMeetDay, getFavPlaces, disconnectCouple, deleteAccount, getActivities, markActivitiesRead, getDailyQuestion, answerDailyQuestion, getSchedules, getSocialAccounts, disconnectSocial, resolveLinkConflict, getQuestionHistory } from '../../api/fetch'
import { startKakaoOAuth, startNaverOAuth } from '../../component/Login/oauth'
import { RiKakaoTalkFill } from 'react-icons/ri'
import { SiNaver } from 'react-icons/si'
import { useLoginStore, useToastStore } from '../../store/data'
import { FiLogOut, FiCalendar, FiCopy, FiHeart, FiRefreshCw, FiX, FiUserPlus, FiLink, FiShare2, FiTrash2, FiSettings, FiMapPin, FiBell, FiSend, FiStar, FiCheck, FiMessageSquare, FiAlertCircle, FiEdit3 } from 'react-icons/fi'
import { AiFillStar } from 'react-icons/ai'
import { RenderImg } from '../../component/RenderImg'
import DatePicker from '../../component/DatePicker'
import { API_URL } from '../../types/types'

const Home = () => {
  const isLogin = useIsLogin()
  const navigate = useNavigate()
  const { setIsLogin } = useLoginStore()
  const { addToast } = useToastStore()
  const [coupleInfo, setCoupleInfo] = useState<any>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showMeetDayModal, setShowMeetDayModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [socialAccounts, setSocialAccounts] = useState<{ kakao: boolean; naver: boolean; primaryType: number } | null>(null)
  const [linkConflict, setLinkConflict] = useState<{ linkToken: string; label: string; conflictNickname: string; conflictHasCouple: boolean; conflictType: string } | null>(null)
  const [inviteCode, setInviteCode] = useState('')
  const [meetDay, setMeetDay] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recommendedPlace, setRecommendedPlace] = useState<any>(null)
  const [favPlaces, setFavPlaces] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showInboxModal, setShowInboxModal] = useState(false)
  const [nextSchedule, setNextSchedule] = useState<any>(null)
  const [dailyQuestion, setDailyQuestion] = useState<any>(null)
  const [showQuestionHistory, setShowQuestionHistory] = useState(false)
  const [questionHistory, setQuestionHistory] = useState<{ question_id: number; question: string; assigned_date: string; my_answer: string | null; partner_answer: string | null }[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [answerInput, setAnswerInput] = useState('')
  const [answerLoading, setAnswerLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    if (isLogin) {
      loadCoupleInfo().finally(() => setInitializing(false))
      loadFavPlaces()
      loadActivities()
      loadDailyQuestion()
      loadNextSchedule()
      loadSocialAccounts()
      // 소셜 연동 콜백 결과 토스트
      const lt = sessionStorage.getItem('link_toast')
      if (lt) {
        sessionStorage.removeItem('link_toast')
        try { const { type, msg } = JSON.parse(lt); addToast(type, msg) } catch {}
      }
      // 소셜 연동 충돌 → 확인 모달
      const lc = sessionStorage.getItem('link_conflict')
      if (lc) {
        sessionStorage.removeItem('link_conflict')
        try { setLinkConflict(JSON.parse(lc)) } catch {}
      }
    } else {
      setInitializing(false)
    }
  }, [isLogin])

  const openQuestionHistory = async () => {
    setShowQuestionHistory(true)
    setHistoryLoading(true)
    try {
      const res = await getQuestionHistory()
      setQuestionHistory(res.history || [])
    } catch {
      setQuestionHistory([])
    } finally { setHistoryLoading(false) }
  }

  const loadSocialAccounts = async () => {
    try { setSocialAccounts(await getSocialAccounts()) } catch { /* silent */ }
  }

  const handleDisconnectSocial = async (provider: 'kakao' | 'naver') => {
    try {
      await disconnectSocial(provider)
      addToast('success', `${provider === 'naver' ? '네이버' : '카카오'} 연동이 해제되었습니다.`)
      loadSocialAccounts()
    } catch (e: any) {
      addToast('error', e.response?.data?.error || '연동 해제에 실패했습니다.')
    }
  }

  const handleResolveLinkConflict = async () => {
    if (!linkConflict) return
    try {
      const res = await resolveLinkConflict(linkConflict.linkToken)
      addToast('success', res.message || '연결되었습니다.')
      setLinkConflict(null)
      loadSocialAccounts()
    } catch (e: any) {
      addToast('error', e.response?.data?.error || '연동 처리에 실패했습니다.')
      setLinkConflict(null)
    }
  }

  useEffect(() => {
    if (favPlaces.length > 0) {
      selectRandomRecommendation()
    }
  }, [favPlaces])

  const loadCoupleInfo = async () => {
    try {
      const response = await getCoupleInfo()
      setCoupleInfo(response.couple)
    } catch (error: any) {
      if (error.response?.status === 404) setCoupleInfo(null)
    }
  }

  const loadFavPlaces = async () => {
    try {
      const response = await getFavPlaces()
      setFavPlaces(response.favPlaces || [])
    } catch (error) {
      console.error('Failed to load favorite places:', error)
    }
  }

  const loadNextSchedule = async () => {
    try {
      const res = await getSchedules()
      const today = new Date().toISOString().split('T')[0]
      const upcoming = (res.schedules || []).filter((s: any) => s.schedule_date >= today)
      setNextSchedule(upcoming[0] || null)
    } catch { /* silent */ }
  }

  const loadDailyQuestion = async () => {
    try {
      const res = await getDailyQuestion()
      setDailyQuestion(res)
    } catch { /* silent */ }
  }

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answerInput.trim() || !dailyQuestion) return
    setAnswerLoading(true)
    try {
      const res = await answerDailyQuestion(dailyQuestion.question_id, answerInput.trim())
      setAnswerInput('')
      await loadDailyQuestion()
      if (res.both_answered) {
        addToast('success', '둘 다 답변 완료! 내일 새 질문이 올라와요')
      }
    } catch { /* silent */ }
    finally { setAnswerLoading(false) }
  }

  const loadActivities = async () => {
    try {
      const res = await getActivities()
      setActivities(res.activities || [])
      setUnreadCount(res.unreadCount || 0)
    } catch { /* silent */ }
  }

  const handleOpenInbox = async () => {
    setShowInboxModal(true)
    if (unreadCount > 0) {
      try {
        await markActivitiesRead()
        setUnreadCount(0)
        setActivities(prev => prev.map(a => ({ ...a, is_read: 1 })))
      } catch { /* silent */ }
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return '방금 전'
    if (mins < 60) return `${mins}분 전`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}시간 전`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}일 전`
    return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  const activityIcon = (type: string, small = false) => {
    const base = `${small ? 'w-5 h-5 text-[10px]' : 'w-7 h-7 text-sm'} rounded-full flex items-center justify-center flex-shrink-0`
    switch (type) {
      case 'add_place': return <span className={`${base} bg-primary-100 text-primary-500`}><FiMapPin /></span>
      case 'visit': return <span className={`${base} bg-green-100 text-green-500`}><FiCheck /></span>
      case 'rating': return <span className={`${base} bg-yellow-100 text-yellow-500`}><FiStar /></span>
      case 'comment': return <span className={`${base} bg-blue-100 text-blue-500`}><FiMessageSquare /></span>
      case 'schedule': return <span className={`${base} bg-purple-100 text-purple-500`}><FiCalendar /></span>
      case 'question': return <span className={`${base} bg-pink-100 text-pink-500`}><FiEdit3 /></span>
      default: return <span className={`${base} bg-gray-100 text-gray-500`}><FiAlertCircle /></span>
    }
  }

  const selectRandomRecommendation = () => {
    if (favPlaces.length === 0) {
      setRecommendedPlace(null)
      return
    }
    // 미방문 우선, 없으면 전체에서 랜덤
    const unvisited = favPlaces.filter(p => !p.visitedAt)
    const pool = unvisited.length > 0 ? unvisited : favPlaces
    const randomIndex = Math.floor(Math.random() * pool.length)
    setRecommendedPlace(pool[randomIndex])
  }

  const handleCreateCouple = async () => {
    setLoading(true)
    setError('')
    try {
      await createCouple()
      await loadCoupleInfo()
      setShowInviteModal(true)
    } catch (error: any) {
      setError(error.response?.data?.error || '커플 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinCouple = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode.trim()) {
      setError('초대코드를 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await joinCouple(inviteCode.trim(), meetDay || undefined)
      await loadCoupleInfo()
      await loadFavPlaces()
      setShowInviteModal(false)
      setInviteCode('')
      setMeetDay('')
    } catch (error: any) {
      setError(error.response?.data?.error || '커플 연결에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateMeetDay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!meetDay.trim()) {
      setError('만난 날짜를 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await updateMeetDay(meetDay)
      await loadCoupleInfo()
      setShowMeetDayModal(false)
      setMeetDay('')
    } catch (error: any) {
      setError(error.response?.data?.error || '날짜 수정에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const copyInviteCode = async () => {
    if (!coupleInfo?.inviteCode) return
    try {
      await navigator.clipboard.writeText(coupleInfo.inviteCode)
      addToast('success', '초대코드가 복사되었습니다!')
    } catch {
      addToast('error', '복사에 실패했습니다.')
    }
  }

  const shareInviteCode = async () => {
    if (!coupleInfo?.inviteCode) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: '커플 맛집 초대',
          text: `초대코드: ${coupleInfo.inviteCode}\n커플 맛집 앱에서 함께 맛집을 공유해요!`,
        })
      } catch { /* 사용자가 취소 */ }
    } else {
      copyInviteCode()
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLogin(false)
    setCoupleInfo(null)
    setShowLogoutModal(false)
    navigate('/')
    window.location.reload()
  }

  const handleDisconnectCouple = async () => {
    setLoading(true)
    setError('')
    try {
      await disconnectCouple()
      setCoupleInfo(null)
      setFavPlaces([])
      setRecommendedPlace(null)
      setShowDisconnectModal(false)
      addToast('success', '커플 연결이 끊어졌습니다.')
    } catch (error: any) {
      setError(error.response?.data?.error || '연결 끊기에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setLoading(true)
    setError('')
    try {
      await deleteAccount()
      localStorage.removeItem('token')
      setIsLogin(false)
      setShowDeleteAccountModal(false)
      navigate('/')
      window.location.reload()
    } catch (error: any) {
      setError(error.response?.data?.error || '회원탈퇴에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const calculateDaysTogether = () => {
    if (!coupleInfo?.meetDay) return null
    const meetDate = new Date(coupleInfo.meetDay)
    const today = new Date()
    const diffTime = today.getTime() - meetDate.getTime()
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  // Modal Component
  const Modal = ({ show, onClose, children }: { show: boolean; onClose: () => void; children: React.ReactNode }) => {
    if (!show) return null
    return (
      <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in' style={{ zIndex: 10000 }} onClick={onClose}>
        <div className='bg-white rounded-2xl w-full max-w-sm shadow-card animate-slide-up sm:animate-scale-in mb-2 sm:mb-0' onClick={e => e.stopPropagation()}>
          {children}
        </div>
      </div>
    )
  }

  if (initializing) return null

  // Not logged in
  if (!isLogin) {
    return (
      <div className='min-h-screen bg-gray-50 flex flex-col'>
        <div className='flex-1 flex flex-col items-center justify-center px-6 pb-24'>
          <div className='w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6'>
            <FiHeart className='text-primary-500 text-3xl' />
          </div>
          <h1 className='text-2xl font-bold text-gray-900 mb-2 text-center'>커플 맛집</h1>
          <p className='text-gray-500 text-center mb-8'>둘만의 맛집 리스트를 만들어보세요</p>
          <div className='w-full max-w-xs space-y-3'>
            <EmailLoginButton />
            <div className='flex items-center gap-3 py-1'>
              <div className='flex-1 h-px bg-gray-200' />
              <span className='text-xs text-gray-400'>또는</span>
              <div className='flex-1 h-px bg-gray-200' />
            </div>
            <KakaoLoginButton />
            <NaverLoginButton />
          </div>
        </div>
      </div>
    )
  }

  // Logged in but no couple
  if (isLogin && !coupleInfo) {
    return (
      <div className='min-h-screen bg-gray-50 flex flex-col'>
        <div className='flex-1 flex flex-col items-center justify-center px-6 pb-24'>
          <div className='w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6'>
            <FiLink className='text-primary-500 text-3xl' />
          </div>
          <h1 className='text-2xl font-bold text-gray-900 mb-2 text-center'>커플 연결</h1>
          <p className='text-gray-500 text-center mb-8'>파트너와 연결해서 함께 맛집을 저장하세요</p>

          <div className='w-full max-w-xs space-y-3'>
            <button
              onClick={handleCreateCouple}
              disabled={loading}
              className='w-full py-3.5 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50'
            >
              {loading ? '처리 중...' : '초대코드 생성하기'}
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className='w-full py-3.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors'
            >
              초대코드로 연결하기
            </button>
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            className='mt-8 text-gray-400 text-sm hover:text-gray-600 transition-colors'
          >
            로그아웃
          </button>

          {error && <p className='mt-4 text-red-500 text-sm text-center'>{error}</p>}
        </div>

        {/* Invite Modal */}
        <Modal show={showInviteModal} onClose={() => { setShowInviteModal(false); setInviteCode(''); setError('') }}>
          <div className='p-6'>
            <h2 className='text-lg font-bold text-gray-900 mb-4'>초대코드 입력</h2>
            <form onSubmit={handleJoinCouple}>
              <input
                type='text'
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder='초대코드 6자리'
                maxLength={6}
                className='w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary-500 text-center text-xl tracking-widest font-mono'
              />
              <div className='mt-3'>
                <DatePicker value={meetDay} onChange={setMeetDay} placeholder='만난 날짜 (선택)' />
              </div>
              {error && <p className='mt-3 text-red-500 text-sm'>{error}</p>}
              <div className='flex gap-2 mt-4'>
                <button type='button' onClick={() => { setShowInviteModal(false); setError('') }} className='flex-1 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl'>취소</button>
                <button type='submit' disabled={loading} className='flex-1 py-3 bg-primary-500 text-white font-medium rounded-xl disabled:opacity-50'>
                  {loading ? '연결 중...' : '연결하기'}
                </button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Logout Modal */}
        <Modal show={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
          <div className='p-6 text-center'>
            <h2 className='text-lg font-bold text-gray-900 mb-2'>로그아웃</h2>
            <p className='text-gray-500 mb-6'>정말 로그아웃 하시겠습니까?</p>
            <div className='flex gap-2'>
              <button onClick={() => setShowLogoutModal(false)} className='flex-1 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl'>취소</button>
              <button onClick={handleLogout} className='flex-1 py-3 bg-red-500 text-white font-medium rounded-xl'>로그아웃</button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  // Logged in with couple
  const daysTogether = calculateDaysTogether()
  const token = localStorage.getItem('token')
  let currentUserId: number | null = null
  if (token) {
    try {
      const userInfo = JSON.parse(atob(token.split('.')[1]))
      currentUserId = userInfo.id
    } catch (e) {}
  }

  return (
    <div className='min-h-screen bg-gray-50 pb-24'>
      {/* Header */}
      <header className='bg-white border-b border-gray-100 sticky top-0 z-40'>
        <div className='max-w-lg mx-auto px-4 py-4 flex items-center justify-between'>
          <h1 className='text-lg font-bold text-gray-900'>커플 맛집</h1>
          <div className='flex items-center gap-1'>
            <button onClick={handleOpenInbox} className='relative p-2 text-gray-400 hover:text-gray-600 transition-colors'>
              <FiBell className='text-xl' />
              {unreadCount > 0 && (
                <span className='absolute top-1 right-1 min-w-[16px] h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5'>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button onClick={() => setShowSettingsModal(true)} className='p-2 text-gray-400 hover:text-gray-600 transition-colors'>
              <FiSettings className='text-xl' />
            </button>
          </div>
        </div>
      </header>

      <main className='max-w-lg mx-auto px-4 py-6 space-y-6'>
        {/* Days Together Card */}
        <section className='bg-white rounded-2xl px-4 py-4 shadow-soft'>
          {coupleInfo?.meetDay ? (
            <div className='flex items-center justify-center relative'>
              <div className='flex items-center gap-2 leading-none'>
                <FiHeart className='text-primary-400 text-xl shrink-0' />
                <span className='text-sm text-gray-500'>함께한 지</span>
                <span className='text-2xl font-extrabold text-primary-500'>{daysTogether}</span>
                <span className='text-base font-bold text-gray-700'>일</span>
              </div>
              <button
                onClick={() => { setMeetDay(coupleInfo.meetDay || ''); setShowMeetDayModal(true) }}
                className='absolute right-0 p-1.5 text-gray-300 hover:text-primary-500 transition-colors'
              >
                <FiCalendar className='text-lg' />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setMeetDay(''); setShowMeetDayModal(true) }}
              className='w-full flex items-center justify-center gap-2 py-3 text-gray-400 hover:text-primary-500 transition-colors'
            >
              <FiCalendar className='text-xl' />
              <span className='font-medium'>만난 날짜 등록하기</span>
            </button>
          )}
        </section>

        {/* Profiles */}
        <section className='flex items-center justify-center gap-4'>
          <ProfileCard
            user={coupleInfo?.user1_nickname}
            imgUrl={coupleInfo?.user1_imgUrl ? (
              coupleInfo.user1_imgUrl.startsWith('http')
                ? coupleInfo.user1_imgUrl
                : `${import.meta.env.VITE_API_URL}${coupleInfo.user1_imgUrl}`
            ) : undefined}
            isEditable={currentUserId === coupleInfo?.user_id}
            userId={coupleInfo?.user_id}
          />

          {coupleInfo?.user2_id ? (
            <>
              <div className='w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center'>
                <FiHeart className='text-primary-500' />
              </div>
              <ProfileCard
                user={coupleInfo.user2_nickname}
                imgUrl={coupleInfo.user2_imgUrl ? (
                  coupleInfo.user2_imgUrl.startsWith('http')
                    ? coupleInfo.user2_imgUrl
                    : `${import.meta.env.VITE_API_URL}${coupleInfo.user2_imgUrl}`
                ) : undefined}
                isEditable={currentUserId === coupleInfo.user2_id}
                userId={coupleInfo.user2_id}
              />
            </>
          ) : (
            <button
              onClick={() => setShowInviteModal(true)}
              className='w-32 h-40 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors'
            >
              <FiUserPlus className='text-2xl' />
              <span className='text-sm font-medium'>파트너 초대</span>
            </button>
          )}
        </section>

        {/* 오늘의 질문 */}
        {coupleInfo?.user2_id && dailyQuestion && (
          <section className='bg-white rounded-2xl shadow-soft overflow-hidden'>
            {/* 질문 */}
            <div className='px-4 pt-4 pb-4 border-b border-gray-100'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-xs font-semibold text-primary-500 uppercase tracking-wide'>오늘의 질문</span>
                <div className='flex items-center gap-2'>
                  {dailyQuestion.is_complete && (
                    <span className='text-[11px] text-green-500 font-semibold'>둘 다 완료</span>
                  )}
                  <button onClick={openQuestionHistory} className='text-[11px] text-gray-400 font-medium hover:text-primary-500 transition-colors'>지난 질문</button>
                </div>
              </div>
              <p className='text-sm text-gray-800 leading-relaxed font-medium'>{dailyQuestion.question}</p>
            </div>

            {/* 내 답변 */}
            <div className='px-4 py-3 border-b border-gray-100'>
              <p className='text-[11px] font-semibold text-gray-400 mb-2'>나</p>
              {dailyQuestion.my_answer ? (
                <p className='text-sm text-gray-800'>{dailyQuestion.my_answer.answer}</p>
              ) : (
                <form onSubmit={handleSubmitAnswer} className='space-y-1.5'>
                  <div className='flex gap-2'>
                    <input
                      type='text'
                      value={answerInput}
                      onChange={e => setAnswerInput(e.target.value.slice(0, 100))}
                      placeholder='답변을 입력해보세요'
                      maxLength={100}
                      className='flex-1 px-3 py-2 bg-gray-50 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-400 focus:outline-none'
                    />
                    <button
                      type='submit'
                      disabled={!answerInput.trim() || answerLoading}
                      className='w-9 h-9 bg-primary-500 text-white rounded-xl flex items-center justify-center hover:bg-primary-600 disabled:opacity-40 transition-colors flex-shrink-0'
                    >
                      <FiSend className='text-sm' />
                    </button>
                  </div>
                  <div className='flex justify-end'>
                    <span className={`text-[11px] tabular-nums ${answerInput.length >= 100 ? 'text-red-400' : answerInput.length >= 80 ? 'text-yellow-500' : 'text-gray-300'}`}>
                      {answerInput.length}/100
                    </span>
                  </div>
                </form>
              )}
            </div>

            {/* 파트너 답변 */}
            <div className='px-4 py-3'>
              <p className='text-[11px] font-semibold text-gray-400 mb-2'>파트너</p>
              {dailyQuestion.partner_answer ? (
                <p className='text-sm text-gray-800'>{dailyQuestion.partner_answer.answer}</p>
              ) : dailyQuestion.partner_answered ? (
                <p className='text-xs text-gray-400'>내가 먼저 답변하면 볼 수 있어요</p>
              ) : (
                <p className='text-xs text-gray-300'>아직 답변하지 않았어요</p>
              )}
            </div>
          </section>
        )}

        {/* 다음 일정 */}
        {nextSchedule && (() => {
          const date = new Date(nextSchedule.schedule_date + 'T12:00:00')
          const todayMs = new Date().setHours(0, 0, 0, 0)
          const diffDays = Math.ceil((date.getTime() - todayMs) / (1000 * 60 * 60 * 24))
          const dDayStr = diffDays === 0 ? 'D-DAY' : `D-${diffDays}`
          const weekdays = ['일', '월', '화', '수', '목', '금', '토']
          return (
            <section>
              <div className='flex items-center justify-between mb-3'>
                <h2 className='text-base font-bold text-gray-900'>다음 일정</h2>
                <button onClick={() => navigate('/calendar')} className='text-xs text-primary-500 font-medium'>달력 보기</button>
              </div>
              <div className='bg-white rounded-2xl shadow-soft overflow-hidden flex items-stretch'>
                {/* 날짜 블록 */}
                <div className='bg-primary-500 text-white flex flex-col items-center justify-center px-4 py-4 min-w-[60px]'>
                  <p className='text-[11px] font-medium opacity-80'>{date.getMonth() + 1}월</p>
                  <p className='text-2xl font-bold leading-none mt-0.5'>{date.getDate()}</p>
                  <p className='text-[11px] opacity-70 mt-0.5'>{weekdays[date.getDay()]}</p>
                </div>
                {/* 내용 */}
                <div className='flex-1 px-4 py-3 flex flex-col justify-center min-w-0'>
                  <div className='flex items-center gap-2'>
                    <p className='font-semibold text-gray-900 text-sm flex-1 truncate'>{nextSchedule.title}</p>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${diffDays === 0 ? 'bg-primary-500 text-white' : 'bg-primary-50 text-primary-500'}`}>
                      {dDayStr}
                    </span>
                  </div>
                  {nextSchedule.place_name && (
                    <p className='text-xs text-gray-400 flex items-center gap-1 mt-1.5'>
                      <FiMapPin className='flex-shrink-0 text-[11px]' />{nextSchedule.place_name}
                    </p>
                  )}
                  {nextSchedule.description && (
                    <p className='text-xs text-gray-400 mt-0.5 truncate'>{nextSchedule.description}</p>
                  )}
                </div>
              </div>
            </section>
          )
        })()}

        {/* 파트너 최근 활동 */}
        {(() => {
          const partnerPlaces = favPlaces
            .filter(p => p.created_by !== currentUserId)
            .slice(0, 3)
          if (partnerPlaces.length === 0) return null
          return (
            <section>
              <div className='flex items-center justify-between mb-3'>
                <h2 className='text-base font-bold text-gray-900'>파트너가 추가한 곳</h2>
                <button onClick={() => navigate('/review')} className='text-xs text-primary-500 font-medium'>전체 보기</button>
              </div>
              <div className='space-y-2'>
                {partnerPlaces.map((place) => {
                  const thumbnail = place.thumbnails?.split(',')[0] || null
                  return (
                    <div
                      key={place.id}
                      onClick={() => navigate('/review')}
                      className='bg-white rounded-2xl p-3 shadow-soft flex items-center gap-3 cursor-pointer hover:shadow-card transition-shadow'
                    >
                      <div className='w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100'>
                        <RenderImg imgurl={thumbnail} alt={place.name} className='w-full h-full object-cover' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='font-bold text-gray-900 truncate text-[15px]'>{place.name}</p>
                        <p className='text-[13px] text-gray-500 truncate mt-0.5'>{place.categories?.split(',')[0]?.trim()}</p>
                      </div>
                      <span className='text-[11px] bg-primary-50 text-primary-500 font-medium px-2 py-1 rounded-full flex-shrink-0'>파트너 추가</span>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })()}

        {/* Recommendation */}
        {recommendedPlace && (
          <section>
            <div className='flex items-center justify-between mb-3'>
              <h2 className='text-base font-bold text-gray-900'>오늘의 추천</h2>
              <button
                onClick={selectRandomRecommendation}
                className='p-2 text-gray-400 hover:text-primary-500 transition-colors'
              >
                <FiRefreshCw className='text-lg' />
              </button>
            </div>
            <RecommendCard place={recommendedPlace} />
          </section>
        )}

        {/* Actions */}
        {coupleInfo?.user2_id && (
          <button
            onClick={() => setShowDisconnectModal(true)}
            className='w-full py-3 text-gray-400 text-sm hover:text-red-500 transition-colors'
          >
            커플 연결 끊기
          </button>
        )}
      </main>

      {/* Invite Modal */}
      <Modal show={showInviteModal} onClose={() => { setShowInviteModal(false); setInviteCode(''); setError('') }}>
        <div className='p-6'>
          <h2 className='text-lg font-bold text-gray-900 mb-4'>
            {coupleInfo?.inviteCode ? '초대코드' : '초대코드 입력'}
          </h2>

          {coupleInfo?.inviteCode && (
            <div className='mb-4 p-4 bg-primary-50 rounded-xl'>
              <p className='text-xs text-primary-600 mb-2 font-medium'>내 초대코드</p>
              <div className='flex items-center gap-2'>
                <code className='flex-1 text-2xl font-bold text-primary-600 tracking-widest text-center'>
                  {coupleInfo.inviteCode}
                </code>
                <button onClick={copyInviteCode} className='p-2 bg-white text-primary-500 rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors'>
                  <FiCopy />
                </button>
                <button onClick={shareInviteCode} className='p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors'>
                  <FiShare2 />
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleJoinCouple}>
            <input
              type='text'
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder='상대방 초대코드'
              maxLength={6}
              className='w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary-500 text-center text-xl tracking-widest font-mono'
            />
            {error && <p className='mt-3 text-red-500 text-sm'>{error}</p>}
            <div className='flex gap-2 mt-4'>
              <button type='button' onClick={() => { setShowInviteModal(false); setError('') }} className='flex-1 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl'>닫기</button>
              <button type='submit' disabled={loading || !inviteCode.trim()} className='flex-1 py-3 bg-primary-500 text-white font-medium rounded-xl disabled:opacity-50'>
                {loading ? '연결 중...' : '연결하기'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Meet Day Modal */}
      <Modal show={showMeetDayModal} onClose={() => { setShowMeetDayModal(false); setMeetDay(''); setError('') }}>
        <div className='p-6'>
          <h2 className='text-lg font-bold text-gray-900 mb-4'>만난 날짜</h2>
          <form onSubmit={handleUpdateMeetDay}>
            <DatePicker value={meetDay} onChange={setMeetDay} placeholder='만난 날짜 선택' />
            {error && <p className='mt-3 text-red-500 text-sm'>{error}</p>}
            <div className='flex gap-2 mt-4'>
              <button type='button' onClick={() => { setShowMeetDayModal(false); setError('') }} className='flex-1 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl'>취소</button>
              <button type='submit' disabled={loading} className='flex-1 py-3 bg-primary-500 text-white font-medium rounded-xl disabled:opacity-50'>
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Logout Modal */}
      <Modal show={showLogoutModal} onClose={() => setShowLogoutModal(false)}>
        <div className='p-6 text-center'>
          <h2 className='text-lg font-bold text-gray-900 mb-2'>로그아웃</h2>
          <p className='text-gray-500 mb-6'>정말 로그아웃 하시겠습니까?</p>
          <div className='flex gap-2'>
            <button onClick={() => setShowLogoutModal(false)} className='flex-1 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl'>취소</button>
            <button onClick={handleLogout} className='flex-1 py-3 bg-red-500 text-white font-medium rounded-xl'>로그아웃</button>
          </div>
        </div>
      </Modal>

      {/* Disconnect Modal */}
      <Modal show={showDisconnectModal} onClose={() => { setShowDisconnectModal(false); setError('') }}>
        <div className='p-6'>
          <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <FiX className='text-red-500 text-xl' />
          </div>
          <h2 className='text-lg font-bold text-gray-900 text-center mb-2'>커플 연결 끊기</h2>
          <p className='text-gray-500 text-center text-sm mb-4'>
            연결을 끊으면 모든 맛집 데이터가 삭제됩니다.
            이 작업은 되돌릴 수 없습니다.
          </p>
          {error && <p className='mb-4 text-red-500 text-sm text-center'>{error}</p>}
          <div className='flex gap-2'>
            <button onClick={() => setShowDisconnectModal(false)} className='flex-1 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl'>취소</button>
            <button onClick={handleDisconnectCouple} disabled={loading} className='flex-1 py-3 bg-red-500 text-white font-medium rounded-xl disabled:opacity-50'>
              {loading ? '처리 중...' : '연결 끊기'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Inbox Modal */}
      <Modal show={showInboxModal} onClose={() => setShowInboxModal(false)}>
        <div className='p-5'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-bold text-gray-900'>파트너 알림</h2>
            <button onClick={() => setShowInboxModal(false)} className='p-1 text-gray-400 hover:text-gray-600'>
              <FiX className='text-xl' />
            </button>
          </div>
          {activities.length === 0 ? (
            <div className='text-center py-12'>
              <div className='w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                <FiBell className='text-gray-300 text-2xl' />
              </div>
              <p className='text-sm text-gray-400'>아직 받은 알림이 없어요</p>
            </div>
          ) : (
            <div className='space-y-2 max-h-[65vh] overflow-y-auto -mx-1 px-1'>
              {activities.map((a) => {
                const imgSrc = a.from_imgUrl
                  ? (a.from_imgUrl.startsWith('http') ? a.from_imgUrl : `${API_URL}${a.from_imgUrl}`)
                  : '/noimg.jpeg'
                return (
                  <div key={a.id} className={`flex items-center gap-3 p-3 rounded-2xl border ${!a.is_read ? 'bg-primary-50/70 border-primary-100' : 'bg-white border-gray-100'}`}>
                    {/* 아바타 + 활동 아이콘 배지 */}
                    <div className='relative flex-shrink-0'>
                      <img
                        src={imgSrc}
                        alt={a.from_nickname}
                        className='w-11 h-11 rounded-full object-cover bg-gray-100'
                        onError={(e) => { (e.target as HTMLImageElement).src = '/noimg.jpeg' }}
                      />
                      <span className='absolute -bottom-1 -right-1 ring-2 ring-white rounded-full'>
                        {activityIcon(a.activity_type, true)}
                      </span>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-[15px] text-gray-900 leading-snug'>
                        <span className='font-bold'>{a.from_nickname}</span>
                        <span className='text-gray-700'>님이 {a.content}</span>
                      </p>
                      <p className='text-xs text-gray-400 mt-1'>{timeAgo(a.created_at)}</p>
                    </div>
                    {!a.is_read && <span className='w-2.5 h-2.5 bg-primary-500 rounded-full flex-shrink-0' />}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal show={showSettingsModal} onClose={() => setShowSettingsModal(false)}>
        <div className='p-6'>
          <h2 className='text-lg font-bold text-gray-900 mb-5'>설정</h2>

          {/* 계정 연동 */}
          <div className='mb-5'>
            <p className='text-xs font-semibold text-gray-400 mb-2 px-1'>계정 연동</p>
            <div className='space-y-2'>
              {/* 카카오 */}
              <div className='flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50'>
                <div className='w-9 h-9 bg-[#FEE500] rounded-xl flex items-center justify-center'>
                  <RiKakaoTalkFill className='text-[#3C1E1E]' />
                </div>
                <span className='flex-1 text-sm font-medium text-gray-700'>카카오</span>
                {socialAccounts?.kakao ? (
                  socialAccounts.primaryType === 1 ? (
                    <span className='text-xs text-gray-400 font-medium px-2'>가입 수단</span>
                  ) : (
                    <button onClick={() => handleDisconnectSocial('kakao')} className='text-xs font-semibold text-gray-400 hover:text-red-500 px-2 py-1'>연동 해제</button>
                  )
                ) : (
                  <button onClick={() => startKakaoOAuth('link')} className='text-xs font-semibold text-primary-500 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100'>연결</button>
                )}
              </div>
              {/* 네이버 */}
              <div className='flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50'>
                <div className='w-9 h-9 bg-[#03C75A] rounded-xl flex items-center justify-center'>
                  <SiNaver className='text-white text-sm' />
                </div>
                <span className='flex-1 text-sm font-medium text-gray-700'>네이버</span>
                {socialAccounts?.naver ? (
                  socialAccounts.primaryType === 2 ? (
                    <span className='text-xs text-gray-400 font-medium px-2'>가입 수단</span>
                  ) : (
                    <button onClick={() => handleDisconnectSocial('naver')} className='text-xs font-semibold text-gray-400 hover:text-red-500 px-2 py-1'>연동 해제</button>
                  )
                ) : (
                  <button onClick={() => startNaverOAuth('link')} className='text-xs font-semibold text-primary-500 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100'>연결</button>
                )}
              </div>
            </div>
          </div>

          <div className='space-y-2'>
            <button
              onClick={() => { setShowSettingsModal(false); setShowLogoutModal(true) }}
              className='w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left'
            >
              <div className='w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center'>
                <FiLogOut className='text-gray-500' />
              </div>
              <span className='text-sm font-medium text-gray-700'>로그아웃</span>
            </button>
            <button
              onClick={() => { setShowSettingsModal(false); setShowDeleteAccountModal(true) }}
              className='w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-left'
            >
              <div className='w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center'>
                <FiTrash2 className='text-red-400' />
              </div>
              <span className='text-sm font-medium text-red-500'>회원탈퇴</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* 지난 질문 모아보기 모달 */}
      <Modal show={showQuestionHistory} onClose={() => setShowQuestionHistory(false)}>
        <div className='p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-bold text-gray-900'>지난 질문</h2>
            <button onClick={() => setShowQuestionHistory(false)} className='p-1 text-gray-400 hover:text-gray-600'>
              <FiX className='text-xl' />
            </button>
          </div>
          {historyLoading ? (
            <p className='text-center text-gray-400 text-sm py-10'>불러오는 중...</p>
          ) : questionHistory.length === 0 ? (
            <p className='text-center text-gray-300 text-sm py-10'>아직 완료한 질문이 없어요</p>
          ) : (
            <div className='space-y-3 max-h-[65vh] overflow-y-auto -mx-1 px-1'>
              {questionHistory.map(item => (
                <div key={item.question_id} className='border border-gray-100 rounded-2xl p-4'>
                  <p className='text-xs text-gray-400 mb-1.5'>
                    {new Date(item.assigned_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className='text-[15px] font-bold text-gray-900 mb-3 leading-snug'>{item.question}</p>
                  <div className='space-y-2'>
                    <div className='bg-primary-50 rounded-xl px-3 py-2'>
                      <p className='text-[10px] font-semibold text-primary-400 mb-0.5'>나</p>
                      <p className='text-sm text-gray-800'>{item.my_answer || '-'}</p>
                    </div>
                    <div className='bg-gray-50 rounded-xl px-3 py-2'>
                      <p className='text-[10px] font-semibold text-gray-400 mb-0.5'>파트너</p>
                      <p className='text-sm text-gray-800'>{item.partner_answer || '-'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* 소셜 연동 충돌 확인 모달 */}
      <Modal show={!!linkConflict} onClose={() => setLinkConflict(null)}>
        <div className='p-6'>
          <h2 className='text-lg font-bold text-gray-900 mb-2'>{linkConflict?.label} 계정이 이미 연결돼 있어요</h2>
          <p className='text-sm text-gray-500 mb-3'>
            이 {linkConflict?.label} 계정은 현재 <span className='font-semibold text-gray-700'>{linkConflict?.conflictNickname}</span> 계정에 연결되어 있습니다.
            지금 로그인한 계정으로 옮길까요?
          </p>
          {linkConflict?.conflictType === 'signup' && (
            <div className='text-xs text-red-500 bg-red-50 rounded-xl p-3 mb-4'>
              ⚠️ 기존 {linkConflict?.label} 계정({linkConflict?.conflictNickname})은 삭제됩니다.
              {linkConflict?.conflictHasCouple && ' 해당 계정의 커플 연결·저장 데이터도 함께 삭제됩니다.'}
            </div>
          )}
          <div className='flex gap-2'>
            <button onClick={() => setLinkConflict(null)} className='flex-1 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl'>취소</button>
            <button onClick={handleResolveLinkConflict} className='flex-1 py-3 bg-primary-500 text-white font-medium rounded-xl'>옮겨서 연결</button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal show={showDeleteAccountModal} onClose={() => { setShowDeleteAccountModal(false); setError('') }}>
        <div className='p-6'>
          <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <FiTrash2 className='text-red-500 text-xl' />
          </div>
          <h2 className='text-lg font-bold text-gray-900 text-center mb-2'>회원탈퇴</h2>
          <p className='text-gray-500 text-center text-sm mb-4'>
            계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.<br />
            이 작업은 되돌릴 수 없습니다.
          </p>
          {error && <p className='mb-4 text-red-500 text-sm text-center'>{error}</p>}
          <div className='flex gap-2'>
            <button onClick={() => { setShowDeleteAccountModal(false); setError('') }} className='flex-1 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl'>취소</button>
            <button onClick={handleDeleteAccount} disabled={loading} className='flex-1 py-3 bg-red-500 text-white font-medium rounded-xl disabled:opacity-50'>
              {loading ? '처리 중...' : '탈퇴하기'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Home
