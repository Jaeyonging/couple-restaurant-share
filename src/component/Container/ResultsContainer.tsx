import React, { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useFetchDataStore, useMapStore } from '../../store/data'
import SearchResultCard from '../Card/SearchResultCard/SearchResultCard'
import { fetchPlaceSearch, fetchPlaceThumbnail } from '../../api/fetch'
import { FiX, FiChevronUp, FiSearch, FiList } from 'react-icons/fi'

const MIN_HEIGHT = 25
const MAX_HEIGHT = 92

const Skeleton = () => (
    <div className='bg-white rounded-xl p-3 border border-gray-100'>
        <div className='flex gap-3'>
            <div className='w-16 h-16 rounded-lg bg-gray-100 animate-pulse flex-shrink-0' />
            <div className='flex-1 space-y-2 py-1'>
                <div className='h-3 bg-gray-100 rounded animate-pulse w-3/4' />
                <div className='h-3 bg-gray-100 rounded animate-pulse w-1/2' />
                <div className='h-3 bg-gray-100 rounded animate-pulse w-1/4' />
            </div>
        </div>
    </div>
)

const ResultsContainer = () => {
    const { data } = useFetchDataStore()
    const { search: keyword, myLat, myLng } = useMapStore()
    const [isVisible, setIsVisible] = useState(false)
    const [sheetHeight, setSheetHeight] = useState(50)

    const [allItems, setAllItems] = useState<any[]>([])
    const [enrichedItems, setEnrichedItems] = useState<any[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const enrichedUpToRef = useRef(0)

    const dragStateRef = useRef({ startY: 0, startHeight: 50, dragging: false })
    const listRef = useRef<HTMLDivElement>(null)

    // 새 검색 결과 도착 시 리셋
    useEffect(() => {
        if (!data) return
        setAllItems(data.items ?? [])
        setEnrichedItems([])
        enrichedUpToRef.current = 0
        setCurrentPage(1)
        setHasMore(data.hasMore ?? false)
        setIsVisible(true)
        setSheetHeight(50)
    }, [data])

    // allItems 늘어날 때마다 새 배치 썸네일 로드
    useEffect(() => {
        const start = enrichedUpToRef.current
        const end = allItems.length
        if (start >= end) return

        enrichedUpToRef.current = end

        Promise.all(
            allItems.slice(start, end).map(async (item: any) => {
                if (item.thumbnail) return item
                const cleanTitle = item.title.replace(/<[^>]*>/g, '')
                const addressHint = (item.roadAddress || item.address || '')
                    .split(' ').slice(0, 3).join(' ')
                const thumbnail = await fetchPlaceThumbnail(cleanTitle, addressHint)
                return { ...item, thumbnail }
            })
        ).then(newItems => {
            setEnrichedItems(prev => [...prev, ...newItems])
        })
    }, [allItems])

    // 다음 페이지 로드
    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore || !keyword) return
        setLoadingMore(true)
        try {
            const loc = (myLat != null && myLng != null) ? { lat: myLat, lng: myLng } : null
            const res = await fetchPlaceSearch(keyword, currentPage + 1, loc)
            if (res.items?.length > 0) {
                setAllItems(prev => [...prev, ...res.items])
                setCurrentPage(p => p + 1)
                setHasMore(res.hasMore ?? false)
            } else {
                setHasMore(false)
            }
        } catch {
            setHasMore(false)
        } finally {
            setLoadingMore(false)
        }
    }, [loadingMore, hasMore, keyword, currentPage, myLat, myLng])

    // 스크롤 하단 감지
    useEffect(() => {
        const el = listRef.current
        if (!el) return
        const onScroll = () => {
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
                loadMore()
            }
        }
        el.addEventListener('scroll', onScroll, { passive: true })
        return () => el.removeEventListener('scroll', onScroll)
    }, [loadMore])

    // 드래그로 시트 높이 조절
    useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => {
            if (!dragStateRef.current.dragging) return
            const delta = e.clientY - dragStateRef.current.startY
            const deltaPercent = (delta / window.innerHeight) * 100
            const next = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, dragStateRef.current.startHeight - deltaPercent))
            setSheetHeight(next)
        }
        const handlePointerUp = () => { dragStateRef.current.dragging = false }
        window.addEventListener('pointermove', handlePointerMove)
        window.addEventListener('pointerup', handlePointerUp)
        return () => {
            window.removeEventListener('pointermove', handlePointerMove)
            window.removeEventListener('pointerup', handlePointerUp)
        }
    }, [])

    const startDrag = (e: React.PointerEvent) => {
        dragStateRef.current = { startY: e.clientY, startHeight: sheetHeight, dragging: true }
    }

    const toggleExpand = () => {
        setSheetHeight(prev => prev > 60 ? 50 : MAX_HEIGHT)
    }

    if (!data) return null

    // 시트를 닫은 상태 — 네비바 위에 "검색결과 보기" 알약 표시
    if (!isVisible) {
        return createPortal(
            <div className='fixed left-0 right-0 pointer-events-none' style={{ bottom: 'calc(env(safe-area-inset-bottom) + 88px)', zIndex: 10000 }}>
                <div className='max-w-[430px] mx-auto flex justify-center'>
                    <button
                        onClick={() => setIsVisible(true)}
                        className='pointer-events-auto flex items-center gap-2 bg-primary-500 text-white text-sm font-semibold pl-4 pr-5 py-2.5 rounded-full shadow-lg active:scale-95 transition-all'
                    >
                        <FiList className='text-base' />
                        검색결과 보기
                    </button>
                </div>
            </div>,
            document.body
        )
    }

    const skeletonCount = Math.max(0, allItems.length - enrichedItems.length)

    return createPortal(
        <div className='fixed bottom-0 left-0 right-0 pointer-events-none' style={{ zIndex: 9999 }}>
        <div
            className='max-w-[430px] mx-auto bg-white rounded-t-3xl overflow-hidden animate-slide-up pointer-events-auto'
            style={{ height: `${sheetHeight}vh`, boxShadow: '0 -4px 30px rgba(0,0,0,0.15)' }}
        >
            <div className='flex flex-col h-full'>
                {/* 핸들 */}
                <div
                    className='flex items-center px-2 pt-3 pb-1 select-none flex-shrink-0'
                    onPointerDown={startDrag}
                    style={{ touchAction: 'none', cursor: 'ns-resize' }}
                >
                    <button
                        onPointerDown={e => e.stopPropagation()}
                        onClick={() => setIsVisible(false)}
                        className='p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors'
                    >
                        <FiX className='text-xl' />
                    </button>
                    <div className='flex-1 flex justify-center'>
                        <div className='w-9 h-1 bg-gray-200 rounded-full' />
                    </div>
                    <button
                        onPointerDown={e => e.stopPropagation()}
                        onClick={toggleExpand}
                        className='p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors'
                    >
                        <FiChevronUp className={`text-xl transition-transform duration-200 ${sheetHeight > 60 ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* 목록 */}
                <div ref={listRef} className='flex-1 overflow-y-auto px-3 pb-6 space-y-2'>
                    {allItems.length === 0 && (
                        <div className='flex flex-col items-center justify-center py-16 text-center'>
                            <div className='w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                                <FiSearch className='text-gray-300 text-2xl' />
                            </div>
                            <p className='text-sm font-medium text-gray-500'>검색 결과가 없어요</p>
                            <p className='text-xs text-gray-400 mt-1'>다른 키워드로 검색해보세요</p>
                        </div>
                    )}
                    {enrichedItems.map((item: any, index: number) => (
                        <SearchResultCard data={item} key={index} />
                    ))}

                    {skeletonCount > 0 && Array.from({ length: skeletonCount }).map((_, i) => (
                        <Skeleton key={`sk-${i}`} />
                    ))}

                    {loadingMore && (
                        <div className='flex justify-center py-4'>
                            <div className='w-5 h-5 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin' />
                        </div>
                    )}

                    {!hasMore && enrichedItems.length > 0 && (
                        <p className='text-center text-xs text-gray-300 py-2'>검색 결과를 모두 불러왔어요</p>
                    )}
                </div>
            </div>
        </div>
        </div>,
        document.body
    )
}

export default ResultsContainer
