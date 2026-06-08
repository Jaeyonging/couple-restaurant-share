import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiPlus, FiX, FiTrash2, FiCalendar, FiMapPin, FiCheckCircle } from 'react-icons/fi'
import { useIsLogin } from '../../hooks/isLogin'
import { getSchedules, addSchedule, deleteSchedule, getFavPlaces } from '../../api/fetch'
import { useToastStore } from '../../store/data'
import DatePicker from '../../component/DatePicker'

interface Schedule {
  id: number
  title: string
  schedule_date: string
  description?: string
  place_name?: string
  user_id: number
  nickname: string
  imgUrl?: string
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

const Calendar = () => {
  const isLogin = useIsLogin()
  const { addToast } = useToastStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [visitDates, setVisitDates] = useState<string[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newPlaceName, setNewPlaceName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [expandedScheduleId, setExpandedScheduleId] = useState<number | null>(null)
  const [expandedUpcomingId, setExpandedUpcomingId] = useState<number | null>(null)
  const [visitPlacesMap, setVisitPlacesMap] = useState<Record<string, string[]>>({})

  const _now = new Date()
  const today = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}-${String(_now.getDate()).padStart(2, '0')}`

  useEffect(() => {
    if (isLogin) {
      loadData()
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const info = JSON.parse(atob(token.split('.')[1]))
          setCurrentUserId(info.id)
        }
      } catch {}
    }
  }, [isLogin])

  const loadData = async () => {
    try {
      const [schRes, fpRes] = await Promise.all([getSchedules(), getFavPlaces()])
      setSchedules(schRes.schedules || [])
      const map: Record<string, string[]> = {}
      for (const p of (fpRes.favPlaces || [])) {
        if (p.visitedAt) {
          const dateKey = (p.visitedAt as string).split('T')[0]
          if (!map[dateKey]) map[dateKey] = []
          map[dateKey].push(p.name)
        }
      }
      setVisitPlacesMap(map)
      setVisitDates(Object.keys(map))
    } catch { /* silent */ }
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const formatDate = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const getSchedulesForDate = (date: string) =>
    schedules.filter(s => s.schedule_date.split('T')[0] === date)

  const hasVisit = (date: string) => visitDates.includes(date)
  const hasSchedule = (date: string) => schedules.some(s => s.schedule_date.split('T')[0] === date)

  const selectedSchedules = selectedDate ? getSchedulesForDate(selectedDate) : []
  const selectedHasVisit = selectedDate ? hasVisit(selectedDate) : false

  const upcomingSchedules = schedules
    .filter(s => s.schedule_date.split('T')[0] >= today)
    .sort((a, b) => a.schedule_date.localeCompare(b.schedule_date))
    .slice(0, 1)

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newDate) return
    setLoading(true)
    try {
      await addSchedule({
        title: newTitle.trim(),
        scheduleDate: newDate,
        placeName: newPlaceName.trim() || undefined,
        description: newDescription.trim() || undefined,
      })
      await loadData()
      setShowAddModal(false)
      setNewTitle('')
      setNewDate('')
      setNewPlaceName('')
      setNewDescription('')
      addToast('success', '일정이 추가되었습니다!')
    } catch {
      addToast('error', '일정 추가에 실패했습니다.')
    } finally { setLoading(false) }
  }

  const handleDeleteSchedule = async (scheduleId: number) => {
    try {
      await deleteSchedule(scheduleId)
      await loadData()
      addToast('success', '일정이 삭제되었습니다.')
    } catch {
      addToast('error', '삭제에 실패했습니다.')
    }
  }

  // Build calendar cells
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const openAdd = (date?: string) => {
    setNewDate(date || selectedDate || today)
    setShowAddModal(true)
  }

  if (!isLogin) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <p className='text-gray-400 text-sm'>로그인이 필요합니다.</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 pb-28'>
      <header className='bg-white sticky top-0 z-40 border-b border-gray-100'>
        <div className='max-w-lg mx-auto px-4 py-4'>
          <h1 className='text-xl font-bold text-gray-900'>데이트 달력</h1>
        </div>
      </header>

      <main className='max-w-lg mx-auto px-4 py-5 space-y-5'>
        {/* ── 캘린더 카드 ── */}
        <div className='bg-white rounded-2xl shadow-soft overflow-hidden'>
          {/* 월 네비게이션 */}
          <div className='flex items-center justify-between px-5 py-4'>
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className='p-2 text-gray-400 hover:text-primary-500 rounded-xl hover:bg-primary-50 transition-colors'
            >
              <FiChevronLeft className='text-lg' />
            </button>
            <h2 className='text-base font-bold text-gray-900'>{year}년 {MONTHS[month]}</h2>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className='p-2 text-gray-400 hover:text-primary-500 rounded-xl hover:bg-primary-50 transition-colors'
            >
              <FiChevronRight className='text-lg' />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className='grid grid-cols-7 px-3 pb-1'>
            {DAYS.map((d, i) => (
              <div key={d} className={`text-center text-xs font-semibold py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* 날짜 셀 */}
          <div className='grid grid-cols-7 px-3 pb-4 gap-y-1'>
            {cells.map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} />
              const dateStr = formatDate(year, month, day)
              const isToday = dateStr === today
              const isSelected = dateStr === selectedDate
              const hasSch = hasSchedule(dateStr)
              const hasVis = hasVisit(dateStr)
              const dayOfWeek = (firstDayOfMonth + day - 1) % 7

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`flex flex-col items-center py-1.5 rounded-xl transition-all ${
                    isSelected ? 'bg-primary-500' : isToday ? 'bg-primary-50' : 'hover:bg-gray-50 active:bg-gray-100'
                  }`}
                >
                  <span className={`text-sm font-medium ${
                    isSelected ? 'text-white' :
                    isToday ? 'text-primary-600 font-bold' :
                    dayOfWeek === 0 ? 'text-red-400' :
                    dayOfWeek === 6 ? 'text-blue-400' :
                    'text-gray-700'
                  }`}>
                    {day}
                  </span>
                  <div className='flex gap-0.5 mt-0.5 h-1.5'>
                    {hasSch && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/80' : 'bg-primary-400'}`} />}
                    {hasVis && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/80' : 'bg-green-400'}`} />}
                  </div>
                </button>
              )
            })}
          </div>

          {/* 범례 */}
          <div className='flex items-center gap-4 px-5 pb-4 text-xs text-gray-400'>
            <span className='flex items-center gap-1.5'><span className='w-2 h-2 bg-primary-400 rounded-full inline-block' />일정</span>
            <span className='flex items-center gap-1.5'><span className='w-2 h-2 bg-green-400 rounded-full inline-block' />방문</span>
          </div>
        </div>

        {/* ── 선택된 날짜 상세 ── */}
        {selectedDate && (
          <div className='bg-white rounded-2xl shadow-soft p-4'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='font-bold text-gray-900 text-sm'>
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
              </h3>
              <button
                onClick={() => openAdd(selectedDate)}
                className='flex items-center gap-1 text-xs text-primary-500 font-semibold bg-primary-50 px-2.5 py-1.5 rounded-lg hover:bg-primary-100 transition-colors'
              >
                <FiPlus className='text-xs' /> 일정 추가
              </button>
            </div>

            {selectedSchedules.length === 0 && !selectedHasVisit ? (
              <p className='text-center text-gray-300 text-sm py-6'>이 날의 기록이 없어요</p>
            ) : (
              <div className='space-y-2'>
                {selectedSchedules.map(s => {
                  const isExpanded = expandedScheduleId === s.id
                  return (
                    <div key={s.id} className='bg-primary-50 rounded-xl overflow-hidden'>
                      <button
                        className='w-full flex items-center gap-2 px-3 py-2.5 text-left'
                        onClick={() => setExpandedScheduleId(isExpanded ? null : s.id)}
                      >
                        <FiCalendar className='text-primary-500 flex-shrink-0 text-sm' />
                        <span className='flex-1 text-sm font-semibold text-gray-900 truncate'>{s.title}</span>
                        <FiChevronDown className={`text-primary-400 text-sm flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      {isExpanded && (
                        <div className='px-3 pb-2.5 border-t border-primary-100'>
                          {s.place_name && (
                            <p className='text-xs text-gray-400 flex items-center gap-1 mt-2'>
                              <FiMapPin className='flex-shrink-0 text-[10px]' />{s.place_name}
                            </p>
                          )}
                          {s.description && <p className='text-xs text-gray-500 mt-1'>{s.description}</p>}
                          <div className='flex items-center justify-between mt-2'>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.user_id === currentUserId ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                              {s.user_id === currentUserId ? '나' : s.nickname}
                            </span>
                            {s.user_id === currentUserId && (
                              <button onClick={() => handleDeleteSchedule(s.id)} className='p-1 text-gray-300 hover:text-red-400 transition-colors'>
                                <FiTrash2 className='text-sm' />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                {selectedDate && visitPlacesMap[selectedDate] && (
                  <div className='p-3 bg-green-50 rounded-xl'>
                    <div className='flex items-center gap-2 mb-2'>
                      <FiCheckCircle className='text-green-500 flex-shrink-0 text-sm' />
                      <p className='text-xs font-semibold text-green-700'>방문한 맛집</p>
                    </div>
                    <div className='flex flex-wrap gap-1.5'>
                      {visitPlacesMap[selectedDate].map((name, i) => (
                        <span key={i} className='text-xs bg-white text-green-700 font-medium px-2.5 py-1 rounded-full border border-green-200'>
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── 다가오는 일정 ── */}
        {upcomingSchedules.length > 0 && (
          <div>
            <h2 className='text-base font-bold text-gray-900 mb-3'>다가오는 일정</h2>
            <div className='space-y-2'>
              {upcomingSchedules.map(s => {
                const sDate = new Date(s.schedule_date.split('T')[0] + 'T12:00:00')
                const diffMs = sDate.getTime() - new Date().setHours(0, 0, 0, 0)
                const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
                const dLabel = diffDays === 0 ? '오늘' : diffDays === 1 ? '내일' : `D-${diffDays}`
                const isMe = s.user_id === currentUserId

                const isExpanded = expandedUpcomingId === s.id
                return (
                  <div key={s.id} className='bg-white rounded-xl shadow-soft overflow-hidden'>
                    <button
                      className='w-full flex items-center gap-2.5 px-3 py-2.5 text-left'
                      onClick={() => setExpandedUpcomingId(isExpanded ? null : s.id)}
                    >
                      <div className='w-8 text-center flex-shrink-0'>
                        <p className='text-[9px] text-primary-500 font-bold leading-none'>{sDate.getMonth() + 1}월</p>
                        <p className='text-base font-bold text-gray-900 leading-tight'>{sDate.getDate()}</p>
                      </div>
                      <span className='flex-1 text-sm font-semibold text-gray-900 truncate'>{s.title}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        diffDays === 0 ? 'bg-primary-500 text-white' :
                        diffDays <= 3 ? 'bg-primary-100 text-primary-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>{dLabel}</span>
                      <FiChevronDown className={`text-gray-300 text-sm flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className='px-3 pb-2.5 border-t border-gray-100'>
                        {s.place_name && (
                          <p className='text-xs text-gray-400 flex items-center gap-1 mt-2'>
                            <FiMapPin className='flex-shrink-0 text-[10px]' />{s.place_name}
                          </p>
                        )}
                        {s.description && <p className='text-xs text-gray-500 mt-1'>{s.description}</p>}
                        <div className='flex items-center justify-between mt-2'>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isMe ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
                            {isMe ? '나' : s.nickname}
                          </span>
                          {isMe && (
                            <button onClick={() => handleDeleteSchedule(s.id)} className='p-1 text-gray-300 hover:text-red-400 transition-colors'>
                              <FiTrash2 className='text-sm' />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 일정 없을 때 빈 상태 */}
        {upcomingSchedules.length === 0 && !selectedDate && (
          <div className='text-center py-12'>
            <div className='w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3'>
              <FiCalendar className='text-primary-400 text-xl' />
            </div>
            <p className='text-gray-400 text-sm mb-5'>아직 등록된 일정이 없어요</p>
            <button
              onClick={() => openAdd()}
              className='inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-semibold rounded-xl text-sm hover:bg-primary-600 transition-colors'
            >
              <FiPlus /> 첫 데이트 계획 세우기
            </button>
          </div>
        )}
      </main>

      {/* 플로팅 추가 버튼 */}
      {(upcomingSchedules.length > 0 || !!selectedDate) && (
        <button
          onClick={() => openAdd()}
          className='fixed right-4 bottom-24 w-14 h-14 bg-primary-500 text-white rounded-2xl shadow-card flex items-center justify-center hover:bg-primary-600 active:scale-95 transition-all'
          style={{ zIndex: 9998 }}
        >
          <FiPlus className='text-2xl' />
        </button>
      )}

      {/* 일정 추가 모달 */}
      {showAddModal && createPortal(
        <div
          className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-center p-4 animate-fade-in'
          style={{ zIndex: 10002 }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className='bg-white rounded-2xl w-full max-w-sm shadow-card mb-4 animate-slide-up'
            onClick={e => e.stopPropagation()}
          >
            <div className='p-6'>
              <div className='flex items-center justify-between mb-5'>
                <h2 className='text-lg font-bold text-gray-900'>일정 추가</h2>
                <button onClick={() => setShowAddModal(false)} className='p-1 text-gray-400 hover:text-gray-600'>
                  <FiX className='text-xl' />
                </button>
              </div>
              <form onSubmit={handleAddSchedule} className='space-y-3'>
                <input
                  type='text'
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder='일정 제목 (예: 스시야 데이트)'
                  required
                  className='w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary-500 text-sm'
                />
                <DatePicker value={newDate} onChange={setNewDate} placeholder='날짜 선택' />
                <input
                  type='text'
                  value={newPlaceName}
                  onChange={e => setNewPlaceName(e.target.value)}
                  placeholder='장소 이름 (선택)'
                  className='w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary-500 text-sm'
                />
                <textarea
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder='메모 (선택)'
                  rows={2}
                  className='w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary-500 text-sm resize-none'
                />
                <div className='flex gap-2 pt-1'>
                  <button
                    type='button'
                    onClick={() => setShowAddModal(false)}
                    className='flex-1 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl text-sm'
                  >
                    취소
                  </button>
                  <button
                    type='submit'
                    disabled={loading || !newTitle.trim() || !newDate}
                    className='flex-1 py-3 bg-primary-500 text-white font-semibold rounded-xl text-sm disabled:opacity-50'
                  >
                    {loading ? '저장 중...' : '저장'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default Calendar
