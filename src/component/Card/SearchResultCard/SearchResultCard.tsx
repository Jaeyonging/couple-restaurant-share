import React from 'react'
import { useCurrentMarkerStore } from '../../../store/data';
import { RenderImg } from '../../RenderImg';
import { FiExternalLink, FiMapPin } from 'react-icons/fi';
import TitleBar from './TitleBar';
import AddressBar from './AddressBar';
import MoreInfo from './MoreInfo';
import ThumbnailBar from './ThumbnailBar';

interface Props {
    data: any
}

const SearchResultCard = ({ data }: Props) => {
    const { currentMarker, setCurrentMarker } = useCurrentMarkerStore();
    const { title, category, link, mapx, mapy, roadAddress, thumbnail } = data;

    const clickAddress = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentMarker({
            mapx: mapx,
            mapy: mapy,
        });
    };

    const isActive =
        !!currentMarker &&
        currentMarker.mapx === mapx &&
        currentMarker.mapy === mapy;

    return (
        <div className={`flex w-full cursor-pointer gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_10px_40px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_20px_50px_rgba(79,70,229,0.2)] ${isActive ? 'bg-[#f5f5f5]' : 'bg-white'}`} onClick={clickAddress}>

            <ThumbnailBar thumbnail={thumbnail} alt={title} />
            <div className='flex flex-1 flex-col justify-between gap-2'>
                <TitleBar title={title} category={category} />
                <AddressBar roadAddress={roadAddress} />
                <MoreInfo link={link} />
            </div>
        </div>
    )
}

export default SearchResultCard
