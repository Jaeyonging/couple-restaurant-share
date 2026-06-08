import React, { useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

const pad = (n: number) => String(n).padStart(2, '0')
const fmt = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`

interface DatePickerProps {
  value: string // 'YYYY-MM-DD' 또는 ''
  onChange: (value: string) => void
  placeholder?: string
}

// 앱 디자인에 맞춘 커스텀 달력 (브라우저 기본 type=date 대체)
const DatePicker = ({ value, onChange, placeholder = '날짜 선택' }: DatePickerProps) => {
  const [open, setOpen] = useState(false)
  const [pickingYear, setPickingYear] = useState(false)

  // value는 'YYYY-MM-DD' 또는 DB가 돌려주는 ISO 전체(2024-12-24T15:00:00.000Z) 둘 다 올 수 있음
  const parseValue = (v: string): Date | null => {
    if (!v) return null
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(v + 'T12:00:00') // 날짜만 → 로컬 정오
    const d = new Date(v)
    return isNaN(d.getTime()) ? null : d
  }
  const parsed = parseValue(value)
  const selected = parsed ? fmt(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()) : ''

  const base = parsed || new Date()
  const [view, setView] = useState(new Date(base.getFullYear(), base.getMonth(), 1))

  const year = view.getFullYear()
  const month = view.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const now = new Date()
  const today = fmt(now.getFullYear(), now.getMonth(), now.getDate())

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const label = parsed
    ? parsed.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
    : placeholder

  const selectDay = (day: number) => {
    onChange(fmt(year, month, day))
    setOpen(false)
  }

  const selectYear = (y: number) => {
    setView(new Date(y, month, 1))
    setPickingYear(false)
  }

  // 연도 선택 그리드: 현재 연도 기준 ±60년 범위에서 12개씩
  const [yearPageStart, setYearPageStart] = useState(year - 6)
  const yearGrid = Array.from({ length: 12 }, (_, i) => yearPageStart + i)

  const toggle = () => {
    setOpen(o => {
      if (o) setPickingYear(false)
      else setYearPageStart(year - 6)
      return !o
    })
  }

  return (
    <div className='relative'>
      <button
        type='button'
        onClick={toggle}
        className='w-full px-4 py-3 bg-gray-50 rounded-xl flex items-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow'
      >
        <FiCalendar className='text-primary-500 flex-shrink-0' />
        <span className={value ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
      </button>

      {open && (
        <div className='mt-2 bg-white rounded-xl border border-gray-100 shadow-soft overflow-hidden'>
          {/* 헤더: 좌우 화살표 + 가운데 년/월 (누르면 연도 선택) */}
          <div className='flex items-center justify-between px-3 py-2.5'>
            <button
              type='button'
              onClick={() => pickingYear ? setYearPageStart(s => s - 12) : setView(new Date(year, month - 1, 1))}
              className='p-1.5 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-primary-50 transition-colors'
            >
              <FiChevronLeft />
            </button>
            <button
              type='button'
              onClick={() => setPickingYear(p => !p)}
              className='text-sm font-bold text-gray-900 px-3 py-1 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors'
            >
              {pickingYear ? `${yearGrid[0]} ~ ${yearGrid[yearGrid.length - 1]}` : `${year}년 ${MONTHS[month]}`}
            </button>
            <button
              type='button'
              onClick={() => pickingYear ? setYearPageStart(s => s + 12) : setView(new Date(year, month + 1, 1))}
              className='p-1.5 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-primary-50 transition-colors'
            >
              <FiChevronRight />
            </button>
          </div>

          {pickingYear ? (
            /* 연도 선택 그리드 */
            <div className='grid grid-cols-3 px-2 pb-3 gap-1.5'>
              {yearGrid.map(y => {
                const isSelectedYear = y === year
                const isThisYear = y === now.getFullYear()
                return (
                  <button
                    key={y}
                    type='button'
                    onClick={() => selectYear(y)}
                    className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isSelectedYear ? 'bg-primary-500 text-white' :
                      isThisYear ? 'bg-primary-50 text-primary-600 font-bold' :
                      'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                    }`}
                  >
                    {y}
                  </button>
                )
              })}
            </div>
          ) : (
            <>
              {/* 요일 헤더 */}
              <div className='grid grid-cols-7 px-2'>
                {DAYS.map((d, i) => (
                  <div key={d} className={`text-center text-[11px] font-semibold py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
                    {d}
                  </div>
                ))}
              </div>

              {/* 날짜 셀 */}
              <div className='grid grid-cols-7 px-2 pb-3 gap-y-0.5'>
                {cells.map((day, idx) => {
                  if (!day) return <div key={`e-${idx}`} />
                  const dateStr = fmt(year, month, day)
                  const isToday = dateStr === today
                  const isSelected = dateStr === selected
                  const dayOfWeek = (firstDayOfMonth + day - 1) % 7
                  return (
                    <button
                      key={day}
                      type='button'
                      onClick={() => selectDay(day)}
                      className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-all ${
                        isSelected ? 'bg-primary-500' : isToday ? 'bg-primary-50' : 'hover:bg-gray-50 active:bg-gray-100'
                      }`}
                    >
                      <span className={`font-medium ${
                        isSelected ? 'text-white' :
                        isToday ? 'text-primary-600 font-bold' :
                        dayOfWeek === 0 ? 'text-red-400' :
                        dayOfWeek === 6 ? 'text-blue-400' :
                        'text-gray-700'
                      }`}>
                        {day}
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default DatePicker
