import React from 'react'
import { FiExternalLink } from 'react-icons/fi';

interface Props {
    link: string;
}

const MoreInfo = ({ link }: Props) => {
    return (
        <div className='flex justify-end text-sm'>
            {link && (
                <a
                    href={link}
                    target='_blank'
                    rel='noreferrer'
                    onClick={(event) => event.stopPropagation()}
                    className='flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-500'
                >
                    자세히 보기
                    <FiExternalLink />
                </a>
            )}
        </div>
    )
}

export default MoreInfo
