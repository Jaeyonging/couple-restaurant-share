import React from 'react'
import { useQuery } from 'react-query';
import { NaverMap } from '../../component/NaverMap';
import ApiErrorBoundary from '../../boundary/ApiErrorBoundary';
import { SearchFetcher } from '../../api/fetchHooks';
import SearchInput from '../../component/SearchInput';
import ResultsContainer from '../../component/Container/ResultsContainer';
import { useMapStore } from '../../store/data';
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
    const { search, longtitude, latitude, setSearch } = useMapStore();

    const { data: favData } = useQuery('favPlaces', getFavPlaces, {
        staleTime: 1000 * 60 * 5,
    });
    const favMarkers = parseFavMarkers(favData?.favPlaces ?? []);

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
                <NaverMap
                    longtitude={longtitude}
                    latitude={latitude}
                    favMarkers={favMarkers}
                />

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
