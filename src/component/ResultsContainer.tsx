import React from 'react'
import { useFetchDataStore } from '../store/data';
import SearchResultCard from './Card/SearchResultCard';

const ResultsContainer = () => {
    const { data } = useFetchDataStore();
    console.log(data);
    return (
        <div className='w-[100%] h-[40%] absolute bottom-0 left-0 z-50 bg-[white] p-4 rounded-[50px]'>
            <div className='gap-2 flex flex-col'>
                {data && data.items.map((item: any, index: number) => (
                    <SearchResultCard data={item} key={index} />
                ))}
            </div>

        </div>
    )
}

export default ResultsContainer
