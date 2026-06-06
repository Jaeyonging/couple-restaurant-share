import React, { useState, useEffect } from 'react'
import { FiSearch } from 'react-icons/fi'

interface Props {
    search: string
    setSearch: (search: string) => void
}

const SearchInput = ({ search, setSearch }: Props) => {
    const [input, setInput] = useState(search);

    useEffect(() => {
        setInput(search);
    }, [search]);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault()
        setSearch(input);
        (document.activeElement as HTMLElement)?.blur()
    };

    return (
        <form onSubmit={handleSearch} className='flex items-center gap-2 w-full'>
            <div className='flex-1 relative'>
                <FiSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
                <input
                    type="search"
                    className='w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary-500 text-sm placeholder-gray-400 transition-all'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='맛집 검색...'
                />
            </div>
            <button
                type='submit'
                className='px-5 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 active:scale-95 transition-all font-medium text-sm whitespace-nowrap'
            >
                검색
            </button>
        </form>
    )
}

export default SearchInput
