import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AiFillStar } from 'react-icons/ai'
import { FiMapPin, FiChevronRight } from 'react-icons/fi'

interface RecommendCardProps {
  place: {
    id: number
    name: string
    address: string
    roadAddress: string
    categories: string
    avgRating: number
    commentCount: number
  }
}

const RecommendCard = ({ place }: RecommendCardProps) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate('/review')
  }

  return (
    <div
      onClick={handleClick}
      className='bg-white rounded-2xl p-4 shadow-soft cursor-pointer hover:shadow-card transition-all group'
    >
      <div className='flex items-center justify-between'>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-2'>
            <span className='text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full'>
              추천
            </span>
            {place.categories && (
              <span className='text-xs text-gray-400'>
                {place.categories.split(',')[0].trim()}
              </span>
            )}
          </div>

          <h3 className='text-sm font-bold text-gray-900 mb-1 truncate group-hover:text-primary-600 transition-colors'>
            {place.name}
          </h3>

          <p className='text-sm text-gray-500 truncate flex items-center gap-1 mb-3'>
            <FiMapPin className='text-primary-400 flex-shrink-0' />
            {place.roadAddress || place.address}
          </p>

          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-1'>
              <AiFillStar className='text-yellow-500 text-sm' />
              <span className='text-sm font-medium text-gray-700'>
                {place.avgRating ? place.avgRating.toFixed(1) : '-'}
              </span>
            </div>
            <span className='text-sm text-gray-400'>
              {place.commentCount}개 댓글
            </span>
          </div>
        </div>

        <FiChevronRight className='text-gray-300 text-xl group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0 ml-3' />
      </div>
    </div>
  )
}

export default RecommendCard
