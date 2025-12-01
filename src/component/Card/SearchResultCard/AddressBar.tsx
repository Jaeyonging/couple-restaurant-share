import React from 'react'
import { FiMapPin } from 'react-icons/fi';
interface Props {
    roadAddress: string;
}

const AddressBar = ({ roadAddress }: Props) => {
    return (
        <div className='flex flex-col gap-1 text-sm text-slate-500'>
            <div className='flex gap-2'>
                <FiMapPin className='mt-0.5 text-indigo-500' />
                <div className='flex flex-col text-slate-700'>
                    <span>{roadAddress}</span>
                </div>
            </div>
        </div>
    )
}

export default AddressBar
