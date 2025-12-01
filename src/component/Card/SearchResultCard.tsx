import React from 'react'
import { useMarkerStore, useCurrentMarkerStore } from '../../store/data';
import { RenderImg } from '../RenderImg';

interface Props {
    data: any
}

const SearchResultCard = ({ data }: Props) => {
    const { marker, setMarker } = useMarkerStore();
    const { setCurrentMarker } = useCurrentMarkerStore();
    const { title, address,category, description, link, mapx, mapy, roadAddress, telephone, thumbnail } = data;
    
    const clickAddress = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMarker([...marker, {
            mapx: mapx,
            mapy: mapy,
            address: address,
            category: category,
            description: description,
            link: link,
            roadAddress: roadAddress,
            telephone: telephone,
            title: title,
        }]);
        setCurrentMarker(data);
    }

    return (
        <div className='p-2 flex flex-col gap-2 rounded-[20px] bg-[red] cursor-pointer' onClick={clickAddress}>
            <div
                dangerouslySetInnerHTML={{ __html: title }}
            />
            {thumbnail && (
                <RenderImg imgurl={thumbnail} alt={title} className='w-[200px]' />
            )}
            <span>{address}</span>
            <span>{category}</span>
            <span>{description}</span>
            <span>{link}</span>
            <span>{mapx}</span>
            <span>{mapy}</span>
            <span>
                {roadAddress}
            </span>
            <span>{telephone}</span>
        </div>
    )
}

export default SearchResultCard
