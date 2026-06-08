import React, { useState, useEffect } from 'react'
import { useCurrentMarkerStore, useToastStore } from '../../../store/data';
import { RenderImg } from '../../RenderImg';
import { FiMapPin, FiExternalLink, FiStar } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import { registerPlace, addFavPlace, getFavPlaces } from '../../../api/fetch';

interface Props {
    data: any
}

const SearchResultCard = ({ data }: Props) => {
    const { currentMarker, setCurrentMarker } = useCurrentMarkerStore();
    const { addToast } = useToastStore();
    const { title, category, link, mapx, mapy, roadAddress, address, thumbnail } = data;
    const [isFavorited, setIsFavorited] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkIfFavorited = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsChecking(false);
                return;
            }

            try {
                const favPlacesData = await getFavPlaces();
                const placeName = title.replace(/<[^>]*>/g, '');
                const placeAddress = roadAddress || address;

                const isAlreadyFavorited = favPlacesData.favPlaces?.some((favPlace: any) => {
                    return favPlace.name === placeName &&
                           (favPlace.roadAddress === placeAddress || favPlace.address === placeAddress);
                });

                if (isAlreadyFavorited) {
                    setIsFavorited(true);
                }
            } catch (error) {
                console.error('Check favorite error:', error);
            } finally {
                setIsChecking(false);
            }
        };

        checkIfFavorited();
    }, [title, roadAddress, address]);

    const clickAddress = () => {
        setCurrentMarker({
            mapx: mapx,
            mapy: mapy,
            name: title.replace(/<[^>]*>/g, ''),
        });
    };

    const handleStarClick = async (e: React.MouseEvent) => {
        e.stopPropagation();

        const token = localStorage.getItem('token');
        if (!token) {
            addToast('error', '로그인이 필요합니다.');
            return;
        }

        if (isFavorited) {
            addToast('info', '이미 등록된 맛집입니다.');
            return;
        }

        if (isLoading || isChecking) return;
        setIsLoading(true);

        try {
            const placeData = {
                name: title.replace(/<[^>]*>/g, ''),
                link: link || null,
                address: address || roadAddress,
                roadAddress: roadAddress || address,
                categories: category ? [category] : [],
                locations: [{ mapx, mapy }],
                thumbnails: thumbnail ? [{ thumbnail, link: link || null }] : []
            };

            const placeResult = await registerPlace(placeData);
            const placeId = placeResult.placeId;

            await addFavPlace(placeId);
            setIsFavorited(true);
            addToast('success', '맛집이 등록되었습니다!');
        } catch (error: any) {
            console.error('Register error:', error);
            if (error.response?.status === 400 && error.response?.data?.error?.includes('이미')) {
                addToast('info', '이미 등록된 맛집입니다.');
                setIsFavorited(true);
            } else if (error.response?.status === 400 && error.response?.data?.error?.includes('커플')) {
                addToast('error', '먼저 커플을 연결해주세요.');
            } else {
                addToast('error', '등록에 실패했습니다.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const isActive =
        !!currentMarker &&
        currentMarker.mapx === mapx &&
        currentMarker.mapy === mapy;

    const cleanTitle = title.replace(/<[^>]*>/g, '');

    return (
        <div
            onClick={clickAddress}
            className={`bg-white rounded-xl p-3 cursor-pointer transition-all ${
                isActive
                    ? 'ring-2 ring-primary-500 shadow-soft'
                    : 'hover:shadow-soft border border-gray-100'
            }`}
        >
            <div className='flex gap-3'>
                {/* Thumbnail */}
                <div className='w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0'>
                    {thumbnail ? (
                        <RenderImg
                            imgurl={thumbnail}
                            alt={cleanTitle}
                            className='w-full h-full object-cover'
                        />
                    ) : (
                        <div className='w-full h-full flex items-center justify-center text-gray-300'>
                            <FiMapPin className='text-lg' />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between gap-2 mb-1'>
                        <h3 className='font-bold text-gray-900 text-[15px] truncate'>
                            {cleanTitle}
                        </h3>
                        <button
                            onClick={handleStarClick}
                            disabled={isLoading || isChecking}
                            className={`flex-shrink-0 p-1 rounded-full transition-all ${
                                isFavorited
                                    ? 'text-yellow-500'
                                    : 'text-gray-300 hover:text-yellow-400'
                            } ${(isLoading || isChecking) ? 'opacity-50' : ''}`}
                        >
                            {isFavorited ? (
                                <AiFillStar className='text-lg' />
                            ) : (
                                <FiStar className='text-lg' />
                            )}
                        </button>
                    </div>

                    <p className='text-[13px] text-gray-600 truncate mb-2 flex items-center gap-1'>
                        <FiMapPin className='text-primary-400 flex-shrink-0' />
                        {roadAddress || address}
                    </p>

                    <div className='flex items-center justify-between'>
                        {category && (
                            <span className='text-[11px] text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md'>
                                {category}
                            </span>
                        )}
                        {link && (
                            <a
                                href={link}
                                target='_blank'
                                rel='noreferrer'
                                onClick={(e) => e.stopPropagation()}
                                className='text-xs text-gray-400 hover:text-primary-500 flex items-center gap-1 transition-colors'
                            >
                                상세 <FiExternalLink className='text-[10px]' />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SearchResultCard
