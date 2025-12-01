import React from 'react'
import { FiExternalLink, FiMapPin } from 'react-icons/fi';
import { useMarkerStore, useCurrentMarkerStore } from '../../store/data';
import { RenderImg } from '../RenderImg';

interface Props {
    data: any
}

const SearchResultCard = ({ data }: Props) => {
    const { marker, setMarker } = useMarkerStore();
    const { setCurrentMarker } = useCurrentMarkerStore();
    console.log(data);
    const { title, address, category, link, mapx, mapy, roadAddress, thumbnail } = data;

    const clickAddress = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMarker([
            ...marker,
            {
                mapx: mapx,
                mapy: mapy,
                address: address,
                category: category,
                link: link,
                roadAddress: roadAddress,
                title: title,
            },
        ]);
        setCurrentMarker(data);
    };

    return (
        <div
            className='flex w-full cursor-pointer gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_10px_40px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_20px_50px_rgba(79,70,229,0.2)]'
            onClick={clickAddress}>
                
            <div className='h-[110px] w-[110px] overflow-hidden rounded-2xl bg-gray-100'>
                {thumbnail ? (
                    <RenderImg imgurl={thumbnail} alt={title} className='h-full w-full object-cover' />
                ) : (
                    <div className='flex h-full w-full items-center justify-center text-sm text-gray-400'>No Image</div>
                )}
            </div>

            <div className='flex flex-1 flex-col justify-between gap-2'>
                <div className='flex flex-col gap-1'>
                    <span className='text-lg font-semibold text-slate-900' dangerouslySetInnerHTML={{ __html: title }} />
                    <span className='text-xs font-semibold uppercase tracking-wide text-indigo-500'>{category || '업종 정보 없음'}</span>
                </div>
                <div className='flex flex-col gap-1 text-sm text-slate-500'>
                    <div className='flex gap-2'>
                        <FiMapPin className='mt-0.5 text-indigo-500' />
                        <div className='flex flex-col text-slate-700'>
                            <span>{roadAddress}</span>
                        </div>
                    </div>
                </div>
                <div className='flex justify-end text-sm'>
                    {link && (
                        <a
                            href={link}
                            target='_blank'
                            rel='noreferrer'
                            onClick={(event) => event.stopPropagation()}
                            className='flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-500'
                        >
                            자세히 보기
                            <FiExternalLink />
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SearchResultCard
