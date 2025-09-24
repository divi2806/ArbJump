'use client'

import { useState, useEffect } from 'react'
import { useChainjumpLeaderboard, useChainjumpMyGameData } from '../smartcontracthooks'
import { useAccount, useChainId } from 'wagmi'
import { arbitrum } from 'wagmi/chains'
import styles from './Leaderboard.module.css'

interface LeaderboardProps {
  isVisible: boolean
  onClose: () => void
  isUpdating?: boolean
  leaderboardData?: any[]
  isLoading?: boolean
  totalUsers?: number
  myRank?: number
  myScore?: number
}

export default function Leaderboard({
  isVisible,
  onClose,
  isUpdating = false,
  leaderboardData,
  isLoading,
  totalUsers,
  myRank,
  myScore
}: LeaderboardProps) {
  const [limit, setLimit] = useState(20)
  const [timeLeft, setTimeLeft] = useState('')
  const { address } = useAccount()
  const chainId = useChainId()
  
  // Use the new Chainjump hooks
  const { 
    leaderboard, 
    isLoading: leaderboardLoading, 
    error: scoresError, 
    refetch: refetchScores 
  } = useChainjumpLeaderboard(limit)
  
  const { 
    myScore: myChainjumpScore, 
    myRank: myChainjumpRank, 
    hasScore, 
    isLoading: myDataLoading,
    username,
    fid,
    pfp
  } = useChainjumpMyGameData()

  // Use passed data if available, otherwise use hook data
  const displayLeaderboard = leaderboardData || leaderboard
  const displayLoading = isLoading || leaderboardLoading
  const displayMyScore = myScore || myChainjumpScore
  const displayMyRank = myRank || myChainjumpRank

  // Debug logging (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Leaderboard Debug:', {
        address,
        chainId,
        expectedChainId: arbitrum.id,
        isCorrectNetwork: chainId === arbitrum.id,
        displayLeaderboard,
        displayLoading,
        scoresError: scoresError?.message,
        displayMyScore,
        displayMyRank,
        hasScore,
        username,
        fid,
        pfp,
        totalUsers,
        limit
      })
    }
  }, [address, chainId, displayLeaderboard, displayLoading, scoresError, displayMyScore, displayMyRank, hasScore, username, fid, pfp, totalUsers, limit])

  useEffect(() => {
    if (isVisible) {
      refetchScores()
    }
  }, [isVisible, refetchScores])

  // Unix-based timer that resets every Sunday at 23:59:59
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()

      // Find next Sunday at 23:59:59
      const nextSunday = new Date(now)
      const daysUntilSunday = (7 - now.getDay()) % 7

      if (daysUntilSunday === 0) {
        // Today is Sunday, check if we're past 23:59:59
        if (now.getHours() === 23 && now.getMinutes() === 59 && now.getSeconds() >= 59) {
          // Move to next Sunday
          nextSunday.setDate(now.getDate() + 7)
        } else {
          // Stay on current Sunday
          nextSunday.setDate(now.getDate())
        }
      } else {
        // Move to next Sunday
        nextSunday.setDate(now.getDate() + daysUntilSunday)
      }

      // Set to end of Sunday (23:59:59)
      nextSunday.setHours(23, 59, 59, 999)

      const remaining = nextSunday.getTime() - now.getTime()

      const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
      const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
      const seconds = Math.floor((remaining % (60 * 1000)) / 1000)

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }

    updateTimer() // Initial call
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.leaderboard}>
        <div className={styles.prizeSection}>
          <div className={styles.tokenLogo}>
            <img src="/token.png" alt="Arbitrum Token" className={styles.tokenImage} />
          </div>
          <div className={styles.prizeInfo}>
            <div className={styles.prizeAmount}>100 $ARB</div>
            <div className={styles.prizeLabel}>Weekly Prize</div>
            <div className={styles.timer}>{timeLeft}</div>
          </div>
        </div>

        <div className={styles.header}>
          <h2 className="jersey25-font">Leaderboard</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        
        {chainId !== arbitrum.id && (
          <div className={styles.networkWarning}>
            <p>Wrong Network</p>
            <p>Please switch to Arbitrum to view scores</p>
          </div>
        )}
        
        {address && (
          <div className={styles.myStats}>
            <h3>Your Stats</h3>
            <div className={styles.userProfile}>
              {pfp && (
                <img 
                  src={pfp} 
                  alt="Profile" 
                  className={styles.profilePic}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
              <div className={styles.userInfo}>
                <div className={styles.username}>
                  {username || 'Anonymous'}
                  {fid && <span className={styles.fid}>@{fid}</span>}
                </div>
                <div className={styles.walletAddress}>
                  {address.slice(0, 6)}...{address.slice(-4)}
                </div>
              </div>
            </div>
           
            {totalUsers && (
              <div className={styles.totalPlayers}>
                Total Players: {totalUsers}
              </div>
            )}
            {scoresError && (
              <div style={{color: '#ff6b6b', fontSize: '12px', marginTop: '5px'}}>
                {scoresError.message}
              </div>
            )}
          </div>
        )}

        <div className={styles.controls}>
          <label>
            Show top:
            <select 
              value={limit} 
              onChange={(e) => setLimit(Number(e.target.value))}
              className={styles.limitSelect}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
          <button 
            onClick={(e) => {
              e.preventDefault()
              refetchScores()
            }} 
            className={styles.refreshBtn}
          >
            Refresh
          </button>
        </div>

        <div className={styles.scoresContainer}>
          {scoresError ? (
            <div className={styles.error}>
              <p>Error loading scores: {scoresError.message}</p>
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  refetchScores()
                }} 
                className={styles.retryBtn}
              >
                Retry
              </button>
            </div>
          ) : displayLoading || isUpdating ? (
            <div className={styles.loading}>
              {isUpdating ? 'Updating scores...' : 'Loading scores...'}
            </div>
          ) : displayLeaderboard && displayLeaderboard.length > 0 ? (
            <div className={styles.scoresList}>
              {displayLeaderboard.map((entry, index) => (
                <div 
                  key={entry.user} 
                  className={`${styles.scoreRow} ${entry.user === address ? styles.myScore : ''}`}
                >
                  <div className={styles.rank}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <div className={styles.playerInfo}>
                    {entry.pfp && (
                      <img 
                        src={entry.pfp} 
                        alt="Profile" 
                        className={styles.playerPic}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    )}
                    <div className={styles.playerDetails}>
                      <div className={styles.playerName}>
                        {entry.username || 'Anonymous'}
                     {/* {entry.fid && <span className={styles.playerFid}>@{entry.fid}</span>} */}
                      </div>
                      <div className={styles.playerAddress}>
                        {entry.user === address ? 'You' : `${entry.user.slice(0, 6)}...${entry.user.slice(-4)}`}
                      </div>
                    </div>
                  </div>
                  <div className={styles.score}>{Number(entry.score).toLocaleString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noScores}>
              No scores yet. Be the first to submit your score!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
