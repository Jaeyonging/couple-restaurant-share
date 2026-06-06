import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getFavPlaces, getRatings, getComments, submitRating, submitComment, deleteFavPlace, updateVisitDate, clearVisitDate, updateComment, getPhotos, uploadPhoto, deletePhoto } from '../../api/fetch'
import { AiFillStar, AiOutlineStar } from 'react-icons/ai'
import { useIsLogin } from '../../hooks/isLogin'
import { API_URL } from '../../types/types'
import { useToastStore } from '../../store/data'
import {
  FiTrash2, FiFilter, FiX, FiCalendar, FiMapPin, FiCheck,
  FiSend, FiChevronDown, FiStar, FiMessageSquare, FiCamera, FiPlus,
  FiEdit2, FiChevronLeft, FiChevronRight,
} from 'react-icons/fi'

interface FavPlace {
  id: number
  name: string
  address: string
  roadAddress: string
  categories: string
  thumbnails: string
  avgRating: number
  commentCount: number
  created_by: number
  visitedAt?: string
}

interface Photo {
  id: number
  photo_url: string
  created_at: string
  user_id: number
  nickname: string
}

interface Rating {
  id: number
  star: number
  user_id: number
  nickname: string
  imgUrl: string
}

interface Comment {
  id: number
  comment: string
  user_id: number
  nickname: string
  imgUrl: string
  created_at?: string
  updated_at?: string
}

type SortOrder = 'date-desc' | 'date-asc' | 'rating-desc' | 'rating-asc'
type VisitFilter = 'all' | 'visited' | 'not-visited'

// ─── 별점 컴포넌트 ───────────────────────────────────────────
const Stars = ({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' | 'lg' }) => {
  const cls = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-base'
  return (
    <div className='flex items-center gap-0.5'>
      {[1, 2, 3, 4, 5].map((s) =>
        s <= Math.round(value)
          ? <AiFillStar key={s} className={`text-yellow-400 ${cls}`} />
          : <AiOutlineStar key={s} className={`text-gray-300 ${cls}`} />
      )}
    </div>
  )
}

// ─── 장소 카드 ────────────────────────────────────────────────
const PlaceCard = ({
  place,
  onClick,
  onDelete,
  onVisit,
}: {
  place: FavPlace
  onClick: (p: FavPlace) => void
  onDelete: (p: FavPlace, e: React.MouseEvent) => void
  onVisit: (p: FavPlace, e: React.MouseEvent) => void
}) => {
  const thumbnail = place.thumbnails ? place.thumbnails.split(',')[0].trim() : null
  const thumbSrc = thumbnail
    ? (thumbnail.startsWith('http') ? thumbnail : `${API_URL}${thumbnail}`)
    : null
  const category = place.categories?.split(',')[0]?.trim()

  return (
    <div
      onClick={() => onClick(place)}
      className='bg-white rounded-2xl overflow-hidden shadow-soft cursor-pointer active:scale-[0.99] transition-transform'
    >
      {/* 썸네일 */}
      <div className='relative w-full h-40 bg-gray-100'>
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt={place.name}
            className='w-full h-full object-cover'
            onError={(e) => { (e.target as HTMLImageElement).src = '/noimg.jpeg' }}
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center'>
            <FiMapPin className='text-gray-300 text-3xl' />
          </div>
        )}
        {/* 방문 뱃지 */}
        {place.visitedAt && (
          <span className='absolute top-3 left-3 flex items-center gap-1 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full'>
            <FiCheck className='text-[10px]' /> 방문완료
          </span>
        )}
        {/* 삭제 버튼 */}
        <button
          onClick={(e) => onDelete(place, e)}
          className='absolute top-3 right-3 w-7 h-7 bg-black/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/50 transition-colors'
        >
          <FiTrash2 className='text-xs' />
        </button>
      </div>

      {/* 정보 */}
      <div className='p-4'>
        <div className='flex items-start justify-between gap-2 mb-1'>
          <h3 className='font-bold text-gray-900 text-base leading-tight truncate'>{place.name}</h3>
          {category && (
            <span className='flex-shrink-0 text-[10px] text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full font-medium'>
              {category}
            </span>
          )}
        </div>

        <p className='text-xs text-gray-400 truncate flex items-center gap-1 mb-3'>
          <FiMapPin className='flex-shrink-0' />
          {place.roadAddress || place.address}
        </p>

        {/* 평점 + 댓글 수 */}
        <div className='flex items-center gap-2 flex-wrap'>
          {place.avgRating > 0 ? (
            <div className='flex items-center gap-1'>
              <AiFillStar className='text-yellow-400 text-xs' />
              <span className='text-xs font-bold text-gray-700'>{place.avgRating.toFixed(1)}</span>
            </div>
          ) : (
            <span className='text-xs text-gray-300'>미평가</span>
          )}
          {place.commentCount > 0 && (
            <span className='flex items-center gap-0.5 text-xs text-gray-400'>
              <FiMessageSquare className='text-[10px]' /> {place.commentCount}
            </span>
          )}
          {place.visitedAt && (
            <span className='flex items-center gap-0.5 text-xs text-green-500 ml-auto'>
              <FiCheck className='text-[10px]' />
              {new Date(place.visitedAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── 상세 바텀시트 ────────────────────────────────────────────
const compressImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const MAX = 800
        let w = img.width, h = img.height
        if (w > MAX) { h = Math.round((h * MAX) / w); w = MAX }
        if (h > MAX) { w = Math.round((w * MAX) / h); h = MAX }
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.72))
      }
      img.onerror = reject
      img.src = e.target!.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const DetailSheet = ({
  place,
  ratings,
  comments,
  photos,
  myRating,
  avgRating,
  ratingCount,
  newComment,
  loading,
  currentUserId,
  onClose,
  onRating,
  onCommentChange,
  onCommentSubmit,
  onDelete,
  onVisit,
  onPhotoUpload,
  onPhotoDelete,
  onCommentEdit,
}: {
  place: FavPlace
  ratings: Rating[]
  comments: Comment[]
  photos: Photo[]
  myRating: number
  avgRating: number
  ratingCount: number
  newComment: string
  loading: boolean
  currentUserId: number | null
  onClose: () => void
  onRating: (s: number) => void
  onCommentChange: (v: string) => void
  onCommentSubmit: (e: React.FormEvent) => void
  onDelete: (p: FavPlace, e: React.MouseEvent) => void
  onVisit: (p: FavPlace, e: React.MouseEvent) => void
  onPhotoUpload: (file: File) => Promise<void>
  onPhotoDelete: (photoId: number) => Promise<void>
  onCommentEdit: (commentId: number, text: string) => Promise<void>
}) => {
  const thumbnail = place.thumbnails ? place.thumbnails.split(',')[0].trim() : null
  const thumbSrc = thumbnail
    ? (thumbnail.startsWith('http') ? thumbnail : `${API_URL}${thumbnail}`)
    : null

  const photoInputRef = useRef<HTMLInputElement>(null)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')

  const sheetRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef(0)
  const isDragging = useRef(false)
  const [dragY, setDragY] = useState(0)
  const [snapBack, setSnapBack] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY
    isDragging.current = true
    setSnapBack(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return
    const diff = e.touches[0].clientY - dragStartY.current
    if (diff > 0) setDragY(diff)
  }

  const handleTouchEnd = () => {
    isDragging.current = false
    setSnapBack(true)
    if (dragY > 100) {
      onClose()
    } else {
      setDragY(0)
    }
  }

  return createPortal(
    <>
      {/* 딤 배경 — NavBar(9999) 위로 */}
      <div
        className='fixed inset-0 bg-black/40 animate-fade-in'
        style={{ zIndex: 10000 }}
        onClick={onClose}
      />
      {/* 시트 wrapper — 항상 full-width, 내부에서 중앙 정렬 */}
      <div className='fixed bottom-0 left-0 right-0 pointer-events-none' style={{ zIndex: 10001 }}>
      <div
        ref={sheetRef}
        className='max-w-[430px] mx-auto bg-white rounded-t-3xl overflow-hidden animate-slide-up pointer-events-auto'
        style={{
          maxHeight: '90vh',
          transform: `translateY(${dragY}px)`,
          transition: snapBack ? 'transform 0.3s ease' : 'none',
        }}
      >
        {/* 드래그 핸들 + 닫기 */}
        <div
          className='flex items-center justify-between px-2 pt-3 pb-1 flex-shrink-0 cursor-grab active:cursor-grabbing select-none'
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button onClick={onClose} className='p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors'>
            <FiChevronDown className='text-xl' />
          </button>
          <div className='w-9 h-1 bg-gray-200 rounded-full' />
          <button
            onClick={(e) => { onDelete(place, e); onClose() }}
            className='p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors'
          >
            <FiTrash2 className='text-lg' />
          </button>
        </div>

        {/* 스크롤 영역 */}
        <div className='overflow-y-auto' style={{ maxHeight: 'calc(90vh - 56px)' }}>
          {/* 히어로 이미지 */}
          {thumbSrc && (
            <div className='w-full h-52 bg-gray-100'>
              <img
                src={thumbSrc}
                alt={place.name}
                className='w-full h-full object-cover'
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
          )}

          <div className='px-5 py-4 space-y-5'>
            {/* 장소 정보 */}
            <div>
              {place.categories && (
                <span className='text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full font-medium'>
                  {place.categories.split(',')[0].trim()}
                </span>
              )}
              <h2 className='text-2xl font-bold text-gray-900 mt-2 mb-1'>{place.name}</h2>
              <p className='text-sm text-gray-400 flex items-center gap-1'>
                <FiMapPin className='text-primary-400' />
                {place.roadAddress || place.address}
              </p>
            </div>

            {/* 방문 날짜 */}
            <button
              onClick={(e) => onVisit(place, e)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-colors ${
                place.visitedAt ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className='flex items-center gap-2'>
                <FiCalendar className={place.visitedAt ? 'text-green-500' : 'text-gray-400'} />
                <span className={`text-sm font-medium ${place.visitedAt ? 'text-green-700' : 'text-gray-500'}`}>
                  {place.visitedAt
                    ? `방문일 · ${new Date(place.visitedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}`
                    : '방문 날짜 등록하기'}
                </span>
              </div>
              {place.visitedAt && <FiCheck className='text-green-500' />}
            </button>

            {/* 사진 */}
            <div>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='font-bold text-gray-900'>사진 {photos.length > 0 && <span className='text-primary-500'>{photos.length}</span>}</h3>
                <button
                  onClick={() => photoInputRef.current?.click()}
                  disabled={photoLoading}
                  className='flex items-center gap-1 text-xs text-primary-500 font-semibold bg-primary-50 px-2.5 py-1.5 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50'
                >
                  {photoLoading ? '업로드 중...' : <><FiCamera className='text-xs' /> 추가</>}
                </button>
                <input
                  ref={photoInputRef}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setPhotoLoading(true)
                    try { await onPhotoUpload(file) } finally {
                      setPhotoLoading(false)
                      e.target.value = ''
                    }
                  }}
                />
              </div>
              {photos.length === 0 ? (
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className='w-full border-2 border-dashed border-gray-200 rounded-2xl py-6 flex flex-col items-center gap-2 text-gray-300 hover:border-primary-300 hover:text-primary-400 transition-colors'
                >
                  <FiPlus className='text-2xl' />
                  <span className='text-xs font-medium'>사진 추가하기</span>
                </button>
              ) : (
                <div className='flex gap-2 overflow-x-auto pb-1' style={{ scrollbarWidth: 'none' }}>
                  {photos.map(photo => {
                    const base = photo.photo_url.startsWith('http') ? photo.photo_url : `${API_URL}${photo.photo_url}`
                    const token = localStorage.getItem('token') || ''
                    const src = `${base}?token=${encodeURIComponent(token)}`
                    const isOwn = photo.user_id === currentUserId
                    return (
                      <div key={photo.id} className='relative flex-shrink-0'>
                        <img
                          src={src}
                          alt='사진'
                          className='w-24 h-24 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity'
                          onClick={() => setLightboxSrc(src)}
                          onError={(e) => { (e.target as HTMLImageElement).src = '/noimg.jpeg' }}
                        />
                        {isOwn && (
                          <button
                            onClick={() => onPhotoDelete(photo.id)}
                            className='absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors'
                          >
                            <FiX className='text-[10px]' />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 사진 라이트박스 */}
            {lightboxSrc && createPortal(
              <div
                className='fixed inset-0 bg-black/90 flex items-center justify-center'
                style={{ zIndex: 10003 }}
                onClick={() => setLightboxSrc(null)}
              >
                <img src={lightboxSrc} alt='사진 전체보기' className='max-w-full max-h-full object-contain rounded-lg' />
                <button
                  className='absolute top-4 right-4 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30'
                  onClick={() => setLightboxSrc(null)}
                >
                  <FiX className='text-xl' />
                </button>
              </div>,
              document.body
            )}

            {/* 평점 */}
            <div className='bg-gray-50 rounded-2xl p-4'>
              <div className='flex items-center justify-between mb-4'>
                <span className='font-bold text-gray-900'>평점</span>
                {ratingCount > 0 && (
                  <div className='flex items-center gap-1.5'>
                    <AiFillStar className='text-yellow-400 text-lg' />
                    <span className='font-bold text-gray-900 text-lg'>{avgRating.toFixed(1)}</span>
                    <span className='text-sm text-gray-400'>({ratingCount}명)</span>
                  </div>
                )}
              </div>

              {/* 내 평점 */}
              <div className='flex justify-center gap-3 py-2'>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => onRating(s)} className='transition-transform hover:scale-110 active:scale-95'>
                    {s <= myRating
                      ? <AiFillStar className='text-yellow-400 text-3xl' />
                      : <AiOutlineStar className='text-gray-300 text-3xl hover:text-yellow-300' />}
                  </button>
                ))}
              </div>

              {/* 다른 평점 */}
              {ratings.length > 0 && (
                <div className='mt-3 pt-3 border-t border-gray-200 space-y-2'>
                  {ratings.map((r) => (
                    <div key={r.id} className='flex items-center gap-3'>
                      <img
                        src={r.imgUrl ? (r.imgUrl.startsWith('http') ? r.imgUrl : `${API_URL}${r.imgUrl}`) : '/noimg.jpeg'}
                        alt={r.nickname}
                        className='w-7 h-7 rounded-full object-cover bg-gray-100'
                        onError={(e) => { (e.target as HTMLImageElement).src = '/noimg.jpeg' }}
                      />
                      <span className='text-sm text-gray-600 flex-1'>{r.nickname}</span>
                      <Stars value={r.star} size='sm' />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 댓글 */}
            <div>
              <h3 className='font-bold text-gray-900 mb-3'>댓글 {comments.length > 0 && <span className='text-primary-500'>{comments.length}</span>}</h3>

              {/* 입력 */}
              <form onSubmit={onCommentSubmit} className='flex gap-2 mb-4'>
                <input
                  type='text'
                  value={newComment}
                  onChange={(e) => onCommentChange(e.target.value)}
                  placeholder='댓글을 입력하세요...'
                  className='flex-1 px-4 py-2.5 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary-400 text-sm'
                />
                <button
                  type='submit'
                  disabled={!newComment.trim()}
                  className='px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
                >
                  <FiSend className='text-base' />
                </button>
              </form>

              {comments.length === 0 ? (
                <p className='text-center text-gray-300 text-sm py-6'>아직 댓글이 없어요</p>
              ) : (
                <div className='space-y-4 pb-4'>
                  {comments.map((c) => (
                    <div key={c.id} className='flex gap-3'>
                      <img
                        src={c.imgUrl ? (c.imgUrl.startsWith('http') ? c.imgUrl : `${API_URL}${c.imgUrl}`) : '/noimg.jpeg'}
                        alt={c.nickname}
                        className='w-8 h-8 rounded-full object-cover bg-gray-100 flex-shrink-0'
                        onError={(e) => { (e.target as HTMLImageElement).src = '/noimg.jpeg' }}
                      />
                      <div className='flex-1 bg-gray-50 rounded-2xl rounded-tl-none px-4 py-3'>
                        <div className='flex items-baseline gap-2 mb-1'>
                          <span className='text-sm font-semibold text-gray-900'>{c.nickname}</span>
                          {c.created_at && (
                            <span className='text-[11px] text-gray-400'>
                              {new Date(c.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                          {c.updated_at && (
                            <span className='text-[10px] text-gray-300'>(편집됨)</span>
                          )}
                          {c.user_id === currentUserId && editingCommentId !== c.id && (
                            <button
                              onClick={() => { setEditingCommentId(c.id); setEditingCommentText(c.comment) }}
                              className='ml-auto p-1 text-gray-300 hover:text-primary-400 transition-colors'
                            >
                              <FiEdit2 className='text-xs' />
                            </button>
                          )}
                        </div>
                        {editingCommentId === c.id ? (
                          <div className='flex gap-2 mt-1'>
                            <input
                              type='text'
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              className='flex-1 px-3 py-1.5 bg-white rounded-xl border border-primary-200 focus:ring-2 focus:ring-primary-400 text-sm'
                              autoFocus
                            />
                            <button
                              onClick={async () => {
                                if (!editingCommentText.trim()) return
                                await onCommentEdit(c.id, editingCommentText.trim())
                                setEditingCommentId(null)
                              }}
                              className='px-3 py-1.5 bg-primary-500 text-white rounded-xl text-xs font-semibold hover:bg-primary-600'
                            >저장</button>
                            <button
                              onClick={() => setEditingCommentId(null)}
                              className='px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-xs font-semibold'
                            >취소</button>
                          </div>
                        ) : (
                          <p className='text-sm text-gray-600'>{c.comment}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </>,
    document.body
  )
}

// ─── 공통 모달 (컴포넌트 외부에 정의 — 내부 정의 시 매 렌더마다 언마운트/리마운트됨) ──
const ReviewModal = ({ show, onClose, children }: { show: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!show) return null
  return createPortal(
    <div
      className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-center p-4 animate-fade-in'
      style={{ zIndex: 10002 }}
      onClick={onClose}
    >
      <div className='bg-white rounded-2xl w-full max-w-sm shadow-card animate-slide-up mb-4' onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  )
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────
const Review = () => {
  const isLogin = useIsLogin()
  const { addToast } = useToastStore()

  const [favPlaces, setFavPlaces] = useState<FavPlace[]>([])
  const [selectedPlace, setSelectedPlace] = useState<FavPlace | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [myRating, setMyRating] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [avgRating, setAvgRating] = useState(0)
  const [ratingCount, setRatingCount] = useState(0)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [totalAvgRating, setTotalAvgRating] = useState(0)
  const [totalRatingCount, setTotalRatingCount] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc')
  const [visitFilter, setVisitFilter] = useState<VisitFilter>('all')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showVisitModal, setShowVisitModal] = useState(false)
  const [visitDate, setVisitDate] = useState('')
  const [visitCalDate, setVisitCalDate] = useState(new Date())
  const [placeToDelete, setPlaceToDelete] = useState<FavPlace | null>(null)
  const [visitTarget, setVisitTarget] = useState<FavPlace | null>(null)

  useEffect(() => {
    if (isLogin) {
      loadFavPlaces()
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const info = JSON.parse(atob(token.split('.')[1]))
          setCurrentUserId(info.id)
        }
      } catch {}
    }
  }, [isLogin])
  const filteredPlaces = useMemo(() => {
    let f = [...favPlaces]
    if (selectedCategory !== 'all') {
      f = f.filter(p => p.categories?.split(',').some(c => c.trim() === selectedCategory))
    }
    if (visitFilter === 'visited') f = f.filter(p => p.visitedAt)
    if (visitFilter === 'not-visited') f = f.filter(p => !p.visitedAt)
    f.sort((a, b) => {
      if (sortOrder === 'date-asc') return a.id - b.id
      if (sortOrder === 'rating-desc') return (b.avgRating || 0) - (a.avgRating || 0)
      if (sortOrder === 'rating-asc') return (a.avgRating || 0) - (b.avgRating || 0)
      return b.id - a.id
    })
    return f
  }, [favPlaces, selectedCategory, sortOrder, visitFilter])

  const loadFavPlaces = async () => {
    try {
      const res = await getFavPlaces()
      setFavPlaces(res.favPlaces || [])
      setTotalAvgRating(res.totalAvgRating || 0)
      setTotalRatingCount(res.totalRatingCount || 0)
    } catch { /* silent */ }
  }

  const getAllCategories = () => {
    const s = new Set<string>()
    favPlaces.forEach(p => p.categories?.split(',').forEach(c => { const t = c.trim(); if (t) s.add(t) }))
    return Array.from(s).sort()
  }

  const handlePlaceClick = async (place: FavPlace) => {
    setSelectedPlace(place)
    setLoading(true)
    setPhotos([])
    try {
      const [rRes, cRes, pRes] = await Promise.all([getRatings(place.id), getComments(place.id), getPhotos(place.id)])
      setRatings(rRes.ratings || [])
      setComments(cRes.comments || [])
      setPhotos(pRes.photos || [])
      setAvgRating(rRes.avgRating || 0)
      setRatingCount(rRes.ratingCount || 0)
      const token = localStorage.getItem('token')
      if (token) {
        const info = JSON.parse(atob(token.split('.')[1]))
        setMyRating(rRes.ratings?.find((r: Rating) => r.user_id === info.id)?.star || 0)
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  const handlePhotoUpload = async (file: File) => {
    if (!selectedPlace) return
    try {
      const base64 = await compressImage(file)
      await uploadPhoto(selectedPlace.id, base64)
      const pRes = await getPhotos(selectedPlace.id)
      setPhotos(pRes.photos || [])
      addToast('success', '사진이 추가되었습니다!')
    } catch {
      addToast('error', '사진 업로드에 실패했습니다.')
    }
  }

  const handlePhotoDelete = async (photoId: number) => {
    if (!selectedPlace) return
    try {
      await deletePhoto(photoId)
      setPhotos(prev => prev.filter(p => p.id !== photoId))
      addToast('success', '사진이 삭제되었습니다.')
    } catch {
      addToast('error', '삭제에 실패했습니다.')
    }
  }

  const handleRatingClick = async (star: number) => {
    if (!selectedPlace) return
    try {
      await submitRating(selectedPlace.id, star)
      setMyRating(star)
      const res = await getRatings(selectedPlace.id)
      setRatings(res.ratings || [])
      setAvgRating(res.avgRating || 0)
      setRatingCount(res.ratingCount || 0)
      loadFavPlaces()
    } catch { /* silent */ }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlace || !newComment.trim()) return
    try {
      await submitComment(selectedPlace.id, newComment.trim())
      setNewComment('')
      const res = await getComments(selectedPlace.id)
      setComments(res.comments || [])
    } catch { /* silent */ }
  }

  const handleCommentEdit = async (commentId: number, text: string) => {
    if (!selectedPlace) return
    try {
      await updateComment(commentId, text)
      const res = await getComments(selectedPlace.id)
      setComments(res.comments || [])
      addToast('success', '댓글이 수정되었습니다.')
    } catch {
      addToast('error', '댓글 수정에 실패했습니다.')
    }
  }

  const handleVisitClear = async () => {
    if (!visitTarget) return
    try {
      await clearVisitDate(visitTarget.id)
      setShowVisitModal(false)
      setVisitDate('')
      await loadFavPlaces()
      if (selectedPlace?.id === visitTarget.id) {
        setSelectedPlace(prev => prev ? { ...prev, visitedAt: undefined } : null)
      }
      addToast('success', '방문 기록이 취소되었습니다.')
    } catch {
      addToast('error', '방문 취소에 실패했습니다.')
    }
  }

  const handleDeleteClick = (place: FavPlace, e: React.MouseEvent) => {
    e.stopPropagation()
    setPlaceToDelete(place)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!placeToDelete) return
    try {
      await deleteFavPlace(placeToDelete.id)
      setShowDeleteModal(false)
      setPlaceToDelete(null)
      if (selectedPlace?.id === placeToDelete.id) setSelectedPlace(null)
      addToast('success', '삭제되었습니다.')
      loadFavPlaces()
    } catch { addToast('error', '삭제에 실패했습니다.') }
  }

  const handleVisitDateClick = (place: FavPlace, e: React.MouseEvent) => {
    e.stopPropagation()
    setVisitTarget(place)
    setVisitDate(place.visitedAt ? place.visitedAt.split('T')[0] : '')
    const base = place.visitedAt ? new Date(place.visitedAt.split('T')[0] + 'T12:00:00') : new Date()
    setVisitCalDate(new Date(base.getFullYear(), base.getMonth(), 1))
    setShowVisitModal(true)
  }

  const handleVisitDateSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!visitTarget || !visitDate) return
    try {
      await updateVisitDate(visitTarget.id, visitDate)
      setShowVisitModal(false)
      setVisitDate('')
      await loadFavPlaces()
      if (selectedPlace?.id === visitTarget.id) {
        setSelectedPlace(prev => prev ? { ...prev, visitedAt: visitDate } : null)
      }
      addToast('success', '방문 날짜가 저장되었습니다.')
    } catch { addToast('error', '저장에 실패했습니다.') }
  }


  if (!isLogin) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <p className='text-gray-400 text-sm'>로그인이 필요합니다.</p>
      </div>
    )
  }

  const categories = getAllCategories()
  const visitedCount = favPlaces.filter(p => p.visitedAt).length
  const activeFilters = (visitFilter !== 'all' ? 1 : 0) + (sortOrder !== 'date-desc' ? 1 : 0)

  return (
    <div className='min-h-screen bg-gray-50 pb-28'>
      {/* ── 헤더 ── */}
      <header className='bg-white sticky top-0 z-40 border-b border-gray-100'>
        <div className='max-w-2xl mx-auto px-4 pt-4 pb-0'>
          <div className='flex items-center justify-between mb-3'>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>맛집 리스트</h1>
              {totalRatingCount > 0 && (
                <p className='text-xs text-gray-400 mt-0.5'>
                  평균 <span className='font-semibold text-yellow-500'>★ {totalAvgRating.toFixed(1)}</span>
                </p>
              )}
            </div>
            <button
              onClick={() => setShowFilterModal(true)}
              className={`relative p-2.5 rounded-xl transition-colors ${
                activeFilters > 0 ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <FiFilter className='text-lg' />
              {activeFilters > 0 && (
                <span className='absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold'>
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          {/* 통계 칩 */}
          <div className='flex gap-2 pb-3'>
            <div className='flex items-center gap-1.5 bg-gray-50 rounded-full px-3 py-1.5'>
              <span className='text-xs text-gray-500'>전체</span>
              <span className='text-sm font-bold text-gray-900'>{favPlaces.length}</span>
            </div>
            <div className='flex items-center gap-1.5 bg-green-50 rounded-full px-3 py-1.5'>
              <FiCheck className='text-green-500 text-xs' />
              <span className='text-sm font-bold text-green-600'>{visitedCount}곳 방문</span>
            </div>
            {totalAvgRating > 0 && (
              <div className='flex items-center gap-1.5 bg-yellow-50 rounded-full px-3 py-1.5'>
                <AiFillStar className='text-yellow-500 text-xs' />
                <span className='text-sm font-bold text-yellow-600'>{totalAvgRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* 카테고리 탭 */}
          {categories.length > 0 && (
            <div
              className='flex gap-2 pb-3 overflow-x-auto'
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {['all', ...categories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {cat === 'all' ? '전체' : cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ── 카드 목록 ── */}
      <div className='max-w-2xl mx-auto px-4 pt-4'>
        {filteredPlaces.length === 0 ? (
          <div className='text-center py-20'>
            <p className='text-gray-300 text-4xl mb-4'>🍽️</p>
            <p className='text-gray-400 text-sm'>
              {favPlaces.length === 0 ? '지도에서 맛집을 저장해보세요!' : '조건에 맞는 맛집이 없어요'}
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-3'>
            {filteredPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onClick={handlePlaceClick}
                onDelete={handleDeleteClick}
                onVisit={handleVisitDateClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── 상세 바텀시트 ── */}
      {selectedPlace && (
        <DetailSheet
          place={selectedPlace}
          ratings={ratings}
          comments={comments}
          photos={photos}
          myRating={myRating}
          avgRating={avgRating}
          ratingCount={ratingCount}
          newComment={newComment}
          loading={loading}
          currentUserId={currentUserId}
          onClose={() => setSelectedPlace(null)}
          onRating={handleRatingClick}
          onCommentChange={setNewComment}
          onCommentSubmit={handleCommentSubmit}
          onDelete={handleDeleteClick}
          onVisit={handleVisitDateClick}
          onPhotoUpload={handlePhotoUpload}
          onPhotoDelete={handlePhotoDelete}
          onCommentEdit={handleCommentEdit}
        />
      )}

      {/* ── 방문 날짜 모달 ── */}
      <ReviewModal show={showVisitModal} onClose={() => { setShowVisitModal(false); setVisitDate('') }}>
        <div className='p-4'>
          <h2 className='text-base font-bold text-gray-900 mb-3'>방문 날짜</h2>
          {/* 인라인 미니 달력 */}
          {(() => {
            const _now = new Date()
            const todayStr = `${_now.getFullYear()}-${String(_now.getMonth()+1).padStart(2,'0')}-${String(_now.getDate()).padStart(2,'0')}`
            const cy = visitCalDate.getFullYear(), cm = visitCalDate.getMonth()
            const daysInMonth = new Date(cy, cm + 1, 0).getDate()
            const firstDay = new Date(cy, cm, 1).getDay()
            const cells: (number | null)[] = []
            for (let i = 0; i < firstDay; i++) cells.push(null)
            for (let d = 1; d <= daysInMonth; d++) cells.push(d)
            while (cells.length % 7 !== 0) cells.push(null)
            const DAYS = ['일','월','화','수','목','금','토']
            return (
              <>
                <div className='flex items-center justify-between mb-2'>
                  <button onClick={() => setVisitCalDate(new Date(cy, cm-1, 1))} className='p-1.5 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-primary-50'>
                    <FiChevronLeft />
                  </button>
                  <span className='text-sm font-bold text-gray-900'>{cy}년 {cm+1}월</span>
                  <button
                    onClick={() => setVisitCalDate(new Date(cy, cm+1, 1))}
                    disabled={cy > _now.getFullYear() || (cy === _now.getFullYear() && cm >= _now.getMonth())}
                    className='p-1.5 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-primary-50 disabled:opacity-30 disabled:cursor-not-allowed'
                  >
                    <FiChevronRight />
                  </button>
                </div>
                <div className='grid grid-cols-7 mb-1'>
                  {DAYS.map((d,i) => (
                    <div key={d} className={`text-center text-[10px] font-semibold py-0.5 ${i===0?'text-red-400':i===6?'text-blue-400':'text-gray-400'}`}>{d}</div>
                  ))}
                </div>
                <div className='grid grid-cols-7 gap-y-0.5'>
                  {cells.map((day, idx) => {
                    if (!day) return <div key={`e-${idx}`} />
                    const dateStr = `${cy}-${String(cm+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
                    const isFuture = dateStr > todayStr
                    const isSelected = dateStr === visitDate
                    const isToday = dateStr === todayStr
                    const dow = (firstDay + day - 1) % 7
                    return (
                      <button
                        key={day}
                        disabled={isFuture}
                        onClick={() => setVisitDate(dateStr)}
                        className={`py-1.5 rounded-xl text-xs font-medium transition-all disabled:opacity-25 disabled:cursor-not-allowed ${
                          isSelected ? 'bg-primary-500 text-white' :
                          isToday ? 'bg-primary-50 text-primary-600 font-bold' :
                          dow===0 ? 'text-red-400 hover:bg-gray-50' :
                          dow===6 ? 'text-blue-400 hover:bg-gray-50' :
                          'text-gray-700 hover:bg-gray-50'
                        }`}
                      >{day}</button>
                    )
                  })}
                </div>
                {visitDate && (
                  <p className='text-center text-xs text-primary-500 font-medium mt-2'>
                    {new Date(visitDate + 'T12:00:00').toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' })} 선택됨
                  </p>
                )}
              </>
            )
          })()}
          <div className='flex gap-2 mt-3'>
            <button onClick={() => { setShowVisitModal(false); setVisitDate('') }} className='flex-1 py-2.5 bg-gray-100 text-gray-600 font-medium rounded-xl text-sm'>닫기</button>
            {visitTarget?.visitedAt && (
              <button onClick={handleVisitClear} className='py-2.5 px-3 bg-red-50 text-red-500 font-medium rounded-xl text-sm'>방문 취소</button>
            )}
            <button
              onClick={() => handleVisitDateSubmit()}
              disabled={!visitDate}
              className='flex-1 py-2.5 bg-primary-500 text-white font-medium rounded-xl text-sm disabled:opacity-40'
            >저장</button>
          </div>
        </div>
      </ReviewModal>

      {/* ── 삭제 모달 ── */}
      <ReviewModal show={showDeleteModal} onClose={() => { setShowDeleteModal(false); setPlaceToDelete(null) }}>
        <div className='p-6 text-center'>
          <div className='w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4'>
            <FiTrash2 className='text-red-500 text-xl' />
          </div>
          <h2 className='text-lg font-bold text-gray-900 mb-1'>맛집 삭제</h2>
          <p className='text-sm text-gray-400 mb-6'>"{placeToDelete?.name}"를 삭제할까요?</p>
          <div className='flex gap-2'>
            <button onClick={() => { setShowDeleteModal(false); setPlaceToDelete(null) }} className='flex-1 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl'>취소</button>
            <button onClick={handleDeleteConfirm} className='flex-1 py-3 bg-red-500 text-white font-medium rounded-xl'>삭제</button>
          </div>
        </div>
      </ReviewModal>

      {/* ── 필터 모달 ── */}
      <ReviewModal show={showFilterModal} onClose={() => setShowFilterModal(false)}>
        <div className='p-6'>
          <div className='flex items-center justify-between mb-5'>
            <h2 className='text-lg font-bold text-gray-900'>정렬 / 필터</h2>
            <button onClick={() => setShowFilterModal(false)} className='p-1 text-gray-400 hover:text-gray-600'>
              <FiX className='text-xl' />
            </button>
          </div>
          <div className='space-y-4'>
            <div>
              <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>방문 여부</label>
              <div className='flex gap-2'>
                {(['all', 'visited', 'not-visited'] as VisitFilter[]).map((v) => (
                  <button key={v} onClick={() => setVisitFilter(v)}
                    className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${
                      visitFilter === v ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {v === 'all' ? '전체' : v === 'visited' ? '방문' : '미방문'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>정렬</label>
              <div className='grid grid-cols-2 gap-2'>
                {([['date-desc', '최신순'], ['date-asc', '오래된순'], ['rating-desc', '평점 높은순'], ['rating-asc', '평점 낮은순']] as [SortOrder, string][]).map(([val, label]) => (
                  <button key={val} onClick={() => setSortOrder(val)}
                    className={`py-2 text-sm font-medium rounded-xl transition-colors ${
                      sortOrder === val ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className='flex gap-2 mt-6'>
            <button
              onClick={() => { setVisitFilter('all'); setSortOrder('date-desc') }}
              className='flex-1 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl'
            >
              초기화
            </button>
            <button onClick={() => setShowFilterModal(false)} className='flex-1 py-3 bg-primary-500 text-white font-medium rounded-xl'>
              적용
            </button>
          </div>
        </div>
      </ReviewModal>
    </div>
  )
}

export default Review
