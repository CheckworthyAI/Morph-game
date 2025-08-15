import Phaser from 'phaser'
import { soundAssets } from '../assets/SoundAssets'

export class MenuScene extends Phaser.Scene {
  private selectedCharacter: string = 'founder2' // Default character
  private characterPreviews: Phaser.GameObjects.Sprite[] = []
  private characterNames: string[] = ['founder1', 'founder2', 'founder3', 'founder4']
  private currentCharacterIndex: number = 1 // Default to founder2
  private menuState: 'main' | 'characters' | 'credits' = 'main'
  private buttons: Phaser.GameObjects.Container[] = []
  private creditsText: Phaser.GameObjects.Text | null = null

  constructor() {
    super({ key: 'MenuScene' })
  }

  preload() {
    // Load character assets
    this.load.image('founder1', '/assets/founder1.png')
    this.load.image('founder2', '/assets/founder2.png')
    this.load.image('founder3', '/assets/founder3.png')
    this.load.image('founder4', '/assets/founder4.png')
    
    // Load other game assets for preview
    this.load.image('morph-logo', '/assets/morph.png')
    this.load.image('morph-billboard', '/assets/morph_billboard_graphic.png')
  }

  create() {
    // Sound system is automatically initialized

    // Create gradient background
    const graphics = this.add.graphics()
    graphics.fillGradientStyle(0x1e3c72, 0x2a5298, 0x1e3c72, 0x2a5298, 1)
    graphics.fillRect(0, 0, 1200, 600)

    // Add title
    this.add.text(600, 80, 'MORPH AI DEBUG RESCUE', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Add subtitle
    this.add.text(600, 130, 'AI-Powered Coding Challenge Game', {
      fontSize: '20px',
      color: '#cccccc'
    }).setOrigin(0.5)

    // Add Morph logo
    const logo = this.add.image(600, 200, 'morph-logo')
    logo.setScale(0.3)

    this.showMainMenu()

    // Set up input
    this.setupInput()
  }

  private showMainMenu() {
    this.menuState = 'main'
    this.clearMenu()

    // Create main menu buttons
    const startButton = this.createButton(600, 300, 'START GAME', '#28a745', () => {
      soundAssets.playSound('jump', 0.8)
      this.startGame()
    })

    const charactersButton = this.createButton(600, 370, 'SELECT CHARACTER', '#007bff', () => {
      soundAssets.playSound('jump', 0.6)
      this.showCharacterSelection()
    })

    const creditsButton = this.createButton(600, 440, 'CREDITS', '#6c757d', () => {
      soundAssets.playSound('jump', 0.6)
      this.showCredits()
    })

    this.buttons = [startButton, charactersButton, creditsButton]

    // Add current character preview (positioned lower to avoid overlap)
    const characterPreview = this.add.sprite(600, 520, this.selectedCharacter)
    
    // Apply consistent scaling for character preview (smaller to fit better)
    const previewScale = this.selectedCharacter === 'founder4' ? 0.15 : 0.25
    characterPreview.setScale(previewScale)
    this.add.text(600, 570, `Selected: ${this.getCharacterName(this.selectedCharacter)}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5)
  }

  private showCharacterSelection() {
    this.menuState = 'characters'
    this.clearMenu()

    // Title
    this.add.text(600, 250, 'SELECT YOUR CHARACTER', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    // Character selection grid
    const startX = 200
    const spacing = 200
    this.characterPreviews = []

    this.characterNames.forEach((character, index) => {
      const x = startX + (index * spacing)
      const y = 350

      // Character sprite
      const sprite = this.add.sprite(x, y, character)
      
      // Apply different scaling for each character to maintain consistency
      const scale = character === 'founder4' ? 0.12 : 0.25
      sprite.setScale(scale)
      sprite.setInteractive()
      
      // Selection highlight
      const highlight = this.add.rectangle(x, y, 120, 120, 0xffff00, 0.3)
      highlight.setVisible(index === this.currentCharacterIndex)

      // Character name
      this.add.text(x, y + 100, this.getCharacterName(character), {
        fontSize: '14px',
        color: '#ffffff'
      }).setOrigin(0.5)

      // Click handler
      sprite.on('pointerdown', () => {
        soundAssets.playSound('targetHit', 0.6)
        this.selectCharacter(index)
        this.updateCharacterHighlights()
      })

      sprite.on('pointerover', () => {
        if (index !== this.currentCharacterIndex) {
          sprite.setTint(0xcccccc) // Light gray hover for non-selected
        }
      })

      sprite.on('pointerout', () => {
        if (index !== this.currentCharacterIndex) {
          sprite.clearTint() // Only clear if not selected
        } else {
          sprite.setTint(0xffffff) // Restore white glow for selected
        }
      })

      this.characterPreviews.push(sprite)
    })

    // Back button
    const backButton = this.createButton(600, 520, 'BACK TO MENU', '#6c757d', () => {
      soundAssets.playSound('jump', 0.6)
      this.showMainMenu()
    })

    this.buttons = [backButton]
    this.updateCharacterHighlights()
  }

  private showCredits() {
    this.menuState = 'credits'
    this.clearMenu()

    // Credits content
    const creditsContent = `
Special Thanks to:
Garry Tan
Paul Graham
Michael Seibel
Jared Friedman

Thank you Morph.
Thank you YCombinator.
    `

    this.creditsText = this.add.text(600, 320, creditsContent, {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5)

    // Back button
    const backButton = this.createButton(600, 520, 'BACK TO MENU', '#6c757d', () => {
      soundAssets.playSound('jump', 0.6)
      this.showMainMenu()
    })

    this.buttons = [backButton]
  }

  private createButton(x: number, y: number, text: string, color: string, callback: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y)

    // Button background
    const bg = this.add.rectangle(0, 0, 250, 50, parseInt(color.replace('#', '0x')))
    bg.setInteractive()

    // Button text
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)

    button.add([bg, buttonText])

    // Hover effects
    bg.on('pointerover', () => {
      bg.setFillStyle(parseInt(color.replace('#', '0x')), 0.8)
      button.setScale(1.05)
    })

    bg.on('pointerout', () => {
      bg.setFillStyle(parseInt(color.replace('#', '0x')), 1)
      button.setScale(1)
    })

    bg.on('pointerdown', callback)

    return button
  }

  private selectCharacter(index: number) {
    this.currentCharacterIndex = index
    this.selectedCharacter = this.characterNames[index]
  }

  private updateCharacterHighlights() {
    // Update highlights for character selection
    this.children.list.forEach((child) => {
      if (child instanceof Phaser.GameObjects.Rectangle && child.fillColor === 0xffff00) {
        child.setVisible(false)
      }
    })

    // Clear all character tints first
    this.characterPreviews.forEach((sprite) => {
      sprite.clearTint()
    })

    // Show highlight for selected character
    const startX = 200
    const spacing = 200
    const x = startX + (this.currentCharacterIndex * spacing)
    const y = 380

    const highlight = this.add.rectangle(x, y, 120, 120, 0xffff00, 0.3)
    highlight.setDepth(-1)

    // Add glow effect to selected character
    if (this.characterPreviews[this.currentCharacterIndex]) {
      this.characterPreviews[this.currentCharacterIndex].setTint(0xffffff) // White glow (subtle)
    }
  }

  private getCharacterName(character: string): string {
    const names: { [key: string]: string } = {
      'founder1': 'Prime Partner',
      'founder2': 'Captain Cool',
      'founder3': 'Pitch Boss',
      'founder4': 'OG Oracle'
    }
    return names[character] || character
  }

  private setupInput() {
    // Keyboard navigation
    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.menuState !== 'main') {
        soundAssets.playSound('jump', 0.6)
        this.showMainMenu()
      }
    })

    // Arrow key navigation for character selection
    this.input.keyboard?.on('keydown-LEFT', () => {
      if (this.menuState === 'characters') {
        this.currentCharacterIndex = Math.max(0, this.currentCharacterIndex - 1)
        this.selectedCharacter = this.characterNames[this.currentCharacterIndex]
        this.updateCharacterHighlights()
        soundAssets.playSound('targetHit', 0.4)
      }
    })

    this.input.keyboard?.on('keydown-RIGHT', () => {
      if (this.menuState === 'characters') {
        this.currentCharacterIndex = Math.min(this.characterNames.length - 1, this.currentCharacterIndex + 1)
        this.selectedCharacter = this.characterNames[this.currentCharacterIndex]
        this.updateCharacterHighlights()
        soundAssets.playSound('targetHit', 0.4)
      }
    })

    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.menuState === 'main') {
        this.startGame()
      }
    })
  }

  private startGame() {
    // Pass selected character to game scene
    this.scene.start('WorkingMorphScene', { selectedCharacter: this.selectedCharacter })
  }

  private clearMenu() {
    // Clear existing buttons and UI elements
    this.buttons.forEach(button => button.destroy())
    this.buttons = []

    if (this.creditsText) {
      this.creditsText.destroy()
      this.creditsText = null
    }

    this.characterPreviews.forEach(preview => preview.destroy())
    this.characterPreviews = []

    // Clear all dynamic elements (highlights, text, etc.) except logo and main title
    const childrenToDestroy: Phaser.GameObjects.GameObject[] = []
    this.children.list.forEach((child) => {
      if (child instanceof Phaser.GameObjects.Rectangle && child.fillColor === 0xffff00) {
        childrenToDestroy.push(child)
      }
      // Clear all text elements except the main title and logo-related elements
      if (child instanceof Phaser.GameObjects.Text && 
          !child.text.includes('MORPH AI DEBUG RESCUE') && 
          !child.text.includes('AI-Powered Coding Challenge Game')) {
        childrenToDestroy.push(child)
      }
      // Clear all character sprites (both grid and preview)
      if (child instanceof Phaser.GameObjects.Sprite && 
          child.texture.key.includes('founder')) {
        childrenToDestroy.push(child)
      }
    })
    
    // Destroy collected children
    childrenToDestroy.forEach(child => child.destroy())
  }
}
