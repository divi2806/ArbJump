import { useWriteContract } from 'wagmi'
import contractConfig from '../../lib/contract'

// Write Hooks for Chainjump Contract
export const useChainjumpSetScore = () => {
  const { data, writeContract, isPending, error, isSuccess } = useWriteContract()

  const setScore = (score: number, username: string, fid: number, pfp: string) => {
    console.log("🔍 Chainjump - Attempting to save score:", score);
    console.log("🔍 Username:", username);
    console.log("🔍 FID:", fid);
    console.log("🔍 PFP:", pfp);
    console.log("🔍 Contract address:", contractConfig.Chainjump.contractAddress);

    try {
      writeContract({
        address: contractConfig.Chainjump.contractAddress as `0x${string}`,
        abi: contractConfig.Chainjump.abi,
        functionName: 'setScore',
        args: [BigInt(score), username, BigInt(fid), pfp],
      })
      console.log("🔍 Chainjump - Write contract called successfully");
    } catch (err) {
      console.error("🔍 Chainjump - Error calling writeContract:", err);
    }
  }

  return {
    setScore,
    isPending,
    isConfirming: isPending,
    isSuccess,
    error,
    hash: data,
  }
}

export const useChainjumpUpdateProfile = () => {
  const { data, writeContract, isPending, error, isSuccess } = useWriteContract()

  const updateProfile = (username: string, fid: number, pfp: string) => {
    console.log("🔍 Chainjump - Attempting to update profile");
    console.log("🔍 Username:", username);
    console.log("🔍 FID:", fid);
    console.log("🔍 PFP:", pfp);
    console.log("🔍 Contract address:", contractConfig.Chainjump.contractAddress);

    try {
      writeContract({
        address: contractConfig.Chainjump.contractAddress as `0x${string}`,
        abi: contractConfig.Chainjump.abi,
        functionName: 'updateProfile',
        args: [username, BigInt(fid), pfp],
      })
      console.log("🔍 Chainjump - Update profile contract called successfully");
    } catch (err) {
      console.error("🔍 Chainjump - Error calling updateProfile:", err);
    }
  }

  return {
    updateProfile,
    isPending,
    isConfirming: isPending,
    isSuccess,
    error,
    hash: data,
  }
}

export const useChainjumpAddScore = () => {
  const { data, writeContract, isPending, error, isSuccess } = useWriteContract()

  const addScore = (score: number) => {
    console.log("🔍 Chainjump - Attempting to add score:", score);
    console.log("🔍 Contract address:", contractConfig.Chainjump.contractAddress);

    try {
      writeContract({
        address: contractConfig.Chainjump.contractAddress as `0x${string}`,
        abi: contractConfig.Chainjump.abi,
        functionName: 'addScore',
        args: [BigInt(score)],
      })
      console.log("🔍 Chainjump - Add score contract called successfully");
    } catch (err) {
      console.error("🔍 Chainjump - Error calling addScore:", err);
    }
  }

  return {
    addScore,
    isPending,
    isConfirming: isPending,
    isSuccess,
    error,
    hash: data,
  }
}
