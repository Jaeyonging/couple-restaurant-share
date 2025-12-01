import React, { useEffect } from 'react'
import { useFetchDataStore } from '../store/data';
import { useQuery } from 'react-query';
import Loading from '../lotties/Loading';
import { fetchNaverSearchWithImage } from './fetch';

export const SearchFetcher = ({ children, keyword }: { children: React.ReactNode, keyword: string }) => {
    const { setData, resetData } = useFetchDataStore();
    const { data, isLoading, isError, error } = useQuery(
        ['search', keyword],
        () => fetchNaverSearchWithImage(keyword),
        { enabled: !!keyword }
    );

    useEffect(() => {
        if (data) setData(data);
        return () => resetData();
    }, [data]);

    if (isLoading) return <Loading />;
    if (isError) throw error;

    return <>{children}</>;
};
    