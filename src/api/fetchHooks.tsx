import React, { useEffect } from 'react'
import { useFetchDataStore, useMarkerStore, useCurrentMarkerStore } from '../store/data';
import { useQuery } from 'react-query';
import Loading from '../lotties/Loading';
import { fetchNaverSearchWithImage } from './fetch';

export const SearchFetcher = ({ children, keyword }: { children: React.ReactNode, keyword: string }) => {
    const { setData, resetData } = useFetchDataStore();
    const { setMarker, resetMarker } = useMarkerStore();
    const { setCurrentMarker, resetCurrentMarker } = useCurrentMarkerStore();
    const { data, isLoading, isError, error } = useQuery(
        ['search', keyword],
        () => fetchNaverSearchWithImage(keyword),
        { enabled: !!keyword }
    );

    useEffect(() => {
        if (!keyword) {
            resetData();
            resetMarker();
            resetCurrentMarker();
            return;
        }

        if (!data) {
            resetData();
            resetMarker();
            resetCurrentMarker();
            return;
        }

        setData(data);

        const normalizedMarkers = (data.items ?? []).map((item: any) => ({
            mapx: typeof item.mapx === 'string' ? Number(item.mapx) : item.mapx,
            mapy: typeof item.mapy === 'string' ? Number(item.mapy) : item.mapy,
        }));

        setMarker(normalizedMarkers);
        if (normalizedMarkers.length > 0) {
            setCurrentMarker(normalizedMarkers[0]);
        } else {
            resetCurrentMarker();
        }
    }, [data, keyword, resetCurrentMarker, resetData, resetMarker, setCurrentMarker, setData, setMarker]);

    if (isLoading) return <Loading />;
    if (isError) throw error;

    return <>{children}</>;
};
    
