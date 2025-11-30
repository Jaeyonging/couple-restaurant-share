import React from 'react'
import { useMarkerStore, useCurrentMarkerStore } from '../../store/data';

interface Props {
    data: any
}

const SearchResultCard = ({ data }: Props) => {
    const { marker, setMarker } = useMarkerStore();
    const { setCurrentMarker } = useCurrentMarkerStore();
    const { title, address,category, description, link, mapx, mapy, roadAddress, telephone } = data;
    
    const clickAddress = (e: React.MouseEvent) => {
        e.stopPropagation(); // 카드 클릭 이벤트와 분리
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
        <div className='w-[100%] h-[100%] p-4 rounded-[20px] bg-[red] cursor-pointer' onClick={clickAddress}>
            <div
                dangerouslySetInnerHTML={{ __html: title }}
            />
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
