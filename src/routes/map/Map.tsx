import React, { useState } from 'react'
import { useQuery } from 'react-query';
import { FiNavigation, FiX } from 'react-icons/fi';
import { KakaoMap } from '../../component/KakaoMap';
import ApiErrorBoundary from '../../boundary/ApiErrorBoundary';
import { SearchFetcher } from '../../api/fetchHooks';
import SearchInput from '../../component/SearchInput';
import ResultsContainer from '../../component/Container/ResultsContainer';
import { useMapStore, useToastStore } from '../../store/data';
import { getFavPlaces } from '../../api/fetch';

const QUICK_CHIPS = ['주변 맛집', '카페', '한식', '일식', '치킨', '술집']

const parseFavMarkers = (favPlaces: any[]): { mapx: number; mapy: number; name: string; visited: boolean }[] => {
    const result: { mapx: number; mapy: number; name: string; visited: boolean }[] = [];
    for (const fp of favPlaces) {
        if (!fp.locations) continue;
        const parts = fp.locations.split(',');
        const mapx = Number(parts[0]);
        const mapy = Number(parts[1]);
        if (mapx && mapy) result.push({ mapx, mapy, name: fp.name, visited: !!fp.visitedAt });
    }
    return result;
};

const Map = () => {
    const { search, longtitude, latitude, myLat, myLng, setSearch, setMyLocation } = useMapStore();
    const { addToast } = useToastStore();
    const [locating, setLocating] = useState(false);
    const locationActive = myLat != null && myLng != null;

    const { data: favData } = useQuery('favPlaces', getFavPlaces, {
        staleTime: 1000 * 60 * 5,
    });
    const favMarkers = parseFavMarkers(favData?.favPlaces ?? []);

    const handleMyLocation = () => {
        // 이미 켜져 있으면 끄기 → 일반(지역) 검색으로 복귀
        if (locationActive) {
            setMyLocation(null, null);
            addToast('info', '내 주변 검색을 껐어요. 이제 지역으로 검색할 수 있어요.');
            return;
        }
        if (!navigator.geolocation) {
            addToast('error', '이 기기는 위치 기능을 지원하지 않아요.');
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                // 위치만 설정 (지도 이동 + 마커). 검색은 사용자가 직접 — 강제 '맛집' 검색 안 함
                setMyLocation(pos.coords.latitude, pos.coords.longitude);
                setLocating(false);
            },
            () => {
                addToast('error', '위치 권한이 필요해요. 브라우저 설정에서 허용해주세요.');
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <div className='flex flex-col w-full bg-white' style={{ height: 'calc(100svh - 50px)' }}>
            {/* Search Header */}
            <div className='bg-white border-b border-gray-100 px-4 pt-3 pb-2 flex-shrink-0'>
                <SearchInput search={search} setSearch={setSearch} />

                {/* Quick chips */}
                <div
                    className='flex gap-2 mt-2 overflow-x-auto pb-1'
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {QUICK_CHIPS.map((chip) => (
                        <button
                            key={chip}
                            onClick={() => setSearch(chip)}
                            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                                search === chip
                                    ? 'bg-primary-500 text-white border-primary-500'
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-primary-300 hover:text-primary-500'
                            }`}
                        >
                            {chip}
                        </button>
                    ))}
                </div>
            </div>

            {/* Map Area */}
            <div className='flex-1 relative overflow-hidden'>
                <KakaoMap
                    longtitude={longtitude}
                    latitude={latitude}
                    favMarkers={favMarkers}
                />

                {/* 내 위치 버튼 (토글) */}
                <button
                    onClick={handleMyLocation}
                    disabled={locating}
                    aria-label={locationActive ? '내 주변 검색 끄기' : '내 위치'}
                    className={`absolute right-4 top-4 z-[5] w-11 h-11 rounded-full shadow-soft flex items-center justify-center active:scale-95 transition-all disabled:opacity-60 ${
                        locationActive
                            ? 'bg-primary-500 text-white hover:bg-primary-600'
                            : 'bg-white text-primary-500 hover:bg-primary-50'
                    }`}
                >
                    {locating
                        ? <span className='w-4 h-4 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin' />
                        : <FiNavigation className='text-lg' />}
                </button>

                {/* 내 주변 검색 중 안내 (탭하면 끄고 지역 검색으로 복귀) */}
                {locationActive && (
                    <button
                        onClick={handleMyLocation}
                        className='absolute left-1/2 -translate-x-1/2 top-4 z-[5] flex items-center gap-1.5 bg-primary-500 text-white text-xs font-medium pl-3 pr-2.5 py-2 rounded-full shadow-soft active:scale-95 transition-all whitespace-nowrap'
                    >
                        내 주변 검색 중
                        <FiX className='text-sm' />
                    </button>
                )}

                {/* 검색 결과 바텀시트 */}
                <ApiErrorBoundary>
                    <SearchFetcher keyword={search}>
                        <ResultsContainer />
                    </SearchFetcher>
                </ApiErrorBoundary>

                {/* 빈 상태 안내 */}
                {!search && (
                    <div className='absolute bottom-6 inset-x-0 flex justify-center pointer-events-none'>
                        <div className='bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-2xl shadow-soft text-center'>
                            <p className='text-xs text-gray-500 mb-1.5'>키워드를 검색하거나 빠른 검색 버튼을 눌러보세요</p>
                            {favMarkers.length > 0 && (
                                <div className='flex items-center justify-center gap-4 text-xs text-gray-400'>
                                    <span className='flex items-center gap-1'>
                                        <span style={{ display:'inline-block', width:10, height:10, background:'#ec4899', borderRadius:'50%' }} />
                                        즐겨찾기
                                    </span>
                                    <span className='flex items-center gap-1'>
                                        <span style={{ display:'inline-block', width:10, height:10, background:'#22c55e', borderRadius:'50%' }} />
                                        방문완료
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Map;
