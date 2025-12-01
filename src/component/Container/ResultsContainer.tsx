import React, { useEffect, useRef, useState } from 'react'
import { useFetchDataStore } from '../../store/data';
import SearchResultCard from '../Card/SearchResultCard/SearchResultCard';

const MIN_HEIGHT = 25;
const MAX_HEIGHT = 80;

const ResultsContainer = () => {
    const { data } = useFetchDataStore();
    const [sheetHeight, setSheetHeight] = useState(40);
    const dragStateRef = useRef({
        startY: 0,
        startHeight: sheetHeight,
        dragging: false
    });

    useEffect(() => {
        const handlePointerMove = (event: PointerEvent) => {
            if (!dragStateRef.current.dragging) return;
            const delta = event.clientY - dragStateRef.current.startY;
            const deltaPercent = (delta / window.innerHeight) * 100;
            const nextHeight = dragStateRef.current.startHeight - deltaPercent;
            const clampedHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, nextHeight));
            setSheetHeight(clampedHeight);
        };

        const handlePointerUp = () => {
            dragStateRef.current.dragging = false;
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, []);

    const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
        dragStateRef.current = {
            startY: event.clientY,
            startHeight: sheetHeight,
            dragging: true
        };
    };

    const isVisible = data && data.items.length > 0;

    return (
        <div
            className={`w-full absolute bottom-[50px] z-50 bg-white border-t border-gray-200 ${isVisible ? 'block' : 'hidden'}`}
            style={{ height: `${sheetHeight}vh` }}
        >
            <div className='flex flex-col h-full'>
                <div
                    className='flex justify-center pt-2 pb-3 cursor-grab active:cursor-grabbing select-none'
                    onPointerDown={startDrag}
                    style={{ touchAction: 'none' }}
                >
                    <div className='w-10 h-1.5 bg-gray-300 rounded-full'></div>
                </div>
                <div className='gap-2 flex flex-col p-2 overflow-y-auto flex-1'>
                    {data && data.items.map((item: any, index: number) => (
                        <SearchResultCard data={item} key={index} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ResultsContainer
