import React, { useState } from 'react'
interface Props {
    search: string
    setSearch: (search: string) => void
}

const SearchInput = ({ search, setSearch }: Props) => {
    const [input, setInput] = useState(search);
    const handleSearch = () => {
        setSearch(input);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className='flex items-center justify-center w-[100%] p-2 gap-2 z-50 relative bg-white'>
            <input type="text" className='w-[100%] h-[100%] p-2 rounded-md border border-gray-300' value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} />
            <button className='w-[100px] p-2 rounded-md border border-gray-300' onClick={handleSearch}>Search</button>
        </div>
    )
}

export default SearchInput
