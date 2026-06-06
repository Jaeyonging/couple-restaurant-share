import { useToastStore } from '../../store/data'
import { FiCheck, FiX, FiAlertCircle, FiInfo } from 'react-icons/fi'

const Toast = () => {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className='fixed top-4 left-0 right-0 pointer-events-none' style={{ zIndex: 99999 }}>
    <div className='max-w-[430px] mx-auto flex flex-col items-center gap-2 px-4'>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className='w-full max-w-sm flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-900 text-white shadow-card animate-slide-up pointer-events-auto'
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
            toast.type === 'success' ? 'bg-green-500' :
            toast.type === 'error' ? 'bg-red-500' :
            'bg-gray-600'
          }`}>
            {toast.type === 'success' ? <FiCheck className='text-xs' /> :
             toast.type === 'error' ? <FiAlertCircle className='text-xs' /> :
             <FiInfo className='text-xs' />}
          </div>
          <span className='text-sm font-medium flex-1'>{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className='text-white/50 hover:text-white transition-colors'>
            <FiX className='text-sm' />
          </button>
        </div>
      ))}
    </div>
    </div>
  )
}

export default Toast
