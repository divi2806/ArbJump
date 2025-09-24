'use client'

import { useState, useEffect } from 'react'
import { useChainjumpLeaderboard, useChainjumpMyGameData } from '../smartcontracthooks'
import { useAccount, useChainId } from 'wagmi'
import { base } from 'wagmi/chains'
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
        expectedChainId: base.id,
        isCorrectNetwork: chainId === base.id,
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

  if (!isVisible) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.leaderboard}>
        <div className={styles.header}>
          <h2 className="jersey25-font">Leaderboard</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        
        {chainId !== base.id && (
          <div className={styles.networkWarning}>
            <p>Wrong Network</p>
            <p>Please switch to Base  to view scores</p>
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
