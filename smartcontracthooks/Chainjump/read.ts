import { useReadContract, useAccount } from 'wagmi'
import contractConfig from '../../lib/contract'

export interface UserScore {
  user: string
  score: bigint
  username?: string
  fid?: bigint
  pfp?: string
}

export interface UserProfile {
  user: string
  score: bigint
  username?: string
  fid?: bigint
  pfp?: string
}

export interface LeaderboardEntry {
  user: string
  score: number
  rank?: number
  username?: string
  fid?: number
  pfp?: string
}

// Read Hooks for Chainjump Contract
export const useChainjumpGetAllScores = () => {
  return useReadContract({
    address: contractConfig.Chainjump.contractAddress as `0x${string}`,
    abi: contractConfig.Chainjump.abi,
    functionName: 'getAllScoresDescending',
  })
}

export const useChainjumpGetMyProfile = () => {
  return useReadContract({
    address: contractConfig.Chainjump.contractAddress as `0x${string}`,
    abi: contractConfig.Chainjump.abi,
    functionName: 'getMyProfile',
  }) as {
    data: UserProfile | undefined
    isLoading: boolean
    error: any
  }
}

export const useChainjumpGetMyScore = () => {
  const { address } = useAccount()
  return useReadContract({
    address: contractConfig.Chainjump.contractAddress as `0x${string}`,
    abi: contractConfig.Chainjump.abi,
    functionName: 'getScore',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  })
}

export const useChainjumpGetScore = (userAddress: string) => {
  return useReadContract({
    address: contractConfig.Chainjump.contractAddress as `0x${string}`,
    abi: contractConfig.Chainjump.abi,
    functionName: 'getScore',
    args: [userAddress as `0x${string}`],
    query: {
      enabled: !!userAddress,
    },
  })
}

export const useChainjumpGetTopScores = (limit: number) => {
  return useReadContract({
    address: contractConfig.Chainjump.contractAddress as `0x${string}`,
    abi: contractConfig.Chainjump.abi,
    functionName: 'getTopScores',
    args: [BigInt(limit)],
  })
}

export const useChainjumpGetTotalUsers = () => {
  return useReadContract({
    address: contractConfig.Chainjump.contractAddress as `0x${string}`,
    abi: contractConfig.Chainjump.abi,
    functionName: 'getTotalUsers',
  })
}

export const useChainjumpGetUserRank = (userAddress: string) => {
  return useReadContract({
    address: contractConfig.Chainjump.contractAddress as `0x${string}`,
    abi: contractConfig.Chainjump.abi,
    functionName: 'getUserRank',
    args: [userAddress as `0x${string}`],
    query: {
      enabled: !!userAddress,
    },
  })
}

export const useChainjumpHasProfile = (userAddress: string) => {
  return useReadContract({
    address: contractConfig.Chainjump.contractAddress as `0x${string}`,
    abi: contractConfig.Chainjump.abi,
    functionName: 'hasProfile',
    args: [userAddress as `0x${string}`],
    query: {
      enabled: !!userAddress,
    },
  })
}

export const useChainjumpGetUserProfile = (userAddress: string) => {
  return useReadContract({
    address: contractConfig.Chainjump.contractAddress as `0x${string}`,
    abi: contractConfig.Chainjump.abi,
    functionName: 'getUserProfile',
    args: [userAddress as `0x${string}`],
    query: {
      enabled: !!userAddress,
    },
  })
}

export const useChainjumpGetUserByFid = (fid: number) => {
  return useReadContract({
    address: contractConfig.Chainjump.contractAddress as `0x${string}`,
    abi: contractConfig.Chainjump.abi,
    functionName: 'getUserByFid',
    args: [BigInt(fid)],
    query: {
      enabled: !!fid,
    },
  })
}

// Utility hook for Chainjump leaderboard data
export const useChainjumpLeaderboard = (limit: number = 10) => {
  const { data: topScores, isLoading, error, refetch } = useChainjumpGetTopScores(limit)
  const { data: totalUsers } = useChainjumpGetTotalUsers()

  console.log("🔍 Chainjump Leaderboard data:", { topScores, totalUsers, error });

  const leaderboardData: LeaderboardEntry[] = Array.isArray(topScores)
    ? topScores.map((entry: any, index: number) => ({
        user: entry.user,
        score: Number(entry.score),
        rank: index + 1,
        username: entry.username,
        fid: entry.fid ? Number(entry.fid) : undefined,
        pfp: entry.pfp,
      }))
    : []

  return {
    leaderboard: leaderboardData,
    isLoading,
    error,
    refetch,
    totalUsers: totalUsers ? Number(totalUsers) : 0,
  }
}

// Hook for Chainjump current user's game data
export const useChainjumpMyGameData = () => {
  const { address } = useAccount()
  const { data: myProfile, isLoading: profileLoading } = useChainjumpGetMyProfile()
  const { data: myRank, isLoading: rankLoading } = useChainjumpGetUserRank(address || '')
  const { data: hasProfile } = useChainjumpHasProfile(address || '')

  return {
    myScore: (myProfile as UserProfile)?.score ? Number((myProfile as UserProfile).score) : 0,
    myRank: myRank ? Number(myRank) : 0,
    hasScore: hasProfile || false,
    isLoading: profileLoading || rankLoading,
    address,
    username: (myProfile as UserProfile)?.username,
    fid: (myProfile as UserProfile)?.fid ? Number((myProfile as UserProfile).fid) : undefined,
    pfp: (myProfile as UserProfile)?.pfp,
  }
}
