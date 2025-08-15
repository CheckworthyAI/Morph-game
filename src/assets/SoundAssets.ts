/**
 * Sound Assets Manager for Morph AI Debug Rescue
 * Generates game sounds using Web Audio API for professional audio effects
 */

export class SoundAssets {
  private audioContext: AudioContext | null = null
  private sounds: Map<string, AudioBuffer> = new Map()
  private enabled: boolean = true

  constructor() {
    this.initializeAudioContext()
  }

  private initializeAudioContext() {
    try {
      // Create audio context (handle browser compatibility)
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      console.log('Audio context initialized successfully')
    } catch (error) {
      console.warn('Audio context not supported:', error)
      this.enabled = false
    }
  }

  /**
   * Generate a shooting sound effect
   */
  private generateShootSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not available')

    const duration = 0.2
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    // Generate a quick "pew" sound with frequency sweep
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const frequency = 800 - (t * 600) // Frequency sweep from 800Hz to 200Hz
      const envelope = Math.exp(-t * 8) // Quick decay
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3
    }

    return buffer
  }

  /**
   * Generate a bird hit sound effect
   */
  private generateBirdHitSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not available')

    const duration = 0.3
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    // Generate a satisfying "pop" sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const frequency = 400 + Math.sin(t * 20) * 100 // Slight wobble
      const envelope = Math.exp(-t * 6)
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.4
    }

    return buffer
  }

  /**
   * Generate a reward collection sound effect
   */
  private generateRewardSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not available')

    const duration = 0.6
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    // Generate a very gentle "soft pop" sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      
      // Create a very soft, brief "pop" sound
      const frequency = 200 // Very low, gentle frequency
      const envelope = Math.exp(-t * 15) // Very quick fade
      
      // Soft filtered noise-like sound
      const wave = Math.sin(2 * Math.PI * frequency * t) * Math.random() * 0.3 + 
                   Math.sin(2 * Math.PI * frequency * 0.5 * t) * 0.7
      
      data[i] = wave * envelope * 0.08 // Very gentle amplitude
    }

    return buffer
  }

  /**
   * Generate a power-up activation sound effect
   */
  private generatePowerUpSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not available')

    const duration = 0.8
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    // Generate an ascending "power-up" sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const frequency = 200 + (t * 400) // Ascending from 200Hz to 600Hz
      const envelope = Math.sin(t * Math.PI) // Bell curve envelope
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.25
    }

    return buffer
  }

  /**
   * Generate a target hit sound effect
   */
  private generateTargetHitSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not available')

    const duration = 0.25
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    // Generate a solid "thunk" sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const frequency = 150 + Math.exp(-t * 10) * 200
      const envelope = Math.exp(-t * 8)
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.35
    }

    return buffer
  }

  /**
   * Generate a jump sound effect
   */
  private generateJumpSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not available')

    const duration = 0.15
    const sampleRate = this.audioContext.sampleRate
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    // Generate a quick "boing" sound
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate
      const frequency = 300 + Math.sin(t * 50) * 100
      const envelope = Math.exp(-t * 12)
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.2
    }

    return buffer
  }

  /**
   * Initialize all game sounds
   */
  public async initializeSounds(): Promise<void> {
    if (!this.enabled || !this.audioContext) {
      console.warn('Sound system disabled - audio context not available')
      return
    }

    try {
      // Resume audio context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      // Generate all sound effects
      this.sounds.set('shoot', this.generateShootSound())
      this.sounds.set('birdHit', this.generateBirdHitSound())
      this.sounds.set('reward', this.generateRewardSound())
      this.sounds.set('powerUp', this.generatePowerUpSound())
      this.sounds.set('targetHit', this.generateTargetHitSound())
      this.sounds.set('jump', this.generateJumpSound())

      console.log('All game sounds initialized successfully')
    } catch (error) {
      console.error('Error initializing sounds:', error)
      this.enabled = false
    }
  }

  /**
   * Play a sound effect
   */
  public playSound(soundName: string, volume: number = 1.0): void {
    if (!this.enabled || !this.audioContext || !this.sounds.has(soundName)) {
      return
    }

    try {
      const buffer = this.sounds.get(soundName)!
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()

      source.buffer = buffer
      gainNode.gain.value = Math.max(0, Math.min(1, volume))

      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      source.start()
    } catch (error) {
      console.warn('Error playing sound:', error)
    }
  }

  /**
   * Enable or disable sound system
   */
  public setSoundEnabled(enabled: boolean): void {
    this.enabled = enabled
    console.log(`Sound system ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * Check if sound system is enabled and working
   */
  public isSoundEnabled(): boolean {
    return this.enabled && this.audioContext !== null
  }

  /**
   * Get available sound names
   */
  public getAvailableSounds(): string[] {
    return Array.from(this.sounds.keys())
  }
}

// Export singleton instance
export const soundAssets = new SoundAssets()
