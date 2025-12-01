import React from 'react'
import { useFetchDataStore } from '../store/data';
import SearchResultCard from './Card/SearchResultCard';

const ResultsContainer = () => {
    const { data } = useFetchDataStore();
    console.log(data);
    return (
        <div className='w-[100%] h-[100vh] relative z-50 bg-[white] overflow-y-auto'>
            <div className='gap-2 flex flex-col p-2'>
                {data && data.items.map((item: any, index: number) => (
                    <SearchResultCard data={item} key={index} />
                ))}
            </div>

        </div>
    )
}

export default ResultsContainer
