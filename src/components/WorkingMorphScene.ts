// Simplified Working Morph AI Debug Rescue Scene for Next.js
import * as Phaser from 'phaser'
import { soundAssets } from '../assets/SoundAssets'

export class WorkingMorphScene extends Phaser.Scene {
  private avatar!: Phaser.Physics.Arcade.Sprite
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private targets!: Phaser.Physics.Arcade.Group
  private bullets!: Phaser.Physics.Arcade.Group
  private birds!: Phaser.Physics.Arcade.Group

  private rewards!: Phaser.Physics.Arcade.Group
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasdKeys!: any
  private spaceKey!: Phaser.Input.Keyboard.Key
  private xKey!: Phaser.Input.Keyboard.Key
  private currentModal: HTMLElement | null = null
  private stats = { targetsHit: 0, challengesSolved: 0, morphCredits: 0 }
  private statsText: any = {}
  private powerUpActive = false
  private selectedCharacter: string = 'founder2' // Default character
  private birdSpawnTimer!: Phaser.Time.TimerEvent
  private crawlerSpawnTimer!: Phaser.Time.TimerEvent

  private codingProblems = [
    {
      title: "Two Sum",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      starterCode: "function twoSum(nums, target) {\n  // Your code here\n  return [];\n}",
      solution: "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
      testCases: [
        { input: [[2,7,11,15], 9], expected: [0,1] },
        { input: [[3,2,4], 6], expected: [1,2] }
      ]
    },
    {
      title: "Reverse String",
      description: "Write a function that reverses a string. The input string is given as an array of characters s.",
      starterCode: "function reverseString(s) {\n  // Your code here\n}",
      solution: "function reverseString(s) {\n  let left = 0;\n  let right = s.length - 1;\n  while (left < right) {\n    const temp = s[left];\n    s[left] = s[right];\n    s[right] = temp;\n    left++;\n    right--;\n  }\n}",
      testCases: [
        { input: [["h","e","l","l","o"]], expected: ["o","l","l","e","h"] },
        { input: [["H","a","n","n","a","h"]], expected: ["h","a","n","n","a","H"] }
      ]
    },
    {
      title: "Valid Parentheses",
      description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      starterCode: "function isValid(s) {\n  // Your code here\n  return false;\n}",
      solution: "function isValid(s) {\n  const stack = [];\n  const map = { ')': '(', '}': '{', ']': '[' };\n  for (let char of s) {\n    if (char in map) {\n      if (stack.pop() !== map[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  return stack.length === 0;\n}",
      testCases: [
        { input: ["()"], expected: true },
        { input: ["()[]{}"], expected: true },
        { input: ["(]"], expected: false }
      ]
    }
  ]

  constructor() {
    super({ key: 'WorkingMorphScene' })
  }

  init(data: { selectedCharacter?: string }) {
    // Set selected character from menu scene
    this.selectedCharacter = data.selectedCharacter || 'founder2'
    console.log('Selected character:', this.selectedCharacter)
  }

  preload() {
    console.log('WorkingMorphScene preload called')
    
    // Load all character assets
    this.load.image('founder1', '/assets/founder1.png')
    this.load.image('founder2', '/assets/founder2.png')
    this.load.image('founder3', '/assets/founder3.png')
    this.load.image('founder4', '/assets/founder4.png')
    this.load.image('morph-target', '/assets/images/morph-target.svg')
    this.load.image('morph-billboard', '/assets/morph_billboard_graphic.png')
    this.load.image('morph-logo', '/assets/morph.png')
    this.load.image('morph-bird', '/assets/images/morph-bird.svg')
  }

  create() {
    console.log('WorkingMorphScene create called')
    
    // Add background
    this.add.rectangle(600, 300, 1200, 600, 0x87CEEB)
    
    // Add title
    this.add.text(50, 50, 'MORPH AI DEBUG RESCUE', {
      fontSize: '20px',
      color: '#000000'
    })
    
    // Add stats display

    
    // Set up physics
    this.physics.world.setBounds(0, 0, 1200, 600)
    this.physics.world.gravity.y = 500
    
    // Create platforms using simple rectangles
    this.platforms = this.physics.add.staticGroup()
    
    // Ground platform
    const ground = this.add.rectangle(600, 580, 1200, 40, 0x8B4513)
    this.physics.add.existing(ground, true)
    this.platforms.add(ground)
    
    // Floating platforms
    const platform1 = this.add.rectangle(200, 480, 128, 32, 0x8B4513)
    this.physics.add.existing(platform1, true)
    this.platforms.add(platform1)
    
    const platform2 = this.add.rectangle(500, 420, 128, 32, 0x8B4513)
    this.physics.add.existing(platform2, true)
    this.platforms.add(platform2)
    
    const platform3 = this.add.rectangle(800, 360, 128, 32, 0x8B4513)
    this.physics.add.existing(platform3, true)
    this.platforms.add(platform3)
    
    console.log('Platforms created')
    
    // Create avatar using selected character asset
    this.avatar = this.physics.add.sprite(100, 450, this.selectedCharacter)
    this.avatar.setBounce(0.2)
    this.avatar.setCollideWorldBounds(false) // Disable world bounds to allow wrapping
    
    // Apply different scaling based on character to maintain consistency
    const avatarScale = this.selectedCharacter === 'founder4' ? 0.08 : 0.15
    this.avatar.setScale(avatarScale)
    console.log('Avatar created at:', this.avatar.x, this.avatar.y)
    
    // Add Morph billboard to the scene
    const billboard = this.add.image(800, 200, 'morph-billboard')
    billboard.setScale(0.3) // Scale down the billboard
    console.log('Billboard added')
    
    // Create targets using custom assets
    this.targets = this.physics.add.group()
    
    const target1 = this.add.sprite(200, 440, 'morph-target')
    this.physics.add.existing(target1)
    this.targets.add(target1)
    
    const target2 = this.add.sprite(500, 380, 'morph-target')
    this.physics.add.existing(target2)
    this.targets.add(target2)
    
    const target3 = this.add.sprite(800, 320, 'morph-target')
    this.physics.add.existing(target3)
    this.targets.add(target3)
    
    console.log('Targets created')
    
    // Create birds group
    this.birds = this.physics.add.group()
    

    
    // Create bullets group
    this.bullets = this.physics.add.group()
    
    // Create rewards group
    this.rewards = this.physics.add.group()
    
    console.log('Bullets group created')
    
    // Set up input with proper focus handling
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasdKeys = this.input.keyboard!.addKeys('W,S,A,D,SPACE,X')
    
    // Enable keyboard input but don't capture scroll-related keys
    this.input.keyboard!.enabled = true
    this.game.canvas.setAttribute('tabindex', '0')
    
    // Only capture essential game keys, NOT arrow keys or other navigation keys
    this.input.keyboard!.addCapture('W,A,S,D,SPACE,X')
    
    // Add click handler to focus canvas when clicked, but don't prevent scrolling
    this.game.canvas.addEventListener('click', (e) => {
      this.game.canvas.focus()
      e.stopPropagation() // Prevent event from bubbling but allow scrolling
    })
    
    // Explicitly allow wheel events to pass through for scrolling
    this.game.canvas.addEventListener('wheel', (e) => {
      e.stopPropagation() // Don't let Phaser handle wheel events
    }, { passive: true })
    
    // Set up collisions
    this.physics.add.collider(this.avatar, this.platforms)
    this.physics.add.collider(this.targets, this.platforms)
    this.physics.add.collider(this.rewards, this.platforms) // Rewards bounce on platforms
    this.physics.add.collider(this.bullets, this.platforms, (bullet) => {
      bullet.destroy()
    })
    
    // Set up bullet-target collisions
    this.physics.add.overlap(this.bullets, this.targets, (bullet, target) => {
      this.hitTarget(bullet as Phaser.Physics.Arcade.Sprite, target as Phaser.Physics.Arcade.Sprite)
    })
    
    // Set up bullet-bird collisions
    this.physics.add.overlap(this.bullets, this.birds, (bullet, bird) => {
      this.hitBird(bullet as Phaser.Physics.Arcade.Sprite, bird as Phaser.Physics.Arcade.Sprite)
    })
    

    
    // Set up avatar-reward collection
    this.physics.add.overlap(this.avatar, this.rewards, (avatar, reward) => {
      this.collectReward(reward as Phaser.Physics.Arcade.Sprite)
    })
    
    // Start bird spawning timer - spawn first bird immediately, then every 2-4 seconds
    this.spawnBird() // Spawn first bird immediately
    this.time.addEvent({
      delay: Phaser.Math.Between(2000, 4000), // Random spawn interval
      callback: () => {
        this.spawnBird()
      },
      callbackScope: this,
      loop: true
    })
    

    
    // Create stats display
    this.statsText.targetsHit = this.add.text(50, 110, `Targets Hit: ${this.stats.targetsHit}`, {
      fontSize: '16px',
      color: '#000000'
    })
    
    this.statsText.challengesSolved = this.add.text(50, 130, `Challenges Solved: ${this.stats.challengesSolved}`, {
      fontSize: '16px',
      color: '#000000'
    })
    
    this.statsText.morphCredits = this.add.text(50, 150, `Morph Credits: ${this.stats.morphCredits}`, {
      fontSize: '16px',
      color: '#000000'
    })
    
    // Add instructions
    this.add.text(50, 520, 'WASD/Arrow Keys: Move | W: Jump | SPACE: Horizontal Shoot | X: Vertical Shoot', {
      fontSize: '14px',
      color: '#000000'
    })
    
    // Add Back to Menu button
    const backToMenuButton = this.add.rectangle(1050, 50, 120, 40, 0x4CAF50)
      .setInteractive({ useHandCursor: true })
      .setDepth(100)
    
    const backToMenuText = this.add.text(1050, 50, 'BACK TO MENU', {
      fontSize: '12px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101)
    
    // Add hover effects for back to menu button
    backToMenuButton.on('pointerover', () => {
      backToMenuButton.setFillStyle(0x45a049)
      backToMenuText.setScale(1.1)
    })
    
    backToMenuButton.on('pointerout', () => {
      backToMenuButton.setFillStyle(0x4CAF50)
      backToMenuText.setScale(1.0)
    })
    
    // Handle back to menu click
    backToMenuButton.on('pointerdown', () => {
      console.log('Back to Menu clicked during gameplay')
      soundAssets.playSound('shoot', 0.3) // Button click sound
      this.scene.start('MenuScene')
    })
    
    // Initialize sound system
    this.initializeSounds()
    
    console.log('WorkingMorphScene setup complete')
  }

  private async initializeSounds() {
    try {
      await soundAssets.initializeSounds()
      console.log('Game sounds initialized successfully')
    } catch (error) {
      console.warn('Failed to initialize sounds:', error)
    }
  }

  update() {
    // Handle avatar movement
    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
      this.avatar.setVelocityX(-160)
      console.log('Moving left')
    } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
      this.avatar.setVelocityX(160)
      console.log('Moving right')
    } else {
      this.avatar.setVelocityX(0)
    }

    // Handle jumping (W key or Up arrow)
    const isOnGround = this.avatar.body!.touching.down || this.avatar.body!.blocked.down
    if ((Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.wasdKeys.W)) && isOnGround) {
      const avatarBody = this.avatar.body as Phaser.Physics.Arcade.Body
      avatarBody.setVelocityY(-350)
      soundAssets.playSound('jump', 0.4)
      console.log('Avatar jumped')
    }

    // Handle horizontal shooting (SPACE bar)
    if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.SPACE)) {
      this.shootHorizontal()
    }

    // Handle vertical shooting (X key)
    if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.X)) {
      this.shootVertical()
    }

    // Handle screen wrapping - character comes from left when going off right
    if (this.avatar.x > 1200) { // Game width is 1200
      this.avatar.x = 0 // Wrap to left side
      console.log('Character wrapped from right to left')
    }
    
    // Prevent character from going off the left side (optional - keep normal left boundary)
    if (this.avatar.x < 0) {
      this.avatar.x = 0
    }
    
    // Prevent character from falling below the world (only reset if they fall way below)
    if (this.avatar.y > 700) { // Increased threshold to prevent accidental resets
      this.avatar.y = 450 // Reset to starting height
      this.avatar.x = 100 // Reset to starting position
      console.log('Character reset to starting position - fell too far')
    }

    // Debug logging every second
    if (this.game.loop.frame % 60 === 0) {
      console.log(`Avatar position: (${this.avatar.x}, ${this.avatar.y}), velocity: (${this.avatar.body!.velocity.x}, ${this.avatar.body!.velocity.y}), onGround: ${isOnGround}`)
    }
  }

  private shootHorizontal() {
    console.log('Shooting horizontal bullet for ground targets')
    
    // Play shooting sound
    soundAssets.playSound('shoot', 0.6)
    
    // Create horizontal bullet
    const bullet = this.add.rectangle(this.avatar.x + 20, this.avatar.y, 12, 4, 0xFF4500)
    this.physics.add.existing(bullet)
    this.bullets.add(bullet)
    
    // Set bullet velocity
    const bulletBody = bullet.body as Phaser.Physics.Arcade.Body
    bulletBody.setVelocityX(400)
    bulletBody.setGravityY(-500) // Cancel out world gravity completely
    bulletBody.setVelocityY(0) // Ensure no vertical movement
    
    // Remove bullet after 3 seconds
    this.time.delayedCall(3000, () => {
      if (bullet.active) {
        bullet.destroy()
      }
    })
  }

  private shootVertical() {
    console.log('Shooting vertical bullet for flying birds')
    
    // Play shooting sound
    soundAssets.playSound('shoot', 0.6)
    
    // Create vertical bullet
    const bullet = this.add.rectangle(this.avatar.x, this.avatar.y - 20, 4, 12, 0xFF6600)
    this.physics.add.existing(bullet)
    this.bullets.add(bullet)
    
    // Set vertical velocity
    const bulletBody = bullet.body as Phaser.Physics.Arcade.Body
    bulletBody.setGravityY(-500) // Cancel gravity
    bulletBody.setVelocityX(0)
    bulletBody.setVelocityY(-350) // Fast upward
    
    // Remove bullet after 3 seconds
    this.time.delayedCall(3000, () => {
      if (bullet.active) {
        bullet.destroy()
      }
    })
  }

  private getOptimalShootDirection(): 'horizontal' | 'vertical' {
    const avatarX = this.avatar.x
    const avatarY = this.avatar.y
    
    // Find closest ground target
    let closestGroundTarget = null
    let closestGroundDistance = Infinity
    
    this.targets.children.entries.forEach((target: any) => {
      if (target.active) {
        const distance = Phaser.Math.Distance.Between(avatarX, avatarY, target.x, target.y)
        if (distance < closestGroundDistance) {
          closestGroundDistance = distance
          closestGroundTarget = target
        }
      }
    })
    
    // Find closest flying bird
    let closestBird = null
    let closestBirdDistance = Infinity
    
    this.birds.children.entries.forEach((bird: any) => {
      if (bird.active) {
        const distance = Phaser.Math.Distance.Between(avatarX, avatarY, bird.x, bird.y)
        if (distance < closestBirdDistance) {
          closestBirdDistance = distance
          closestBird = bird
        }
      }
    })
    
    // Decide shooting direction based on closest target
    // Prioritize birds if they're reasonably close (within 300px)
    if (closestBird && closestBirdDistance < 300) {
      return 'vertical'
    } else if (closestGroundTarget && closestGroundDistance < 400) {
      return 'horizontal'
    } else {
      // Default to horizontal if no clear target
      return 'horizontal'
    }
  }

  private hitTarget(bullet: Phaser.Physics.Arcade.Sprite, target: Phaser.Physics.Arcade.Sprite) {
    console.log('Target hit! Opening coding challenge...')
    
    // Play target hit sound
    soundAssets.playSound('targetHit', 0.7)
    
    // Remove bullet
    bullet.destroy()
    
    // Update stats
    this.stats.targetsHit++
    this.updateStats()
    
    // Get random coding problem
    const problemIndex = this.stats.targetsHit % this.codingProblems.length
    const problem = this.codingProblems[problemIndex]
    
    // Show coding challenge modal
    this.showCodingChallenge(problem, target)
  }

  private spawnBird() {
    console.log('Spawning bird')
    
    // Create bird at random height on the left side
    const birdY = Phaser.Math.Between(50, 250)
    
    // Create a better bird design using graphics
    const bird = this.add.graphics()
    
    // Bird body (main oval)
    bird.fillStyle(0x4A4A4A) // Dark gray body
    bird.fillEllipse(0, 0, 20, 12) // Main body
    
    // Bird head
    bird.fillStyle(0x3A3A3A) // Slightly darker head
    bird.fillEllipse(8, -2, 12, 10) // Head
    
    // Wings (two wing shapes for flying effect)
    bird.fillStyle(0x2A2A2A) // Dark wing color
    bird.fillEllipse(-2, -3, 14, 8) // Left wing
    bird.fillEllipse(-2, 3, 14, 8) // Right wing
    
    // Wing tips (lighter for detail)
    bird.fillStyle(0x5A5A5A) // Lighter wing tips
    bird.fillEllipse(-8, -3, 6, 4) // Left wing tip
    bird.fillEllipse(-8, 3, 6, 4) // Right wing tip
    
    // Beak
    bird.fillStyle(0xFFA500) // Orange beak
    bird.fillTriangle(14, -1, 18, 0, 14, 1) // Sharp beak
    
    // Eye
    bird.fillStyle(0x000000) // Black eye
    bird.fillCircle(10, -2, 2) // Small eye
    bird.fillStyle(0xFFFFFF) // White eye highlight
    bird.fillCircle(11, -3, 1) // Eye highlight
    
    // Position the bird
    bird.setPosition(-60, birdY)
    
    // Add physics to the bird with precise collision box
    this.physics.add.existing(bird)
    this.birds.add(bird)
    
    // Set precise collision body size to match visual appearance
    const birdBody = bird.body as Phaser.Physics.Arcade.Body
    birdBody.setSize(24, 16) // Smaller, more precise collision box
    birdBody.setOffset(-12, -8) // Center the collision box
    
    // Set bird velocity and disable gravity
    birdBody.setVelocityX(Phaser.Math.Between(120, 180)) // Consistent speed
    birdBody.setGravityY(-500) // Cancel out world gravity
    birdBody.setVelocityY(Phaser.Math.Between(-15, 15)) // Gentle vertical movement
    
    // Remove bird when it goes off screen
    this.time.delayedCall(15000, () => {
      if (bird.active) {
        bird.destroy()
      }
    })
  }

  private hitBird(bullet: Phaser.Physics.Arcade.Sprite, bird: Phaser.Physics.Arcade.Sprite) {
    console.log('Bird hit! Spawning reward...')
    
    // Play bird hit sound
    soundAssets.playSound('birdHit', 0.8)
    
    // Remove bullet and bird
    bullet.destroy()
    bird.destroy()
    
    // Create falling Morph logo reward at bird position
    this.spawnRewardDrop(bird.x, bird.y)
    
    // Show hit notification (no credits yet - must collect reward)
    const hitText = this.add.text(bird.x, bird.y, 'BIRD HIT!', {
      fontSize: '14px',
      color: '#FFD700',
      fontStyle: 'bold'
    })
    
    // Animate hit text
    this.tweens.add({
      targets: hitText,
      y: hitText.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => hitText.destroy()
    })
    
    // Spawn a new bird after a short delay
    this.time.delayedCall(2000, () => {
      this.spawnBird()
    })
  }

  private spawnRewardDrop(x: number, y: number) {
    console.log('Spawning reward drop at:', x, y)
    
    // Create falling Morph logo reward
    const reward = this.add.image(x, y, 'morph-logo')
    reward.setScale(0.3) // Small reward size
    this.physics.add.existing(reward)
    
    // Add to rewards group (create if doesn't exist)
    if (!this.rewards) {
      this.rewards = this.physics.add.group()
    }
    this.rewards.add(reward)
    
    // Set falling physics
    const rewardBody = reward.body as Phaser.Physics.Arcade.Body
    rewardBody.setVelocityY(80) // Slow fall
    rewardBody.setGravityY(-400) // Reduce gravity effect for slower fall
    rewardBody.setBounce(0.3) // Small bounce when hitting platforms
    
    // Add glow effect
    reward.setTint(0xFFFFFF)
    this.tweens.add({
      targets: reward,
      alpha: 0.7,
      duration: 500,
      yoyo: true,
      repeat: -1
    })
    
    // Remove reward after 8 seconds if not collected
    this.time.delayedCall(8000, () => {
      if (reward.active) {
        // Fade out animation
        this.tweens.add({
          targets: reward,
          alpha: 0,
          scale: 0,
          duration: 500,
          onComplete: () => {
            if (reward.active) {
              reward.destroy()
            }
          }
        })
      }
    })
  }

  private collectReward(reward: Phaser.Physics.Arcade.Sprite) {
    console.log('Reward collected!')
    
    // Play reward collection sound (very gentle soft pop)
    soundAssets.playSound('reward', 0.1)
    
    // Award Morph credits
    this.stats.morphCredits += 2
    this.updateStats()
    
    // Power-up effect: temporarily make character bigger
    this.avatarPowerUp()
    
    // Show collection notification
    const collectText = this.add.text(reward.x, reward.y - 20, '+2 MORPH CREDITS!', {
      fontSize: '16px',
      color: '#00FF00',
      fontStyle: 'bold'
    })
    
    // Animate collection text
    this.tweens.add({
      targets: collectText,
      y: collectText.y - 40,
      alpha: 0,
      duration: 1500,
      onComplete: () => collectText.destroy()
    })
    
    // Improved collection effect with sparkle animation
    this.tweens.add({
      targets: reward,
      scale: 1.2,
      duration: 150,
      yoyo: true,
      onComplete: () => {
        this.tweens.add({
          targets: reward,
          scale: 0,
          alpha: 0,
          duration: 200,
          ease: 'Back.easeIn',
          onComplete: () => {
            if (reward.active) {
              reward.destroy()
            }
          }
        })
      }
    })
  }

  private avatarPowerUp() {
    console.log('Avatar power-up activated!')
    
    // Play power-up sound
    soundAssets.playSound('powerUp', 0.6)
    
    // Scale up the avatar temporarily (relative to character's base scale)
    const baseScale = this.selectedCharacter === 'founder4' ? 0.08 : 0.15
    const powerUpScale = baseScale * 1.4 // 40% larger than base scale (more noticeable effect)
    
    this.tweens.add({
      targets: this.avatar,
      scale: powerUpScale,
      duration: 200,
      ease: 'Back.easeOut',
      yoyo: false
    })
    
    // Add glow effect
    this.avatar.setTint(0x00FF00) // Green tint for power-up
    
    // Show power-up text
    const powerText = this.add.text(this.avatar.x, this.avatar.y - 40, 'POWER UP!', {
      fontSize: '12px',
      color: '#FFFF00',
      fontStyle: 'bold'
    })
    
    // Animate power-up text
    this.tweens.add({
      targets: powerText,
      y: powerText.y - 20,
      alpha: 0,
      duration: 1000,
      onComplete: () => powerText.destroy()
    })
    
    // Return to normal size and color after 15 seconds
    this.time.delayedCall(15000, () => {
      const normalScale = this.selectedCharacter === 'founder4' ? 0.08 : 0.15
      
      this.tweens.add({
        targets: this.avatar,
        scale: normalScale, // Back to character's normal size
        duration: 300,
        ease: 'Power2.easeOut'
      })
      this.avatar.clearTint() // Remove green tint
      console.log('Power-up effect ended')
    })
  }

  private updateStats() {
    this.statsText.targetsHit.setText(`Targets Hit: ${this.stats.targetsHit}`)
    this.statsText.challengesSolved.setText(`Challenges Solved: ${this.stats.challengesSolved}`)
    this.statsText.morphCredits.setText(`Morph Credits: ${this.stats.morphCredits}`)
  }

  private showCodingChallenge(problem: any, target: Phaser.Physics.Arcade.Sprite) {
    console.log('Showing coding challenge:', problem.title)
    
    // Pause the game
    this.scene.pause()
    
    // Create modal overlay
    const modal = document.createElement('div')
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `
    
    // Create modal content
    const content = document.createElement('div')
    content.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 10px;
      max-width: 800px;
      width: 90%;
      max-height: 80%;
      overflow-y: auto;
    `
    
    content.innerHTML = `
      <h2 style="margin-top: 0; color: #333;">${problem.title}</h2>
      <p style="color: #666; margin-bottom: 20px;">${problem.description}</p>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 10px; font-weight: bold;">Your Solution:</label>
        <textarea id="codeEditor" style="width: 100%; height: 200px; font-family: monospace; font-size: 14px; line-height: 1.4; color: #222; background: #f9f9f9; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">${problem.starterCode}</textarea>
      </div>
      
      <div style="margin-bottom: 20px;">
        <button id="testCode" style="background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; margin-right: 10px; cursor: pointer;">Test Code</button>
        <button id="morphEdit" style="background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 5px; margin-right: 10px; cursor: pointer;">Morph Edit (AI Fix)</button>
        <button id="closeModal" style="background: #6c757d; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Close</button>
      </div>
      
      <div id="testResults" style="margin-top: 20px; padding: 10px; border-radius: 5px; display: none;"></div>
    `
    
    modal.appendChild(content)
    document.body.appendChild(modal)
    this.currentModal = modal
    
    // Add event listeners
    const testButton = modal.querySelector('#testCode') as HTMLButtonElement
    const morphButton = modal.querySelector('#morphEdit') as HTMLButtonElement
    const closeButton = modal.querySelector('#closeModal') as HTMLButtonElement
    const codeEditor = modal.querySelector('#codeEditor') as HTMLTextAreaElement
    const testResults = modal.querySelector('#testResults') as HTMLDivElement
    
    testButton.onclick = () => {
      const userCode = codeEditor.value
      const results = this.testCode(userCode, problem)
      this.displayTestResults(results, testResults)
      
      if (results.allPassed) {
        this.stats.challengesSolved++
        this.updateStats()
        target.destroy() // Remove target when solved
        setTimeout(() => {
          this.closeModal()
          // Check if all challenges are completed
          if (this.stats.challengesSolved >= this.codingProblems.length) {
            this.showEndGameScreen()
          }
        }, 2000)
      }
    }
    
    morphButton.onclick = () => {
      this.morphEdit(problem, codeEditor, testResults)
    }
    
    closeButton.onclick = () => {
      this.closeModal()
    }
  }

  private testCode(userCode: string, problem: any) {
    const results = { passed: 0, total: problem.testCases.length, allPassed: false, details: [] as any[] }
    
    try {
      // Create function from user code
      const func = new Function('return ' + userCode)()
      
      for (const testCase of problem.testCases) {
        try {
          // Make a copy of input for in-place functions
          const inputCopy = JSON.parse(JSON.stringify(testCase.input))
          const result = func(...inputCopy)
          
          // For reverseString, check the modified input array
          let actualResult = result
          if (problem.title === 'Reverse String' && inputCopy.length > 0) {
            actualResult = inputCopy[0] // The modified array
          }
          
          const passed = JSON.stringify(actualResult) === JSON.stringify(testCase.expected)
          
          results.details.push({
            input: testCase.input,
            expected: testCase.expected,
            actual: actualResult,
            passed
          })
          
          if (passed) results.passed++
        } catch (error) {
          results.details.push({
            input: testCase.input,
            expected: testCase.expected,
            actual: `Error: ${error}`,
            passed: false
          })
        }
      }
    } catch (error) {
      results.details.push({
        input: 'Code compilation',
        expected: 'Valid function',
        actual: `Error: ${error}`,
        passed: false
      })
    }
    
    results.allPassed = results.passed === results.total
    return results
  }

  private displayTestResults(results: any, container: HTMLDivElement) {
    container.style.display = 'block'
    
    if (results.allPassed) {
      container.style.background = '#d4edda'
      container.style.color = '#155724'
      container.innerHTML = `<strong>✅ All tests passed! (${results.passed}/${results.total})</strong>`
    } else {
      container.style.background = '#f8d7da'
      container.style.color = '#721c24'
      container.innerHTML = `<strong>❌ ${results.passed}/${results.total} tests passed</strong>`
      
      results.details.forEach((detail: any, index: number) => {
        const testDiv = document.createElement('div')
        testDiv.style.marginTop = '10px'
        testDiv.innerHTML = `
          <strong>Test ${index + 1}:</strong> ${detail.passed ? '✅' : '❌'}<br>
          Input: ${JSON.stringify(detail.input)}<br>
          Expected: ${JSON.stringify(detail.expected)}<br>
          Actual: ${JSON.stringify(detail.actual)}
        `
        container.appendChild(testDiv)
      })
    }
  }

  private async morphEdit(problem: any, codeEditor: HTMLTextAreaElement, testResults: HTMLDivElement) {
    console.log('Using Morph Edit for:', problem.title)
    
    // Show loading state
    testResults.style.display = 'block'
    testResults.style.background = '#d1ecf1'
    testResults.style.color = '#0c5460'
    testResults.innerHTML = '🤖 Morph AI is analyzing your code...'
    
    try {
      const response = await fetch('/api/morph', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problem: {
            title: problem.title,
            description: problem.description,
            solution: problem.solution
          },
          userCode: codeEditor.value
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Update code editor with improved code
        codeEditor.value = data.improvedCode
        testResults.innerHTML = `✨ ${data.message}`
        
        this.stats.morphCredits++
        this.updateStats()
      } else {
        throw new Error('API request failed')
      }
      
    } catch (error) {
      console.error('Morph API error:', error)
      
      // Fallback to pre-written solution
      codeEditor.value = problem.solution
      testResults.innerHTML = '⚠️ Morph AI provided a fallback solution (API issue detected)'
      
      this.stats.morphCredits++
      this.updateStats()
    }
  }

  private closeModal() {
    if (this.currentModal) {
      document.body.removeChild(this.currentModal)
      this.currentModal = null
    }
    this.scene.resume()
  }







  private showEndGameScreen() {
    console.log('All challenges completed! Showing end game screen.')
    
    // Play victory sound
    soundAssets.playSound('powerUp', 0.8)
    
    // Create end game overlay
    const overlay = this.add.rectangle(600, 300, 1200, 600, 0x000000, 0.8)
    overlay.setDepth(1000)
    
    // Add congratulations text
    const congratsText = this.add.text(600, 200, 'CONGRATULATIONS!', {
      fontSize: '48px',
      color: '#00FF00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(1001)
    
    const completedText = this.add.text(600, 260, 'All Coding Challenges Completed!', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(1001)
    
    const statsText = this.add.text(600, 320, 
      `Final Stats:\n` +
      `Targets Hit: ${this.stats.targetsHit}\n` +
      `Challenges Solved: ${this.stats.challengesSolved}\n` +
      `Morph Credits Earned: ${this.stats.morphCredits}`, {
      fontSize: '18px',
      color: '#FFFFFF',
      align: 'center'
    }).setOrigin(0.5).setDepth(1001)
    
    // Add Back to Menu button
    const backToMenuButton = this.add.rectangle(600, 450, 200, 50, 0x4CAF50)
      .setDepth(1001)
      .setInteractive({ useHandCursor: true })
    
    const backToMenuText = this.add.text(600, 450, 'BACK TO MENU', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(1002)
    
    // Add button hover effects
    backToMenuButton.on('pointerover', () => {
      backToMenuButton.setFillStyle(0x45a049)
      backToMenuText.setScale(1.1)
    })
    
    backToMenuButton.on('pointerout', () => {
      backToMenuButton.setFillStyle(0x4CAF50)
      backToMenuText.setScale(1.0)
    })
    
    // Handle back to menu click
    backToMenuButton.on('pointerdown', () => {
      console.log('Back to Menu clicked')
      soundAssets.playSound('shoot', 0.3) // Button click sound
      this.scene.start('MenuScene')
    })
    
    // Add sparkle effects
    for (let i = 0; i < 20; i++) {
      const sparkle = this.add.circle(
        Phaser.Math.Between(100, 1100),
        Phaser.Math.Between(100, 500),
        3,
        0xFFD700
      ).setDepth(1001)
      
      this.tweens.add({
        targets: sparkle,
        alpha: 0,
        scale: 2,
        duration: Phaser.Math.Between(1000, 2000),
        repeat: -1,
        yoyo: true
      })
    }
  }
}
