'use client'

import { useEffect, useState } from 'react'
import WorkingPhaserGame from './WorkingPhaserGame'

export default function ClientOnlyGame() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render anything during SSR
  if (!isClient) {
    return (
      <div className="flex items-center justify-center w-full h-96">
        <div className="text-xl text-gray-600">Loading Morph AI Debug Rescue...</div>
      </div>
    )
  }

  return <WorkingPhaserGame />
}
