'use client'

import { useEffect, useRef, useState } from 'react'
import { useChainjumpSetScore, useChainjumpLeaderboard, useChainjumpMyGameData } from '../smartcontracthooks'
import { useAccount } from 'wagmi'
import { useFrame } from '../components/farcaster-provider'
import Leaderboard from './Leaderboard'
import CustomModal from './CustomModal'
import LoadingSpinner from './LoadingSpinner'
import styles from './SpaceJumpGame.module.css'
import { APP_URL } from '../lib/constants'

export default function SpaceJumpGame() {
  const gameInitialized = useRef(false)
  const gameInstanceRef = useRef<any>(null)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showHowToPlay, setShowHowToPlay] = useState(false)
  const [isSubmittingScore, setIsSubmittingScore] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [gameScriptLoaded, setGameScriptLoaded] = useState(false)
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const currentScoreRef = useRef(0)
  
  // Modal states
  const [modal, setModal] = useState<{
    isVisible: boolean
    title: string
    message: string
    type: 'info' | 'success' | 'error' | 'confirm'
    onConfirm?: () => void
    onCancel?: () => void
  }>({
    isVisible: false,
    title: '',
    message: '',
    type: 'info'
  })
  
  const { address, isConnected } = useAccount()
  const { context, actions } = useFrame()
  
  
  // New Chainjump hooks
  const { setScore, isPending, isSuccess, error } = useChainjumpSetScore()
  const { leaderboard, isLoading: leaderboardLoading, totalUsers } = useChainjumpLeaderboard(20)
  const { myScore, myRank, hasScore, isLoading: myDataLoading, username, fid, pfp } = useChainjumpMyGameData()

  // Success callback for score submission
  useEffect(() => {
    if (isSuccess) {
      setSubmissionStatus('success')
      setIsSubmittingScore(false)
      
      // Show success for 2 seconds, then show leaderboard
      setTimeout(() => {
        setSubmissionStatus('idle')
        setShowLeaderboard(true)
      }, 2000)
    }
  }, [isSuccess])

  // Error callback for score submission
  useEffect(() => {
    if (error) {
      console.error('Error submitting score:', error)
      setSubmissionStatus('error')
      setIsSubmittingScore(false)
      
      // Show error modal
      setModal({
        isVisible: true,
        title: 'Transaction Failed',
        message: `Failed to submit score: ${error.message}`,
        type: 'error'
      })
      
      // Reset status after showing modal
      setTimeout(() => {
        setSubmissionStatus('idle')
      }, 3000)
    }
  }, [error])

  const handleSubmitScore = async () => {
    // Reset status if retrying after error
    if (submissionStatus === 'error') {
      setSubmissionStatus('idle')
    }

    // Enhanced wallet connection checks
    if (!isConnected) {
      setModal({
        isVisible: true,
        title: 'Wallet Connection Required',
        message: 'You must connect your wallet to submit scores to the blockchain. Please connect your wallet using the wallet connection panel above and try again.',
        type: 'info'
      })
      return
    }

    if (!address) {
      setModal({
        isVisible: true,
        title: 'Wallet Address Error',
        message: 'Your wallet address could not be detected. Please disconnect and reconnect your wallet, then try again.',
        type: 'error'
      })
      return
    }

    const finalScore = parseInt(document.getElementById('finalScore')?.textContent || '0')
    if (finalScore <= 0) {
      setModal({
        isVisible: true,
        title: 'Invalid Score',
        message: 'Invalid score detected! Please play the game and achieve a score greater than 0 before submitting.',
        type: 'error'
      })
      return
    }

    // Get user profile data from Farcaster context
    const userUsername = context?.user?.username || 'Anonymous'
    const userFid = context?.user?.fid || 0
    const userPfp = context?.user?.pfpUrl || ''

    // Log context for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Farcaster context:', context)
      console.log('User profile data:', { userUsername, userFid, userPfp })
    }

    // Show confirmation dialog with wallet info
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
    setModal({
      isVisible: true,
      title: 'Confirm Score Submission',
      message: `Submit your score of ${finalScore} to the blockchain?\n\nWallet: ${shortAddress}\nUsername: ${userUsername}\nFID: ${userFid}\nNetwork: Arbitrum \n\nThis will require a transaction fee (gas).`,
      type: 'confirm',
      onConfirm: async () => {
        setIsSubmittingScore(true)
        setSubmissionStatus('loading')
        try {
          await setScore(finalScore, userUsername, userFid, userPfp)
        } catch (error) {
          console.error('Error submitting score:', error)
          setIsSubmittingScore(false)
          setSubmissionStatus('error')
        }
      },
      onCancel: () => {
        // Do nothing, just close modal
      }
    })
  }

  const handleShareScore = async () => {
    const finalScore = parseInt(document.getElementById('finalScore')?.textContent || '0')

    if (finalScore <= 0) {
      setModal({
        isVisible: true,
        title: 'No Score to Share',
        message: 'Play the game first to get a score worth sharing!',
        type: 'info'
      })
      return
    }

    try {
      if (actions?.composeCast) {
        await actions.composeCast({
          text: `I scored ${finalScore} in ArbJump! 🚀 Beat my score and earn real $ARB tokens! 💰\n\nPlay now: ${APP_URL}`
        })
      } else {
        setModal({
          isVisible: true,
          title: 'Share Not Available',
          message: 'Sharing is only available in Farcaster clients that support it.',
          type: 'info'
        })
      }
    } catch (error) {
      console.error('Error sharing score:', error)
      setModal({
        isVisible: true,
        title: 'Share Failed',
        message: 'Could not share your score. Please try again later.',
        type: 'error'
      })
    }
  }

  const closeModal = () => {
    setModal(prev => ({ ...prev, isVisible: false }))
  }

  const handleExitGame = (gameInstance?: any) => {
    console.log('Exit game function called')
    
    // First, try to use the game's built-in exit function if available
    if (gameInstance && typeof gameInstance.exitGame === 'function') {
      console.log('Using game instance exitGame method')
      gameInstance.exitGame()
    } else {
      console.log('Using fallback exit method')
      // Fallback: manually show start screen and hide game over screen
      const startScreen = document.getElementById('startScreen')
      const gameOverScreen = document.getElementById('gameOver')
      const gameCanvas = document.getElementById('gameCanvas')
      
      if (startScreen) {
        startScreen.style.display = 'flex'
        console.log('Start screen shown')
      }
      if (gameOverScreen) {
        gameOverScreen.style.display = 'none'
        console.log('Game over screen hidden')
      }
      if (gameCanvas) {
        gameCanvas.style.display = 'none'
        console.log('Game canvas hidden')
      }
      
      // Reset game state if possible
      if (gameInstance && gameInstance.gameState) {
        gameInstance.gameState = 'start'
        console.log('Game state reset to start')
      }
    }
    
    // Reset any submission states
    setSubmissionStatus('idle')
    setIsSubmittingScore(false)
    setShowLeaderboard(false)
    
    // Force a page refresh to return to the main home page
    // This ensures we go back to the Farcaster prompt or main app screen
    console.log('Refreshing page to return to home')
    window.location.reload()
  }

  const setupGameEventListeners = (gameInstance: any) => {
    // Store gameInstance in ref for React onClick handlers
    gameInstanceRef.current = gameInstance

    console.log('🔧 Setting up game event listeners...', { gameInstance })
    console.log('🔧 Available game methods:', Object.getOwnPropertyNames(gameInstance))
    console.log('🔧 Game startGame method:', typeof gameInstance.startGame)
    console.log('🔧 gameInstanceRef after setup:', gameInstanceRef.current)

    // Verify that our ref is properly set
    if (gameInstanceRef.current === gameInstance) {
      console.log('✅ gameInstanceRef properly set')
    } else {
      console.error('❌ gameInstanceRef not properly set')
    }

    // Wait a bit longer for DOM elements to be ready
    setTimeout(() => {
      // Submit Score button (our new functionality)
      const submitScoreBtn = document.getElementById('submitScoreBtn')
      console.log('Submit score button found:', !!submitScoreBtn)
      if (submitScoreBtn) {
        submitScoreBtn.onclick = (e) => {
          console.log('Submit score button clicked')
          e.preventDefault()
          handleSubmitScore()
        }
        submitScoreBtn.addEventListener('click', (e) => {
          console.log('Submit score button click event')
          e.preventDefault()
        })
      }

      // Game Over screen buttons
      const playBtn = document.getElementById('playBtn')
      console.log('Play button found:', !!playBtn, 'Game restart method:', !!gameInstance?.restartGame)
      if (playBtn && gameInstance && typeof gameInstance.restartGame === 'function') {
        playBtn.onclick = (e) => {
          console.log('Play again button clicked')
          e.preventDefault()
          gameInstance.restartGame()
        }
      } else if (playBtn) {
        // Fallback: try to restart game manually
        playBtn.onclick = (e) => {
          console.log('Play again button clicked (fallback)')
          e.preventDefault()
          // Show start screen and hide game over screen
          const startScreen = document.getElementById('startScreen')
          const gameOverScreen = document.getElementById('gameOver')
          if (startScreen) startScreen.style.display = 'flex'
          if (gameOverScreen) gameOverScreen.style.display = 'none'
          // Reset game state if possible
          if (gameInstance && gameInstance.gameState) {
            gameInstance.gameState = 'start'
          }
        }
      }

      const topScorerBtn = document.getElementById('topScorerBtn')
      console.log('Top scorer button found:', !!topScorerBtn)
      if (topScorerBtn) {
        topScorerBtn.onclick = (e) => {
          console.log('Top scorer button clicked')
          e.preventDefault()
          console.log('Setting showLeaderboard to true')
          setShowLeaderboard(true)
          console.log('showLeaderboard state should now be true')
        }
        // Also add a click event listener as backup
        topScorerBtn.addEventListener('click', (e) => {
          console.log('Top scorer button click event listener triggered')
          e.preventDefault()
          setShowLeaderboard(true)
        })
      }

      const exitBtn = document.getElementById('exitBtn')
      console.log('Exit button found:', !!exitBtn)
      if (exitBtn) {
        exitBtn.onclick = (e) => {
          console.log('Exit button clicked')
          e.preventDefault()
          handleExitGame(gameInstance)
        }
      }

      // Start screen buttons
      const startPlayBtn = document.getElementById('startPlayBtn')
      console.log('Start play button found:', !!startPlayBtn, 'Game start method:', !!gameInstance?.startGame)
      if (startPlayBtn && gameInstance && typeof gameInstance.startGame === 'function') {
        startPlayBtn.onclick = (e) => {
          console.log('Start play button clicked')
          e.preventDefault()
          gameInstance.startGame()
        }
      }

      const startLeaderboardBtn = document.getElementById('startLeaderboardBtn')
      console.log('Start leaderboard button found:', !!startLeaderboardBtn)
      if (startLeaderboardBtn) {
        startLeaderboardBtn.onclick = (e) => {
          console.log('Start leaderboard button clicked')
          e.preventDefault()
          setShowLeaderboard(true)
        }
      }

      const howToPlayBtn = document.getElementById('howToPlayBtn')
      console.log('How to play button found:', !!howToPlayBtn)
      if (howToPlayBtn) {
        howToPlayBtn.onclick = (e) => {
          console.log('How to play button clicked')
          e.preventDefault()
          setShowHowToPlay(true)
        }
      }

      const startExitBtn = document.getElementById('startExitBtn')
      console.log('Start exit button found:', !!startExitBtn)
      if (startExitBtn) {
        startExitBtn.onclick = (e) => {
          console.log('Start exit button clicked')
          e.preventDefault()
          handleExitGame(gameInstance)
        }
      }

      // Control buttons for left and right movement
      const leftBtn = document.getElementById('leftBtn')
      const rightBtn = document.getElementById('rightBtn')
      console.log('Control buttons found:', { leftBtn: !!leftBtn, rightBtn: !!rightBtn })

      if (leftBtn && gameInstance && gameInstance.keys) {
        // Touch controls for left button
        leftBtn.addEventListener('touchstart', (e) => {
          console.log('Left button touch start')
          e.preventDefault()
          gameInstance.keys['ArrowLeft'] = true
        })
        leftBtn.addEventListener('touchend', (e) => {
          console.log('Left button touch end')
          e.preventDefault()
          gameInstance.keys['ArrowLeft'] = false
        })

        // Mouse controls for left button
        leftBtn.addEventListener('mousedown', () => {
          console.log('Left button mouse down')
          gameInstance.keys['ArrowLeft'] = true
        })
        leftBtn.addEventListener('mouseup', () => {
          console.log('Left button mouse up')
          gameInstance.keys['ArrowLeft'] = false
        })
      }

      if (rightBtn && gameInstance && gameInstance.keys) {
        // Touch controls for right button
        rightBtn.addEventListener('touchstart', (e) => {
          console.log('Right button touch start')
          e.preventDefault()
          gameInstance.keys['ArrowRight'] = true
        })
        rightBtn.addEventListener('touchend', (e) => {
          console.log('Right button touch end')
          e.preventDefault()
          gameInstance.keys['ArrowRight'] = false
        })

        // Mouse controls for right button
        rightBtn.addEventListener('mousedown', () => {
          console.log('Right button mouse down')
          gameInstance.keys['ArrowRight'] = true
        })
        rightBtn.addEventListener('mouseup', () => {
          console.log('Right button mouse up')
          gameInstance.keys['ArrowRight'] = false
        })
      }

      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ All game button event listeners configured')
        console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(gameInstance)))
      }
    }, 200) // Increased delay to ensure DOM is fully ready
  }

  // Asset preloader function
  const preloadAssets = () => {
    return new Promise<void>((resolve) => {
      const assets = [
        '/astronaut.png',
        '/bg.png',
        '/bg2.png',
        '/coin.png',
        '/coins.mp3',
        '/coins2.mp3'
      ]

      let loadedCount = 0
      const totalAssets = assets.length

      const updateProgress = () => {
        loadedCount++
        const progress = Math.round((loadedCount / totalAssets) * 100)
        setLoadingProgress(progress)

        if (loadedCount === totalAssets) {
          setAssetsLoaded(true)
          resolve()
        }
      }

      assets.forEach(src => {
        if (src.endsWith('.mp3')) {
          const audio = new Audio(src)
          audio.addEventListener('canplaythrough', updateProgress, { once: true })
          audio.addEventListener('error', updateProgress, { once: true })
          audio.load()
        } else {
          const img = new Image()
          img.onload = updateProgress
          img.onerror = updateProgress
          img.src = src
        }
      })
    })
  }

  useEffect(() => {
    if (gameInitialized.current) return
    gameInitialized.current = true

    // First preload assets, then load game
    preloadAssets().then(() => {
      // Load the game engine script
      const script = document.createElement('script')
      script.src = '/game-engine.js'
    script.onload = () => {
      // Check if the game class is available
      if (!(window as any).SpaceJumpGameClass) {
        console.error('SpaceJumpGameClass not found. Game engine may not have loaded properly.')
        setGameScriptLoaded(false)
        return
      }

      try {
        // Initialize the game when script is loaded
        const GameClass = (window as any).SpaceJumpGameClass
        console.log('Game class found:', GameClass)

        if (!GameClass) {
          console.error('SpaceJumpGameClass is not defined after script load')
          setGameScriptLoaded(false)
          return
        }

        setGameScriptLoaded(true)

        const gameInstance = new GameClass()
        console.log('✅ Game instance created:', gameInstance)
        console.log('✅ Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(gameInstance)))

        // Store the game instance in multiple places for reliability
        gameInstanceRef.current = gameInstance
        ;(window as any).gameInstance = gameInstance

        // Also store on the button element as additional fallback
        setTimeout(() => {
          const startPlayBtn = document.getElementById('startPlayBtn')
          if (startPlayBtn) {
            ;(startPlayBtn as any).gameInstance = gameInstance
            console.log('✅ Game instance stored on button element')
          }
        }, 50)

        // Set up event listeners for our buttons after a short delay
        // to ensure all DOM elements are ready
        setTimeout(() => {
          setupGameEventListeners(gameInstance)

          // Add share score functionality to game
          ;(window as any).shareScore = handleShareScore

          console.log('✅ Game initialization complete')
        }, 100)
               } catch (error) {
           console.error('Error initializing game:', error)
           console.error('Error details:', {
             message: error instanceof Error ? error.message : 'Unknown error',
             stack: error instanceof Error ? error.stack : 'No stack trace'
           })
         }
    }
    script.onerror = () => {
        console.error('Failed to load game engine script')
      }
      document.head.appendChild(script)

      return () => {
        // Cleanup
        const existingScript = document.querySelector('script[src="/game-engine.js"]')
        if (existingScript) {
          existingScript.remove()
        }
      }
    }).catch((error) => {
      console.error('Asset preloading failed:', error)
      setAssetsLoaded(true) // Continue anyway
    })
  }, [])

  // Set up button event listeners immediately after mount
  useEffect(() => {
    const setupButtonListeners = () => {
      // Leaderboard button
      const startLeaderboardBtn = document.getElementById('startLeaderboardBtn')
      if (startLeaderboardBtn) {
        startLeaderboardBtn.onclick = (e) => {
          console.log('Start leaderboard button clicked')
          e.preventDefault()
          setShowLeaderboard(true)
        }
      }

      // How to Play button
      const howToPlayBtn = document.getElementById('howToPlayBtn')
      if (howToPlayBtn) {
        howToPlayBtn.onclick = (e) => {
          console.log('How to play button clicked')
          e.preventDefault()
          setShowHowToPlay(true)
        }
      }
    }

    // Set up listeners immediately
    setupButtonListeners()

    // Also set up after a small delay to ensure DOM is ready
    const timer = setTimeout(setupButtonListeners, 100)

    return () => clearTimeout(timer)
  }, [])

  // Show loading screen while assets are loading
  if (!assetsLoaded) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingIcon}>
            <div className={styles.astronaut}></div>
          </div>
          <h2 className={styles.loadingTitle}>Loading ArbJump</h2>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <p className={styles.loadingText}>{loadingProgress}% - Loading game assets...</p>
        </div>
      </div>
    )
  }

  return (
    <div id="gameContainer" className={styles.gameContainer}>
      <canvas id="gameCanvas" className={styles.gameCanvas}></canvas>
      

      
      <div id="ui" className={styles.ui}>
        <div id="score" className={styles.score}>0</div>
        
        <div id="controls" className={styles.controls}>
          <div className={`${styles.controlBtn} ${styles.leftBtn}`} id="leftBtn"></div>
          <div className={`${styles.controlBtn} ${styles.rightBtn}`} id="rightBtn"></div>
        </div>
        
        <div id="gameOver" className={styles.gameOver}>
          <h2>Game Over!</h2>
          <p>Your Score: <span id="finalScore">0</span></p>
          
          {/* Show current user stats if available */}
          {hasScore && (
            <div className={styles.currentStats}>
              {/* <p>🏆 Your Best: {myScore}</p> */}
              <p>📊 Rank: #{myRank}</p>
            </div>
          )}
          
          <div className={styles.gameOverButtons}>
            <button 
              id="playBtn" 
              className={styles.actionBtn}
              onClick={(e) => {
                console.log('Play again button clicked via React onClick')
                e.preventDefault()
                e.stopPropagation()
                if (gameInstanceRef.current && typeof gameInstanceRef.current.restartGame === 'function') {
                  gameInstanceRef.current.restartGame()
                } else {
                  // Fallback: manually restart game
                  const startScreen = document.getElementById('startScreen')
                  const gameOverScreen = document.getElementById('gameOver')
                  if (startScreen) startScreen.style.display = 'flex'
                  if (gameOverScreen) gameOverScreen.style.display = 'none'
                  if (gameInstanceRef.current && gameInstanceRef.current.gameState) {
                    gameInstanceRef.current.gameState = 'start'
                  }
                }
              }}
            >
              Play Again
            </button>
            <button
              id="submitScoreBtn"
              className={`${styles.actionBtn} ${submissionStatus === 'success' ? styles.successBtn : ''} ${submissionStatus === 'error' ? styles.errorBtn : ''}`}
              disabled={isSubmittingScore || !isConnected}
              onClick={(e) => {
                console.log('Submit score button clicked via React onClick')
                e.preventDefault()
                e.stopPropagation()
                handleSubmitScore()
              }}
            >
              <div className={styles.buttonContent}>
                {submissionStatus === 'loading' && <LoadingSpinner size="small" color="#fff" />}
                {submissionStatus === 'success' && <span className={styles.successIcon}>✓</span>}
                {submissionStatus === 'error' && <span className={styles.errorIcon}>✗</span>}
                <span className={styles.buttonText}>
                  {submissionStatus === 'loading' && 'Submitting...'}
                  {submissionStatus === 'success' && 'Score Submitted!'}
                  {submissionStatus === 'error' && 'Failed - Retry'}
                  {submissionStatus === 'idle' && (isConnected ? `Submit Score` : '🔌 Connect Wallet')}
                </span>
              </div>
            </button>
            <button
              id="shareScoreBtn"
              className={`${styles.actionBtn} ${styles.shareBtn}`}
              onClick={(e) => {
                console.log('Share score button clicked via React onClick')
                e.preventDefault()
                e.stopPropagation()
                handleShareScore()
              }}
            >
              📤 Share
            </button>
            <button
              id="topScorerBtn"
              className={styles.actionBtn}
              onClick={(e) => {
                console.log('Top scorer button clicked via React onClick')
                e.preventDefault()
                e.stopPropagation()
                setShowLeaderboard(true)
              }}
            >
              Leaderboard
            </button>
            <button 
              id="exitBtn" 
              className={styles.actionBtn}
              onClick={(e) => {
                console.log('Exit button clicked via React onClick')
                e.preventDefault()
                e.stopPropagation()
                handleExitGame(gameInstanceRef.current)
              }}
            >
              Exit
            </button>
          </div>
          
          {submissionStatus === 'success' && (
            <div className={styles.successMessage}>
              🎉 Score successfully recorded on the blockchain!
            </div>
          )}
        </div>
        
        <div id="startScreen" className={styles.startScreen}>
          <h1 className="jersey25-font">ArbJump</h1>
          
          {/* Enhanced wallet connection info on start screen */}
          <div className={styles.startWalletInfo}>
            <div className={styles.walletStatus}>
              {isConnected ? (
                <div className={styles.connectedInfo}>
                  {/* <span className={styles.connectedIcon}>✅</span> */}
                  <span>Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
                  {username && <span>User: {username}</span>}
                  {fid && <span>FID: {fid}</span>}
                </div>
              ) : (
                <div className={styles.disconnectedInfo}>
                  <span className={styles.disconnectedIcon}>⚠️</span>
                  <span>Connect wallet above to save scores</span>
                </div>
              )}
            </div>
            
            {/* Show current user stats if available */}
            {hasScore && !myDataLoading && (
              <div className={styles.userStats}>
                {/* <div className={styles.statItem}>
                  <span className={styles.statLabel}>Best Score:</span>
                  <span className={styles.statValue}>{myScore}</span>
                </div> */}
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Rank:</span>
                  <span className={styles.statValue}>#{myRank}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Total Players:</span>
                  <span className={styles.statValue}>{totalUsers}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.startButtons}>
            <button
              id="startPlayBtn"
              className={styles.startBtn}
            >
              <div className={styles.buttonContent}>
                <span className={styles.buttonIcon}>🎮</span>
                <span className={styles.buttonText}>PLAY NOW</span>
              </div>
            </button>
            <button
              id="startLeaderboardBtn"
              className={styles.startBtn}
            >
              <div className={styles.buttonContent}>
                <span className={styles.buttonIcon}>🏆</span>
                <span className={styles.buttonText}>LEADERBOARD</span>
              </div>
            </button>
            <button
              id="howToPlayBtn"
              className={styles.startBtn}
            >
              <div className={styles.buttonContent}>
                <span className={styles.buttonIcon}>❓</span>
                <span className={styles.buttonText}>HOW TO PLAY</span>
              </div>
            </button>
            {/* <button id="startExitBtn" className={styles.startBtn}>
              <img src="/exit.svg" alt="Exit Game" style={{ width: '200px', height: '88px', objectFit: 'contain' }} />
            </button> */}
          </div>
        </div>
      </div>
      
      {/* Debug leaderboard state */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div style={{ position: 'fixed', top: '10px', left: '10px', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px', zIndex: 9999, fontSize: '12px' }}>
          <div>showLeaderboard: {showLeaderboard ? 'true' : 'false'}</div>
          <div>leaderboardLoading: {leaderboardLoading ? 'true' : 'false'}</div>
          <div>leaderboard length: {leaderboard?.length || 0}</div>
          
        </div>
      )} */}
      
      <Leaderboard
        isVisible={showLeaderboard}
        onClose={() => {
          console.log('Leaderboard close button clicked')
          setShowLeaderboard(false)
        }}
        isUpdating={isSubmittingScore}
        leaderboardData={leaderboard}
        isLoading={leaderboardLoading}
        totalUsers={totalUsers}
        myRank={myRank}
        myScore={myScore}
      />

      {/* How to Play Modal */}
      {showHowToPlay && (
        <div className={styles.overlay}>
          <div className={styles.howToPlayModal}>
            <div className={styles.header}>
              <h2 className="jersey25-font">How to Play</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowHowToPlay(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.gameRules}>
                <h3>🎮 How to Play</h3>
                <ul>
                  <li>Use ← → arrow keys or tap the control buttons to move your character</li>
                  <li>Jump on platforms to reach higher levels and avoid falling</li>
                  <li>Collect coins scattered throughout the levels to increase your score</li>
                  <li>The higher you climb, the more points you earn</li>
                  <li>Avoid falling off the bottom of the screen - game over!</li>
                  <li>Try to reach the highest score possible and compete with others</li>
                </ul>
              </div>

              <div className={styles.earnMoney}>
                <h3>💰 Collect Coins, Earn Real Money on ARBITRUM</h3>
                <p>
                  <strong>Play ArbJump and earn real $ARB cryptocurrency!</strong>
                </p>
                <ul>
                  <li>🎯 <strong>Collect coins</strong> in-game to build your score</li>
                  <li>🏆 <strong>Submit high scores</strong> to compete on the leaderboard</li>
                  <li>💎 <strong>Top players win real $ARB tokens</strong> distributed weekly</li>
                  <li>⚡ <strong>Powered by Arbitrum</strong> - fast, secure blockchain transactions</li>
                  <li>🔒 <strong>Connect your wallet</strong> to save scores and receive winnings</li>
                  <li>🎪 <strong>Fair competition</strong> - all scores recorded on-chain</li>
                </ul>
              </div>

              <div className={styles.getStarted}>
                <h3>🚀 Start Earning Now</h3>
                <p>
                  <strong>Ready to earn real cryptocurrency?</strong><br/>
                  1. Connect your Arbitrum-compatible wallet<br/>
                  2. Play ArbJump and collect as many coins as possible<br/>
                  3. Submit your high scores to the blockchain leaderboard<br/>
                  4. Compete with players worldwide for $ARB prizes!<br/>
                  5. Weekly payouts to top performers
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <CustomModal
        isVisible={modal.isVisible}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
        onClose={closeModal}
        confirmText={modal.type === 'confirm' ? 'Submit' : 'OK'}
        cancelText="Cancel"
      />
    </div>
  )
}
