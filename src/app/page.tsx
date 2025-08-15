'use client'

import Image from "next/image";
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import with no SSR to completely prevent hydration issues
const ClientOnlyGame = dynamic(() => import('../components/ClientOnlyGame'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-96">
      <div className="text-xl text-gray-600">Loading Morph AI Debug Rescue...</div>
    </div>
  )
});

export default function Home() {
  useEffect(() => {
    // Suppress hydration warnings caused by browser extensions
    const originalConsoleError = console.error
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('Hydration') || 
         args[0].includes('hydrated') ||
         args[0].includes('data-windsurf'))
      ) {
        return // Suppress hydration warnings
      }
      originalConsoleError.apply(console, args)
    }
    
    // Client-side only setup
    
    // Force enable scrolling on all elements
    document.body.style.overflow = 'auto'
    document.body.style.height = 'auto'
    document.body.style.position = 'static'
    document.documentElement.style.overflow = 'auto'
    document.documentElement.style.height = 'auto'
    document.documentElement.style.position = 'static'
    
    // Prevent Phaser from blocking scroll events
    const preventScrollBlock = (e: Event) => {
      e.stopPropagation()
    }
    
    // Allow wheel events to bubble up for scrolling
    document.addEventListener('wheel', preventScrollBlock, { passive: true, capture: false })
    document.addEventListener('scroll', preventScrollBlock, { passive: true, capture: false })
    
    return () => {
      document.body.style.overflow = ''
      document.body.style.height = ''
      document.body.style.position = ''
      document.documentElement.style.overflow = ''
      document.documentElement.style.height = ''
      document.documentElement.style.position = ''
      document.removeEventListener('wheel', preventScrollBlock)
      document.removeEventListener('scroll', preventScrollBlock)
    }
  }, [])

  return (
    <div 
      className="bg-gradient-to-b from-blue-900 to-blue-600" 
      style={{ 
        minHeight: '150vh', // Make page taller to force scrolling
        height: 'auto', 
        overflow: 'visible',
        position: 'relative'
      }}
    >
      <div 
        className="container mx-auto px-4 py-8 max-w-7xl" 
        style={{ 
          height: 'auto', 
          minHeight: '150vh', // Make container taller
          position: 'relative'
        }}
      >
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎮 Morph: AI Debug Rescue
          </h1>
          <p className="text-xl text-blue-100 mb-4">
            A coding challenge game powered by Phaser.js and Next.js
          </p>
          <div className="bg-black/20 rounded-lg p-4 text-white text-sm max-w-4xl mx-auto">
            <p className="mb-2">
              <strong>🎯 How to Play:</strong> Use WASD/Arrow keys to move your avatar, SPACE to shoot targets, and solve coding challenges!
            </p>
            <p>
              <strong>🤖 Morph AI:</strong> Use the "Morph Edit" button in challenges to get AI-powered code solutions.
            </p>
          </div>
        </header>

        {/* Game Container */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow-2xl p-2 w-full max-w-6xl">
            <ClientOnlyGame />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-blue-100">
          <p className="mb-2">
            Built with ❤️ using <strong>Phaser.js</strong> and <strong>Next.js</strong>
          </p>
          <p className="text-sm opacity-75">
            Solve coding challenges, earn Morph credits, and become a debugging master!
          </p>
        </footer>
      </div>
    </div>
  )
}
