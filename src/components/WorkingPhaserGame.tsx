'use client'

import { useEffect, useRef, useState } from 'react'
import * as Phaser from 'phaser'
import { WorkingMorphScene } from './WorkingMorphScene'
import { MenuScene } from './MenuScene'

export default function WorkingPhaserGame() {
  const gameRef = useRef<Phaser.Game | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [gameInitialized, setGameInitialized] = useState(false)

  useEffect(() => {
    // Initialize game immediately when component mounts (client-side only)
    if (typeof window === 'undefined') return
    
    console.log('WorkingPhaserGame useEffect called')
    
    if (containerRef.current && !gameRef.current) {
      console.log('Creating working Phaser game...')
      
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 1200,
        height: 600,
        parent: containerRef.current,
        backgroundColor: '#87CEEB',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 500, x: 0 },
            debug: false
          }
        },
        scene: [MenuScene, WorkingMorphScene],
        input: {
          mouse: {
            preventDefaultWheel: false, // Allow mouse wheel scrolling
            preventDefaultUp: false,
            preventDefaultDown: false
          },
          touch: {
            capture: false // Don't capture touch events
          }
        },
        dom: {
          createContainer: false // Don't create DOM container that might block events
        }
      }

      try {
        gameRef.current = new Phaser.Game(config)
        setGameInitialized(true)
        console.log('Working Phaser game created successfully:', gameRef.current)
      } catch (error) {
        console.error('Error creating working Phaser game:', error)
      }
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
        setGameInitialized(false)
      }
    }
  }, [])

  // Always render the container div to prevent hydration mismatch
  return (
    <div className="w-full flex flex-col items-center">
      <div 
        ref={containerRef}
        className="border border-gray-300 rounded-lg overflow-hidden bg-sky-200"
        style={{ 
          width: '1200px', 
          height: '600px',
          maxWidth: '100%',
          maxHeight: '100vh'
        }}
      >
        {!gameInitialized && (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700 mb-2">🎮 Loading Morph AI Debug Rescue...</div>
              <div className="text-sm text-gray-600">Initializing game engine...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
