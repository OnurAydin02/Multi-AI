import React from 'react'
import { Progress } from '@/components/ui/progress'

function UsageCreditProgress({ remainingToken }) {
  return (
    <div className='p-4 border rounded-xl mb-4 flex flex-col gap-2 bg-gray-50/50 dark:bg-gray-900/10'>
      <div className='flex justify-between items-center'>
        <h2 className='font-bold text-sm text-gray-700 dark:text-gray-300'>Free Plan</h2>
        <p className='text-[11px] font-medium text-gray-500'>{5 - remainingToken}/5 messages</p>
      </div>
      <Progress value={((5 - remainingToken) / 5) * 100} className="h-1.5" />
    </div>
  )
}

export default UsageCreditProgress