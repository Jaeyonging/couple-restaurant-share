import React from 'react'
import { useFetchDataStore } from '../../store/data';

const HomeContainer = () => {
    const { data } = useFetchDataStore();
    console.log(data);
    return (
        <div>

        </div>
    )
}

export default HomeContainer
